package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.request.CreateOrderRequest;
import com.mosaicchurchaustin.oms.data.request.OrderItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderRequest;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import com.mosaicchurchaustin.oms.repositories.OrderItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.services.common.CustomerResolver;
import com.mosaicchurchaustin.oms.specifications.OrderSpecBuilder;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity.ENTITY_NAME;

@Service
public class OrderService {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ItemRepository itemRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    OrderHistoryRepository orderHistoryRepository;

    @Autowired
    CustomerResolver customerResolver;

    @Autowired
    UserService userService;

    @Autowired
    FeaturesService featuresService;

    public List<OrderHistoryEntity> getOrderHistory(final Pageable pageable) {
        return orderHistoryRepository.findAll(pageable).getContent();
    }

    public List<OrderHistoryEntity> getOrderHistory(final Pageable pageable, final Long orderId) {
        return orderHistoryRepository.findAllByOrderEntityId(pageable, orderId).getContent();
    }

    public Page<OrderEntity> getOrders(final Pageable pageable,
                                       final List<String> statusFilters,
                                       final String customer,
                                       final String customerUuid,
                                       final Long orderId,
                                       final boolean onlyMyOrders) {
        final List<OrderStatus> statusList = Stream.ofNullable(statusFilters)
                .flatMap(Collection::stream)
                .map(OrderStatus::from)
                .toList();

        final Specification<OrderEntity> spec = OrderSpecBuilder.create()
                .statuses(statusList)
                .customerName(customer)
                .customerUuid(customerUuid)
                .orderId(orderId)
                .handledByUser(onlyMyOrders ? userService.currentUser().getId() : null)
                .build();
        return orderRepository.findAll(spec, pageable);
    }

    public List<OrderEntity> getDashboardOrders(final Pageable pageable) {
        return orderRepository.findOrdersForDashboard()
                .stream()
                .limit(pageable.getPageSize())
                .toList();
    }

    public OrderEntity getOrder(final String orderUuid) {
        return orderRepository.findByUuid(orderUuid).orElseThrow(() ->
                new EntityNotFoundException(OrderEntity.ENTITY_NAME, orderUuid));
    }

    public OrderEntity getOrder(final Long orderId) {
        return orderRepository.findById(orderId).orElseThrow(() ->
                new EntityNotFoundException(OrderEntity.ENTITY_NAME, orderId.toString()));
    }

    @Transactional
    public OrderItemEntity updateOrderItem(final Long orderItemId, final UpdateOrderItemRequest updateOrderItemRequest) {
        final OrderItemEntity orderItemEntity = orderItemRepository.findById(orderItemId).orElseThrow(() ->
                new EntityNotFoundException(ENTITY_NAME, orderItemId.toString()));

        if (StringUtils.isNotBlank(updateOrderItemRequest.notes())) {
            orderItemEntity.setNotes(updateOrderItemRequest.notes().trim());
        }

        if (updateOrderItemRequest.quantity() != null && updateOrderItemRequest.quantity() > 0) {
            orderItemEntity.setQuantity(updateOrderItemRequest.quantity());
        }

        return orderItemRepository.save(orderItemEntity);
    }
    @Transactional
    public OrderEntity updateOrderItemQuantities(final String orderUuid, final Map<Long, Integer> quantities) {
        final OrderEntity orderEntity = getOrder(orderUuid);
        orderEntity.getOrderItemList().forEach(item -> {
                    final Integer newQuantity = quantities.getOrDefault(item.getId(), item.getQuantityFulfilled());
                    item.setQuantityFulfilled(newQuantity);
                    orderItemRepository.save(item);
                }
        );
        return orderEntity;
    }
    @Transactional
    public OrderEntity assignOrder(final String orderUuid) {
        final OrderEntity orderEntity = getOrder(orderUuid);
        if (orderEntity.getAssignee() != null) {
            throw new InvalidRequestException("Order is already assigned");
        }
        orderEntity.setAssignee(userService.currentUser());
        return orderRepository.save(orderEntity);
    }

