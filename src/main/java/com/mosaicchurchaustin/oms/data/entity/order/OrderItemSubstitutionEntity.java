package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.attributes.AttributeValue;
import com.mosaicchurchaustin.oms.support.converters.ItemAttributeJsonConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Entity
@Table(name = "order_item_substitution")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemSubstitutionEntity extends BaseUuidEntity {

    @Override
    public String getEntityType() {
        return "orderItemSubstitution";
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItemEntity orderItem;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ItemEntity item;

    @Column(name = "attributes", columnDefinition = "JSON")
    @Convert(converter = ItemAttributeJsonConverter.class)
    private Map<String, AttributeValue> attributes;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
