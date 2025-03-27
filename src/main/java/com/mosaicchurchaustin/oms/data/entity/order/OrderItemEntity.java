package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.attributes.AttributeValue;
import com.mosaicchurchaustin.oms.support.converters.ItemAttributeJsonConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Entity
@Table(name = "order_items")
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class OrderItemEntity extends BaseEntity {
    public static final String ENTITY_NAME = "orderItem";

    @Override
    public String getEntityType() {
        return ENTITY_NAME;
    }

    @ManyToOne(optional = false)
    @ToString.Exclude
    OrderEntity orderEntity;

    @ManyToOne(optional = false)
    @ToString.Exclude
    ItemEntity itemEntity;

    @Column(name = "attributes", columnDefinition = "JSON") // Works for MySQL & PostgreSQL
    @Convert(converter = ItemAttributeJsonConverter.class)
    private Map<String, AttributeValue> attributes;

    @Column(name = "notes")
    String notes;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "quantity_fulfilled")
    Integer quantityFulfilled;



}
