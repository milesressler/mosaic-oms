package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderItemResponse {
    private String description;
    private ItemCategory category;
    private Integer quantityRequested;
    private Integer quantityFulfilled;
    private String notes;
    private Long id;
    private SuggestedItemResponse item;
    private Map<String, AttributeDisplay> attributes;
    
    @Builder
    @Getter
    public static class AttributeDisplay {
        private String value;        // Normalized value for editing/backend
        private String displayValue; // User-friendly value for display
    }

    public static OrderItemResponse from(final OrderItemEntity orderItemEntity) {
        return OrderItemResponse.builder()
                .description(orderItemEntity.getItemEntity().getDescription())
                .category(orderItemEntity.getItemEntity().getCategory())
                .quantityFulfilled(orderItemEntity.getQuantityFulfilled())
                .quantityRequested(orderItemEntity.getQuantity())
                .notes(orderItemEntity.getNotes())
                .id(orderItemEntity.getId())
                .item(SuggestedItemResponse.from(orderItemEntity.getItemEntity()))
                .attributes(orderItemEntity.getAttributes().entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> {
                                    var attributeValue = entry.getValue();
                                    
                                    // Check if it's a StringAttribute with both values
                                    if (attributeValue instanceof com.mosaicchurchaustin.oms.data.entity.order.attributes.StringAttribute stringAttr) {
                                        // For now, use the same pattern until Lombok rebuilds
                                        String displayVal = stringAttr.toString(); // This uses our custom toString() method
                                        return AttributeDisplay.builder()
                                                .value(stringAttr.getValue())
                                                .displayValue(displayVal)
                                                .build();
                                    }
                                    
                                    // Fallback for other attribute types or legacy data
                                    String storedValue = attributeValue.toString();
                                    return AttributeDisplay.builder()
                                            .value(storedValue)
                                            .displayValue(storedValue)
                                            .build();
                                }
                        )))
                .build();

    }
}
