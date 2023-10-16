package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.request.CreateOrderRequest;
import com.mosaicchurchaustin.oms.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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


    @Transactional
    public OrderEntity createOrder(final CreateOrderRequest request) {
        final CustomerEntity customer = customerRepository.findByName(request.customerName())
                .orElseGet(() -> createCustomer(request));

        final Boolean optInNotifications = request.optInNotifications() != null && request.optInNotifications();
        final OrderEntity orderEntity = orderRepository.save(OrderEntity.builder()
                .customer(customer)
                .optInNotifications(optInNotifications)
                .specialInstructions(request.specialInstructions() == null ? null : request.specialInstructions().trim())
                .build());


        addItemsToOrder(orderEntity, request.items());

        // Create order history
        // TODO need user
        orderHistoryRepository.save(OrderHistoryEntity.builder().orderStatus(OrderStatus.CREATED)
                .orderEntity(orderEntity).eventType(OrderEventType.STATUS_CHANGE).build());

        return orderEntity;
    }

    private void addItemsToOrder(final OrderEntity orderEntity, List<CreateOrderRequest.Item> items) {
        for (final CreateOrderRequest.Item item: items) {
            final ItemEntity itemEntity = itemRepository.findByDescription(item.description()).orElseGet(() ->
                    itemRepository.save(ItemEntity.builder().description(item.description()).isSuggestedItem(false).build())
            );

            orderEntity.getOrderItemList().add(
                    orderItemRepository.save(new OrderItemEntity(
                            orderEntity, itemEntity, item.notes() == null ? null : item.notes().trim(), item.quantity(), 0
                    ))
            );
        }
    }

    private CustomerEntity createCustomer(final CreateOrderRequest request) {
        final String name = request.customerName() == null || request.customerName().isBlank()
                ? null : request.customerName().trim();
        final String phone = request.customerPhone() == null || request.customerPhone().isBlank()
                ? null : request.customerPhone();

        return customerRepository.save(new CustomerEntity(name, phone));
    }

}