    @Transactional
    public OrderEntity unassignOrder(final String orderUuid) {
        final OrderEntity orderEntity = getOrder(orderUuid);
        final UserEntity currentUser = userService.currentUser();
        if (orderEntity.getAssignee().equals(currentUser)) {
            orderEntity.setAssignee(null);
            return orderRepository.save(orderEntity);
        } else {
            throw new InvalidRequestException("You just be the assignee to unassign yourself");
        }
    }

    @Transactional
    public List<OrderEntity> updateOrderStatusBulk(
            final List<String> orderUuids,
            final String orderState) {
        final List<OrderEntity> orders = orderRepository.findAllByUuidIn(orderUuids);
        final Set<String> foundUuids = orders.stream().map(OrderEntity::getUuid).collect(Collectors.toSet());
        if (foundUuids.size() != orderUuids.size()) {
            throw new EntityNotFoundException(OrderEntity.ENTITY_NAME, "bulk");
        }

        final List<OrderEntity> updatedOrders = orders.stream().map(i -> updateOrderStatus(i, orderState)).toList();
        return orderRepository.saveAll(updatedOrders);
    }

    private OrderEntity updateOrderStatus(final OrderEntity orderEntity, final String orderState) {
        final UserEntity currentUser = userService.currentUser();

        final OrderStatus currentOrderStatus = orderEntity.getOrderStatus();
        final OrderStatus orderStatus = OrderStatus.from(orderState);
        orderEntity.setOrderStatus(orderStatus);
        final OrderHistoryEntity orderHistoryEntity = orderHistoryRepository.save(OrderHistoryEntity.builder()
                .orderEntity(orderEntity)
                .orderStatus(orderStatus)
                .previousOrderStatus(currentOrderStatus)
                .userEntity(currentUser)
                .eventType(OrderEventType.STATUS_CHANGE)
                .build());
        orderEntity.getOrderHistoryEntityList().add(orderHistoryEntity);
        orderEntity.setLastStatusChange(orderHistoryEntity);

        if (orderStatus == OrderStatus.ACCEPTED && currentOrderStatus == OrderStatus.PENDING_ACCEPTANCE) {
            orderEntity.setAssignee(currentUser);
        } else if (
            // Clear assignee for everything except these status
                !Set.of(
                        OrderStatus.PACKING,
                        OrderStatus.IN_TRANSIT
                ).contains(orderStatus)) {
            orderEntity.setAssignee(null);
        }
        return orderEntity;
    }

    @Transactional
    public OrderEntity updateOrderStatus(final String orderUuid, final String orderState) {
        final OrderEntity orderEntity = getOrder(orderUuid);
        updateOrderStatus(orderEntity, orderState);
        return orderRepository.save(orderEntity);
    }

