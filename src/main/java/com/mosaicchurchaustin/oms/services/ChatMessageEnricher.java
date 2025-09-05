package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageEntity;
import com.mosaicchurchaustin.oms.data.projections.OrderPreviewProjection;
import com.mosaicchurchaustin.oms.data.response.ChatMessageResponse;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import com.mosaicchurchaustin.oms.data.response.UserResponse;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageEnricher {

    private final OrderRepository orderRepository;

    public ChatMessageResponse enrichMessageWithOrderDetails(final ChatMessageEntity message) {
        final ChatMessageResponse baseResponse = ChatMessageResponse.from(message);
        
        // Extract order IDs from the message content
        final String[] orderReferences = baseResponse.getOrderReferences();
        if (orderReferences.length == 0) {
            // No order references, return base response with empty order details
            baseResponse.setOrderDetails(new OrderResponse[0]);
            return baseResponse;
        }

        // Convert string IDs to Long and fetch order previews
        final List<Long> orderIds = Arrays.stream(orderReferences)
                .map(Long::parseLong)
                .toList();

        final List<OrderPreviewProjection> orderPreviews = orderRepository.findOrderPreviewsByIds(orderIds);
        
        // Convert projections to OrderResponse objects
        final OrderResponse[] orderDetails = orderPreviews.stream()
                .map(this::convertProjectionToOrderResponse)
                .toArray(OrderResponse[]::new);

        baseResponse.setOrderDetails(orderDetails);
        return baseResponse;
    }

    private OrderResponse convertProjectionToOrderResponse(final OrderPreviewProjection projection) {
        return OrderResponse.builder()
                .id(projection.getId())
                .orderStatus(projection.getOrderStatus())
                .customer(OrderResponse.Customer.builder()
                        .firstName(projection.getCustomerFirstName())
                        .lastName(projection.getCustomerLastName())
                        .build())
                .assignee(projection.getAssigneeName() != null ? 
                    UserResponse.builder()
                            .name(projection.getAssigneeName())
                            .uuid(projection.getAssigneeUuid())
                            .build() : null)
                .build();
    }
}