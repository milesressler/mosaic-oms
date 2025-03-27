package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderItemResponse {
    private String description;
    private ItemCategory category;
    private Integer quantityRequested;
    private Integer quantityFulfilled;
    private String notes;
    private Long id;

    public static OrderItemResponse from(final OrderItemEntity orderItemEntity) {
        return OrderItemResponse.builder()
                .description(orderItemEntity.getItemEntity().getDescription())
                .category(orderItemEntity.getItemEntity().getCategory())
                .quantityFulfilled(orderItemEntity.getQuantityFulfilled())
                .quantityRequested(orderItemEntity.getQuantity())
                .notes(orderItemEntity.getNotes())
                .id(orderItemEntity.getId())
                .build();

    }
}
