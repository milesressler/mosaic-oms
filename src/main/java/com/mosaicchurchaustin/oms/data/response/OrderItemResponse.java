package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.attributes.StringAttribute;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderItemResponse {
    private String description;
    private ItemCategory category;
    private Integer quantityRequested;
    private Integer quantityFulfilled;
    private Integer totalHandled;
    private boolean substituted;
    private String notes;
    private Long id;
    private SuggestedItemResponse item;
    private Map<String, AttributeDisplay> attributes;
    private List<OrderItemSubstitutionResponse> substitutions;

    @Builder
    @Getter
    public static class AttributeDisplay {
        private String value;        // Normalized value for editing/backend
        private String displayValue; // User-friendly value for display
    }

    public static OrderItemResponse from(final OrderItemEntity orderItemEntity) {
        final List<OrderItemSubstitutionResponse> subs = orderItemEntity.getSubstitutions().stream()
                .map(OrderItemSubstitutionResponse::from)
                .collect(Collectors.toList());

        return OrderItemResponse.builder()
                .description(orderItemEntity.getItemEntity().getDescription())
                .category(orderItemEntity.getItemEntity().getCategory())
                .quantityFulfilled(orderItemEntity.getQuantityFulfilled())
                .quantityRequested(orderItemEntity.getQuantity())
                .totalHandled(orderItemEntity.getTotalHandled())
                .substituted(!subs.isEmpty())
                .notes(orderItemEntity.getNotes())
                .id(orderItemEntity.getId())
                .item(SuggestedItemResponse.from(orderItemEntity.getItemEntity()))
                .substitutions(subs)
                .attributes(orderItemEntity.getAttributes().entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> {
                                    final var attributeValue = entry.getValue();

                                    if (attributeValue instanceof StringAttribute stringAttr) {
                                        return AttributeDisplay.builder()
                                                .value(stringAttr.getValue())
                                                .displayValue(stringAttr.toString())
                                                .build();
                                    }

                                    final String storedValue = attributeValue.toString();
                                    return AttributeDisplay.builder()
                                            .value(storedValue)
                                            .displayValue(storedValue)
                                            .build();
                                }
                        )))
                .build();
    }
}
