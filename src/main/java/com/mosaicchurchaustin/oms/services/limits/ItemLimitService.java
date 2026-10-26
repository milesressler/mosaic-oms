package com.mosaicchurchaustin.oms.services.limits;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitEntryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.ItemLimitStatus;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.request.CreateItemLimitEntryRequest;
import com.mosaicchurchaustin.oms.data.response.CreateItemLimitEntryResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerItemLimitResponse;
import com.mosaicchurchaustin.oms.data.response.ItemLimitEntryResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.ItemLimitEntryRepository;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.services.UserService;
import com.mosaicchurchaustin.oms.services.limits.ItemLimitCalculator.Receipt;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ItemLimitService {

    final OrderItemRepository orderItemRepository;
    final ItemRepository itemRepository;
    final CustomerRepository customerRepository;
    final ItemLimitEntryRepository itemLimitEntryRepository;
    final OrderRepository orderRepository;
    final UserService userService;

    /**
     * Live status for every limited item, for the order form and the customer page.
     */
    @Transactional
    public List<CustomerItemLimitResponse> getCustomerItemLimits(final String customerUuid) {
        final CustomerEntity customer = getCustomer(customerUuid);

        final List<ItemEntity> limitedItems = itemRepository.findAllManagedLimitedItems();
        final Map<Long, ItemLimitStatus> statuses = evaluate(customer, limitedItems, Instant.now(), null, Map.of());

        return limitedItems.stream()
                .map(item -> new CustomerItemLimitResponse(
                        item.getId(),
                        item.getDescription(),
                        item.getCategory(),
                        statuses.get(item.getId())))
                .toList();
    }

    /**
     * Records a pickup that happened outside the system. When the order being filled is given, its limit
     * snapshots are re-checked so the filler sees the correction right away; other orders are left as they were.
     */
    @Transactional
    public CreateItemLimitEntryResponse createEntry(final String customerUuid, final CreateItemLimitEntryRequest request) {
        final CustomerEntity customer = getCustomer(customerUuid);
        final ItemEntity item = itemRepository.findById(request.itemId())
                .orElseThrow(() -> new EntityNotFoundException(ItemEntity.ENTITY_TYPE, request.itemId().toString()));
        if (!item.isLimited()) {
            throw new InvalidRequestException(String.format("%s is not a limited item", item.getDescription()));
        }
        if (request.receivedOn().isAfter(LocalDate.now(ItemLimitCalculator.ZONE))) {
            throw new InvalidRequestException("Date received cannot be in the future");
        }

        final OrderEntity order = StringUtils.isBlank(request.orderUuid()) ? null
                : orderRepository.findByUuid(request.orderUuid())
                    .orElseThrow(() -> new EntityNotFoundException(OrderEntity.ENTITY_NAME, request.orderUuid()));
        if (order != null && !order.getCustomer().getId().equals(customer.getId())) {
            throw new InvalidRequestException("Order belongs to a different customer");
        }

        final ItemLimitEntryEntity entry = itemLimitEntryRepository.save(ItemLimitEntryEntity.builder()
                .customer(customer)
                .itemEntity(item)
                .receivedOn(request.receivedOn())
                .quantity(request.quantity())
                .notes(StringUtils.isBlank(request.notes()) ? null : request.notes().trim())
                .createdBy(userService.currentUser())
                .build());

        final Map<Long, ItemLimitStatus> orderItemSnapshots;
        if (order != null) {
            applySnapshots(order);
            orderItemSnapshots = order.getOrderItemList().stream()
                    .filter(orderItem -> orderItem.getLimitSnapshot() != null)
                    .collect(Collectors.toMap(OrderItemEntity::getId, OrderItemEntity::getLimitSnapshot));
        } else {
            orderItemSnapshots = Map.of();
        }

        return new CreateItemLimitEntryResponse(ItemLimitEntryResponse.from(entry), orderItemSnapshots);
    }

    @Transactional
    public void deleteEntry(final String customerUuid, final Long entryId) {
        final ItemLimitEntryEntity entry = itemLimitEntryRepository.findById(entryId)
                .filter(found -> found.getCustomer().getUuid().equals(customerUuid))
                .orElseThrow(() -> new EntityNotFoundException(ItemLimitEntryEntity.ENTITY_NAME, entryId.toString()));
        itemLimitEntryRepository.delete(entry);
    }

    /**
     * Records each limited line's status on the order as it stands right now, so later rule changes
     * don't alter what the order shows. Items that are not limited have their snapshot cleared.
     */
    @Transactional
    public void applySnapshots(final OrderEntity orderEntity) {
        final List<OrderItemEntity> orderItems = orderEntity.getOrderItemList();

        final Map<Long, ItemEntity> limitedItems = orderItems.stream()
                .map(OrderItemEntity::getItemEntity)
                .filter(ItemEntity::isLimited)
                .collect(Collectors.toMap(ItemEntity::getId, Function.identity(), (a, b) -> a));

        // The same item can appear on more than one line (e.g. two sizes of socks)
        final Map<Long, Integer> requestedByItem = orderItems.stream()
                .filter(orderItem -> limitedItems.containsKey(orderItem.getItemEntity().getId()))
                .collect(Collectors.groupingBy(
                        orderItem -> orderItem.getItemEntity().getId(),
                        Collectors.summingInt(orderItem -> Objects.requireNonNullElse(orderItem.getQuantity(), 0))));

        final Map<Long, ItemLimitStatus> statuses = evaluate(
                orderEntity.getCustomer(), limitedItems.values(), Instant.now(), orderEntity.getId(), requestedByItem);

        orderItems.forEach(orderItem -> orderItem.setLimitSnapshot(statuses.get(orderItem.getItemEntity().getId())));
        orderItemRepository.saveAll(orderItems);
    }

    private Map<Long, ItemLimitStatus> evaluate(final CustomerEntity customer,
                                                final Collection<ItemEntity> limitedItems,
                                                final Instant asOf,
                                                final Long excludeOrderId,
                                                final Map<Long, Integer> requestedByItem) {
        if (limitedItems.isEmpty()) {
            return Map.of();
        }

        final List<Long> itemIds = limitedItems.stream().map(ItemEntity::getId).toList();

        final Stream<Map.Entry<Long, Receipt>> fromOrders = orderItemRepository.findCompletedReceipts(
                        customer.getId(), itemIds, excludeOrderId, OrderStatus.COMPLETED, OrderEventType.STATUS_CHANGE)
                .stream()
                .map(receipt -> Map.entry(receipt.getItemId(), new Receipt(
                        // Fall back to the order's last update if the completion history entry is missing
                        receipt.getCompletedAt() != null ? receipt.getCompletedAt() : receipt.getOrderUpdated(),
                        Objects.requireNonNullElse(receipt.getQuantity(), 0))));

        final Stream<Map.Entry<Long, Receipt>> fromManualEntries = itemLimitEntryRepository
                .findAllByCustomerIdAndItemEntityIdIn(customer.getId(), itemIds)
                .stream()
                .map(entry -> Map.entry(entry.getItemEntity().getId(), new Receipt(
                        entry.getReceivedOn().atStartOfDay(ItemLimitCalculator.ZONE).toInstant(),
                        entry.getQuantity())));

        final Map<Long, List<Receipt>> receiptsByItem = Stream.concat(fromOrders, fromManualEntries)
                .collect(Collectors.groupingBy(
                        Map.Entry::getKey,
                        Collectors.mapping(Map.Entry::getValue, Collectors.toList())));

        return limitedItems.stream().collect(Collectors.toMap(
                ItemEntity::getId,
                item -> ItemLimitCalculator.evaluate(
                        item.getLimitRule(),
                        receiptsByItem.getOrDefault(item.getId(), List.of()),
                        asOf,
                        requestedByItem.get(item.getId()))));
    }

    private CustomerEntity getCustomer(final String customerUuid) {
        return customerRepository.findByUuid(customerUuid)
                .orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, customerUuid));
    }
}
