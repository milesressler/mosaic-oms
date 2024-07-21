package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.request.CreateOrderRequest;
import com.mosaicchurchaustin.oms.data.request.OrderItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderRequest;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import com.mosaicchurchaustin.oms.repositories.OrderItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.mosaicchurchaustin.oms.data.entity.OrderItemEntity.ENTITY_NAME;

@Service
public class OrderService {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    ItemRepository itemRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    OrderHistoryRepository orderHistoryRepository;

    @Autowired
    UserService userService;

    public List<OrderHistoryEntity> getOrderHistory() {
        final Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Order.desc("timestamp")));

        return orderHistoryRepository.findAll(pageable).getContent();
    }

    public List<OrderHistoryEntity> getOrderHistory(final Long orderId) {
        final Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Order.desc("timestamp")));
        return orderHistoryRepository.findAllByOrderEntityId(pageable, orderId).getContent();
    }

    public Page<OrderEntity> getOrders(final Pageable pageable, final List<String> statusFilters) {
        final List<OrderStatus> orderStatusList = statusFilters != null && statusFilters.size() > 0 ?
                statusFilters.stream().map(OrderStatus::from).toList() :
                Arrays.stream(OrderStatus.values()).toList();

        return orderRepository.findAllByOrderStatusIn(
                pageable,
                orderStatusList);
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
    public OrderEntity updateOrderStatus(final String orderUuid, final String orderState) {
        final OrderEntity orderEntity = getOrder(orderUuid);
        final OrderStatus orderStatus = OrderStatus.from(orderState);
        orderEntity.setOrderStatus(orderStatus);
        final OrderHistoryEntity orderHistoryEntity = orderHistoryRepository.save(OrderHistoryEntity.builder()
                .orderEntity(orderEntity)
                .orderStatus(orderStatus)
                .userEntity(userService.currentUser())
                .eventType(OrderEventType.STATUS_CHANGE)
                .build());
        orderEntity.getOrderHistoryEntityList().add(orderHistoryEntity);
        orderEntity.setLastStatusChange(orderHistoryEntity);
        return orderRepository.save(orderEntity);
    }

    @Transactional
    public OrderEntity updateOrder(final String orderUuid,
                                   final UpdateOrderRequest request) {

        final OrderEntity orderEntity = getOrder(orderUuid);

        if (request.optInNotifications() != null) {
            orderEntity.setOptInNotifications(request.optInNotifications());
        }

        if (StringUtils.isNotBlank(request.specialInstructions())) {
            orderEntity.setSpecialInstructions(request.specialInstructions().trim());
        }

        if (StringUtils.isNotBlank(request.customerPhone())) {
            orderEntity.setPhoneNumber(request.customerPhone().trim());
        }

        // TODO figure out what can be updated - ie, once being fulfilled, can items still be changed?
        if (StringUtils.isNotBlank(request.customerName())) {
            final CustomerEntity customer = getOrCreateCustomer(request.customerName());
            orderEntity.setCustomer(customer);
        }

        if (request.removeItems() != null && !request.removeItems().isEmpty()) {
            final Set<Long> removeIds = request.removeItems().stream().filter(itemId ->
                    orderEntity.getOrderItemList().stream().map(BaseEntity::getId).collect(Collectors.toSet()).contains(itemId))
                    .collect(Collectors.toSet());
            orderItemRepository.deleteByIdIn(removeIds);
        }

        if (request.addItems() != null && !request.addItems().isEmpty()) {
            addItemsToOrder(orderEntity, request.addItems());
        }

        if (request.setItems() != null && !request.setItems().isEmpty()) {
            throw new RuntimeException("SetItems not yet supported.");
        }

        return orderRepository.save(orderEntity);
    }

    @Transactional
    public OrderEntity createOrder(final CreateOrderRequest request) {
        final UserEntity userEntity = userService.currentUser();
        final CustomerEntity customer = getOrCreateCustomer(request.customerName());

        final Boolean optInNotifications = request.optInNotifications() != null && request.optInNotifications();
        final OrderEntity orderEntity = orderRepository.save(OrderEntity.builder()
                .customer(customer)
                .optInNotifications(optInNotifications)
                .specialInstructions(StringUtils.isBlank(request.specialInstructions())
                        ? null : request.specialInstructions().trim())
                .phoneNumber(StringUtils.isBlank(request.customerPhone())
                        ? null : request.customerPhone())
                .orderStatus(OrderStatus.CREATED)
                .build());

        addItemsToOrder(orderEntity, request.items());

        final OrderHistoryEntity createHistoryItem = orderHistoryRepository.save(
                OrderHistoryEntity.builder()
                        .orderStatus(OrderStatus.CREATED)
                        .orderEntity(orderEntity)
                        .eventType(OrderEventType.STATUS_CHANGE)
                        .userEntity(userEntity)
                        .build()
        );
        orderEntity.getOrderHistoryEntityList().add(createHistoryItem);
        orderEntity.setLastStatusChange(createHistoryItem);

        return orderEntity;
    }

    private CustomerEntity getOrCreateCustomer(final String nameInput) {
        return customerRepository.findByName(nameInput.trim())
                .orElseGet(() -> {
                    final String name = nameInput.isBlank()
                            ? null : nameInput.trim();
                    return customerRepository.save(new CustomerEntity(name));
                });
    }

    private void addItemsToOrder(final OrderEntity orderEntity, List<OrderItemRequest> items) {
        for (final OrderItemRequest item: items) {
            final ItemEntity itemEntity = itemRepository.findByDescription(item.description()).orElseGet(() ->
                    itemRepository.findByDescriptionAndRemovedIsTrue(item.description()).orElseGet(() ->
                        itemRepository .save(ItemEntity.builder().description(item.description()).isSuggestedItem(false).build())
            ));

            orderEntity.getOrderItemList().add(
                    orderItemRepository.save(new OrderItemEntity(
                            orderEntity, itemEntity, item.notes() == null ? null : item.notes().trim(), item.quantity(), 0
                    ))
            );
        }
    }

}
