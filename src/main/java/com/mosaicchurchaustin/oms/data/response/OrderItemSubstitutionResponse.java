package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.order.OrderItemSubstitutionEntity;
import com.mosaicchurchaustin.oms.data.entity.order.attributes.StringAttribute;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderItemSubstitutionResponse {
    private String uuid;
    private Long itemId;
    private String itemDescription;
    private Integer quantity;
    private Map<String, OrderItemResponse.AttributeDisplay> attributes;
    private String note;

    public static OrderItemSubstitutionResponse from(final OrderItemSubstitutionEntity entity) {
        final Map<String, OrderItemResponse.AttributeDisplay> attrs = entity.getAttributes() != null
                ? entity.getAttributes().entrySet().stream().collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            final var val = e.getValue();
                            if (val instanceof StringAttribute sa) {
                                return OrderItemResponse.AttributeDisplay.builder()
                                        .value(sa.getValue())
                                        .displayValue(sa.toString())
                                        .build();
                            }
                            final String v = val.toString();
                            return OrderItemResponse.AttributeDisplay.builder()
                                    .value(v)
                                    .displayValue(v)
                                    .build();
                        }))
                : Map.of();

        return OrderItemSubstitutionResponse.builder()
                .uuid(entity.getUuid())
                .itemId(entity.getItem().getId())
                .itemDescription(entity.getItem().getDescription())
                .quantity(entity.getQuantity())
                .attributes(attrs)
                .note(entity.getNote())
                .build();
    }
}
