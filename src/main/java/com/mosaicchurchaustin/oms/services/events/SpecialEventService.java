package com.mosaicchurchaustin.oms.services.events;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventEntity;
import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventItemEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemAvailability;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.request.CreateSpecialEventOrderRequest;
import com.mosaicchurchaustin.oms.data.request.SpecialEventItemRequest;
import com.mosaicchurchaustin.oms.data.request.SpecialEventRequest;
import com.mosaicchurchaustin.oms.data.response.SpecialEventCustomerOrderResponse;
import com.mosaicchurchaustin.oms.data.response.SpecialEventItemResponse;
import com.mosaicchurchaustin.oms.data.response.SpecialEventResponse;
import com.mosaicchurchaustin.oms.data.response.SuggestedItemResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.FeatureConfigRepository;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.repositories.SpecialEventItemRepository;
import com.mosaicchurchaustin.oms.repositories.SpecialEventRepository;
import com.mosaicchurchaustin.oms.services.FeaturesService;
import com.mosaicchurchaustin.oms.services.OrderService;
import com.mosaicchurchaustin.oms.services.common.CustomerResolver;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class SpecialEventService {

    /** Orders in these statuses don't use up event stock */
    public static final List<OrderStatus> RELEASED_STATUSES = List.of(OrderStatus.CANCELLED, OrderStatus.REJECTED);

    final SpecialEventRepository specialEventRepository;
    final SpecialEventItemRepository specialEventItemRepository;
    final ItemRepository itemRepository;
    final OrderRepository orderRepository;
    final OrderItemRepository orderItemRepository;
    final CustomerRepository customerRepository;
    final FeatureConfigRepository featureConfigRepository;
    final CustomerResolver customerResolver;
    final FeaturesService featuresService;
    final OrderService orderService;

    // ---- Admin ----

    @Transactional
    public List<SpecialEventResponse> getAllEvents() {
        final Long activeId = activeEventId().orElse(null);
        return specialEventRepository.findAllByOrderByCreatedDesc().stream()
                .map(event -> toResponse(event, Objects.equals(event.getId(), activeId)))
                .toList();
    }

    @Transactional
    public SpecialEventResponse getEvent(final String uuid) {
        final SpecialEventEntity event = findByUuid(uuid);
        return toResponse(event, isActive(event));
    }

    @Transactional
    public SpecialEventResponse createEvent(final SpecialEventRequest request) {
        final SpecialEventEntity event = SpecialEventEntity.builder()
                .name(request.name().trim())
                .eventDate(request.eventDate())
                .itemsPerGuest(request.itemsPerGuest())
                .build();
        applyItems(event, request.items());
        return toResponse(specialEventRepository.save(event), false);
    }

    @Transactional
    public SpecialEventResponse updateEvent(final String uuid, final SpecialEventRequest request) {
        final SpecialEventEntity event = findByUuid(uuid);
        event.setName(request.name().trim());
        event.setEventDate(request.eventDate());
        event.setItemsPerGuest(request.itemsPerGuest());
        applyItems(event, request.items());
        final SpecialEventEntity saved = specialEventRepository.save(event);

        final boolean active = isActive(saved);
        if (active) {
            // Order takers' nav shows the event name from the cached feature config
            featuresService.setActiveSpecialEvent(saved);
        }
        return toResponse(saved, active);
    }

    @Transactional
    public void deleteEvent(final String uuid) {
        final SpecialEventEntity event = findByUuid(uuid);
        if (isActive(event)) {
            throw new InvalidRequestException("Stop the event before deleting it");
        }
        if (orderRepository.existsBySpecialEventId(event.getId())) {
            throw new InvalidRequestException("This event has orders, so it can't be deleted");
        }
        specialEventRepository.delete(event);
    }

    /**
     * Makes the event the one order takers see, replacing any other active event. Pass null to stop all events.
     */
    @Transactional
    public void setActiveEvent(final String uuid) {
        final SpecialEventEntity event = uuid == null ? null : findByUuid(uuid);
        if (event != null && event.getItems().isEmpty()) {
            throw new InvalidRequestException("Add at least one item before starting the event");
        }
        featuresService.setActiveSpecialEvent(event);
    }

    // ---- Order takers ----

    /**
     * The event order takers should see, with live stock, or empty when no event is running.
     */
    @Transactional
    public Optional<SpecialEventResponse> getActiveEvent() {
        return activeEventId()
                .flatMap(specialEventRepository::findById)
                .map(event -> toResponse(event, true));
    }

    @Transactional
    public List<SpecialEventCustomerOrderResponse> getCustomerOrders(final String eventUuid, final String customerUuid) {
        final SpecialEventEntity event = findByUuid(eventUuid);
        final CustomerEntity customer = customerRepository.findByUuid(customerUuid)
                .orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, customerUuid));
        return orderRepository.findAllByCustomerIdAndSpecialEventIdAndOrderStatusNotIn(
                        customer.getId(), event.getId(), RELEASED_STATUSES).stream()
                .map(SpecialEventCustomerOrderResponse::from)
                .toList();
    }

    @Transactional
    public OrderEntity createOrder(final String eventUuid, final CreateSpecialEventOrderRequest request) {
        final SpecialEventEntity event = findByUuid(eventUuid);
        if (!isActive(event)) {
            throw new InvalidRequestException(event.getName() + " is not running right now");
        }

        final Set<Long> itemIds = new LinkedHashSet<>(request.itemIds());
        if (itemIds.size() != request.itemIds().size()) {
            throw new InvalidRequestException("Each item can only be picked once");
        }
        if (itemIds.size() > event.getItemsPerGuest()) {
            throw new InvalidRequestException(event.getItemsPerGuest() == 1
                    ? "Only one item can be picked"
                    : "Only " + event.getItemsPerGuest() + " items can be picked");
        }

        final CustomerEntity customer = customerResolver.resolveOrCreate(
                request.customerUuid(), request.customerFirstName(), request.customerLastName());
        if (request.customerNameObfuscated() != null) {
            customer.setObfuscateName(request.customerNameObfuscated());
            customerRepository.save(customer);
        }

        if (!Boolean.TRUE.equals(request.allowAdditional()) && customer.getId() != null
                && !orderRepository.findAllByCustomerIdAndSpecialEventIdAndOrderStatusNotIn(
                        customer.getId(), event.getId(), RELEASED_STATUSES).isEmpty()) {
            throw new InvalidRequestException(
                    customer.getFirstName() + " already has an order for " + event.getName());
        }

        // Lock the event's lines for these items before counting, so the last unit can only be claimed once
        final Map<Long, SpecialEventItemEntity> lines = specialEventItemRepository.findForUpdate(event.getId(), itemIds)
                .stream()
                .collect(Collectors.toMap(line -> line.getItemEntity().getId(), Function.identity()));
        final Map<Long, Long> claimed = orderItemRepository.countClaimedForSpecialEventLocking(
                        event.getId(), RELEASED_STATUSES.stream().map(OrderStatus::name).toList()).stream()
                .collect(Collectors.toMap(
                        OrderItemRepository.ItemClaimCount::getItemId,
                        count -> Objects.requireNonNullElse(count.getClaimed(), 0L)));

        for (final Long itemId : itemIds) {
            final SpecialEventItemEntity line = lines.get(itemId);
            if (line == null) {
                throw new InvalidRequestException("That item isn't part of " + event.getName());
            }
            final String description = line.getItemEntity().getDescription();
            if (line.getItemEntity().getAvailability() != ItemAvailability.AVAILABLE) {
                throw new InvalidRequestException(StringUtils.capitalize(description) + " is unavailable. Pick another item.");
            }
            if (line.getQuantityAvailable() != null
                    && claimed.getOrDefault(itemId, 0L) + 1 > line.getQuantityAvailable()) {
                throw new InvalidRequestException(StringUtils.capitalize(description) + " just ran out. Pick another item.");
            }
        }

        final List<ItemEntity> items = itemIds.stream().map(itemId -> lines.get(itemId).getItemEntity()).toList();
        return orderService.createSpecialEventOrder(event, customer, items);
    }

    // ---- Helpers ----

    private void applyItems(final SpecialEventEntity event, final List<SpecialEventItemRequest> requests) {
        final Set<Long> seen = new HashSet<>();
        for (final SpecialEventItemRequest request : requests) {
            if (!seen.add(request.itemId())) {
                throw new InvalidRequestException("An item can only be added to an event once");
            }
        }

        final Map<Long, SpecialEventItemEntity> existing = event.getItems().stream()
                .collect(Collectors.toMap(line -> line.getItemEntity().getId(), Function.identity()));
        // Keep existing lines (and their ids) so items that stay on the event aren't deleted and re-added
        event.getItems().removeIf(line -> !seen.contains(line.getItemEntity().getId()));

        IntStream.range(0, requests.size()).forEach(index -> {
            final SpecialEventItemRequest request = requests.get(index);
            final SpecialEventItemEntity line = Optional.ofNullable(existing.get(request.itemId()))
                    .orElseGet(() -> {
                        final ItemEntity item = itemRepository.findById(request.itemId())
                                .orElseThrow(() -> new EntityNotFoundException(ItemEntity.ENTITY_TYPE, request.itemId().toString()));
                        final SpecialEventItemEntity created = SpecialEventItemEntity.builder()
                                .specialEvent(event)
                                .itemEntity(item)
                                .build();
                        event.getItems().add(created);
                        return created;
                    });
            line.setQuantityAvailable(request.quantityAvailable());
            line.setSortOrder(index);
        });
        event.getItems().sort((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()));
    }

    private Map<Long, Long> claimedByItem(final SpecialEventEntity event) {
        if (event.getId() == null) {
            return Map.of();
        }
        return orderItemRepository.countClaimedForSpecialEvent(event.getId(), RELEASED_STATUSES).stream()
                .collect(Collectors.toMap(
                        OrderItemRepository.ItemClaimCount::getItemId,
                        count -> Objects.requireNonNullElse(count.getClaimed(), 0L)));
    }

    private SpecialEventResponse toResponse(final SpecialEventEntity event, final boolean active) {
        final Map<Long, Long> claimed = claimedByItem(event);
        return SpecialEventResponse.builder()
                .uuid(event.getUuid())
                .name(event.getName())
                .eventDate(event.getEventDate())
                .itemsPerGuest(event.getItemsPerGuest())
                .active(active)
                .hasOrders(!claimed.isEmpty() || (event.getId() != null && orderRepository.existsBySpecialEventId(event.getId())))
                .items(event.getItems().stream().map(line -> {
                    final long claimedCount = claimed.getOrDefault(line.getItemEntity().getId(), 0L);
                    return SpecialEventItemResponse.builder()
                            .item(SuggestedItemResponse.from(line.getItemEntity()))
                            .quantityAvailable(line.getQuantityAvailable())
                            .claimed(claimedCount)
                            .remaining(line.getQuantityAvailable() == null
                                    ? null
                                    : (int) Math.max(0, line.getQuantityAvailable() - claimedCount))
                            .build();
                }).toList())
                .build();
    }

    private boolean isActive(final SpecialEventEntity event) {
        return activeEventId().map(id -> id.equals(event.getId())).orElse(false);
    }

    /** Read from the database, not the feature cache, so stock checks never use a stale active event */
    private Optional<Long> activeEventId() {
        return Optional.ofNullable(featureConfigRepository.findFirstByOrderByIdDesc().getActiveSpecialEvent())
                .map(SpecialEventEntity::getId);
    }

    private SpecialEventEntity findByUuid(final String uuid) {
        return specialEventRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException(SpecialEventEntity.ENTITY_NAME, uuid));
    }
}