    @Transactional
    public OrderEntity updateOrder(final String orderUuid,
                                   final UpdateOrderRequest request) {

        final OrderEntity orderEntity = getOrder(orderUuid);
        final var modifiableStatuses = List.of(OrderStatus.PENDING_ACCEPTANCE, OrderStatus.NEEDS_INFO);
        if (!modifiableStatuses.contains(orderEntity.getOrderStatus())) {
            throw new InvalidRequestException("Cannot modify order with status " + orderEntity.getOrderStatus());
        }

        if (request.optInNotifications() != null) {
            orderEntity.setOptInNotifications(request.optInNotifications());
        }

        if (StringUtils.isNotBlank(request.specialInstructions())) {
            orderEntity.setSpecialInstructions(request.specialInstructions().trim());
        }

        if (StringUtils.isNotBlank(request.customerPhone())) {
            orderEntity.setPhoneNumber(request.customerPhone().trim());
        }

        if (request.removeItems() != null && !request.removeItems().isEmpty()) {
            final Set<Long> currentIds = orderEntity.getOrderItemList().stream()
                    .map(BaseEntity::getId)
                    .collect(Collectors.toSet());

            final Set<Long> removeIds = request.removeItems().stream()
                    .filter(currentIds::contains)
                    .collect(Collectors.toSet());

            orderItemRepository.deleteByIdIn(removeIds);
        }

        final var mappedInserts = Stream.ofNullable(request.upsertItems())
                .flatMap(Collection::stream)
                .filter(i -> i.orderItemId() == null)
                .map(uoir -> new OrderItemRequest(
                        uoir.item(),
                        uoir.notes(),
                        uoir.quantity(),
                        uoir.attributes()
                )).toList();
        addItemsToOrder(orderEntity, mappedInserts);

        final Map<Long, OrderItemEntity> existingItemsById = orderEntity.getOrderItemList().stream()
                .collect(Collectors.toMap(OrderItemEntity::getId, item -> item));

        Stream.ofNullable(request.upsertItems())
                .flatMap(Collection::stream)
                .filter(i -> i.orderItemId() != null)
                .forEach(itemRequest -> {
                    final OrderItemEntity existing = existingItemsById.get(itemRequest.orderItemId());
                    if (existing == null) {
                        throw new InvalidRequestException("Invalid orderItemId: " + itemRequest.orderItemId());
                    }

                    if (itemRequest.quantity() != null) {
                        existing.setQuantity(itemRequest.quantity());
                    }
                    existing.setNotes(StringUtils.isBlank(itemRequest.notes()) ? null : itemRequest.notes().trim());
                    existing.setAttributes(itemRequest.attributes());
                });

        return orderRepository.save(orderEntity);
    }

    @Transactional
    public OrderEntity createOrder(final CreateOrderRequest request) {
        if (!featuresService.getFeaturesConfig().isOrdersOpen()) {
            throw new InvalidRequestException("Orders are not open.");
        }

        final UserEntity userEntity = userService.currentUser();
        final CustomerEntity customer = customerResolver.resolveOrCreate(
                request.customerUuid(),
                request.customerFirstName(),
                request.customerLastName());

        final Boolean optInNotifications = request.optInNotifications() != null && request.optInNotifications();
        final OrderEntity orderEntity = orderRepository.save(OrderEntity.builder()
                .customer(customer)
                .optInNotifications(optInNotifications)
                .specialInstructions(StringUtils.isBlank(request.specialInstructions())
                        ? null : request.specialInstructions().trim())
                .phoneNumber(StringUtils.isBlank(request.customerPhone())
                        ? null : request.customerPhone())
                .orderStatus(OrderStatus.PENDING_ACCEPTANCE)
                .build());

        addItemsToOrder(orderEntity, request.items());

        final OrderHistoryEntity createHistoryItem = orderHistoryRepository.save(
                OrderHistoryEntity.builder()
                        .orderStatus(OrderStatus.PENDING_ACCEPTANCE)
                        .orderEntity(orderEntity)
                        .eventType(OrderEventType.STATUS_CHANGE)
                        .userEntity(userEntity)
                        .build()
        );
        orderEntity.getOrderHistoryEntityList().add(createHistoryItem);
        orderEntity.setLastStatusChange(createHistoryItem);

        return orderEntity;
    }


    private void addItemsToOrder(final OrderEntity orderEntity, List<OrderItemRequest> items) {
        for (final OrderItemRequest item: items) {
            final ItemEntity itemEntity = itemRepository.findById(item.item())
                    .orElseThrow(() -> new EntityNotFoundException(ItemEntity.ENTITY_TYPE, item.item().toString()));

            // Create & save OrderItemEntity first (it's required)
            final OrderItemEntity orderItemEntity = orderItemRepository.save(new OrderItemEntity(
                    orderEntity,
                    itemEntity,
                    item.attributes(),
                    item.notes() == null ? null : item.notes().trim(),
                    item.quantity(),
                    0
            ));

            orderEntity.getOrderItemList().add(orderItemEntity);
        }
    }

//    private ItemEntity queryForItemByPriority(final OrderItemRequest item) {
//        return itemRepository.findByDescription(item.description())
//                .orElseGet(() ->
//                    itemRepository.save(ItemEntity.builder().description(item.description()).isSuggestedItem(false).build())
//        );
//    }


}
