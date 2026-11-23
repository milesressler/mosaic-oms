package com.mosaicchurchaustin.oms.data.entity.event;

import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * A regular catalog item offered at a special event, with optional stock for that event only.
 */
@Entity
@Table(name = "special_event_items")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SpecialEventItemEntity extends BaseEntity {
    public static final String ENTITY_NAME = "SpecialEventItem";

    @Override
    public String getEntityType() {
        return ENTITY_NAME;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "special_event_id")
    @ToString.Exclude
    SpecialEventEntity specialEvent;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id")
    @ToString.Exclude
    ItemEntity itemEntity;

    /**
     * Stock for this event, counted against the event's orders that are not cancelled or rejected. Null means no limit.
     */
    @Column(name = "quantity_available")
    Integer quantityAvailable;

    @Column(name = "sort_order")
    Integer sortOrder;
}
