package com.mosaicchurchaustin.oms.data.entity.item;

import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.services.audit.AuditLogListener;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@EntityListeners(AuditLogListener.class)
@Table(name = "item_attribute_options")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ItemAttributeOption extends BaseEntity {

    public static String ENTITY_TYPE = "ItemAttributeOption";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }

    @ManyToOne(optional = false)
    @ToString.Exclude
    ItemAttribute itemAttribute;

    @Column(name = "availability")
    @Enumerated(EnumType.STRING)
    ItemAvailability availability;

    /**
     * Display label for the option in the list
     */
    @Column(name = "label")
    String label;

    /**
     * Sluggified label for the option
     */
    @Column(name = "value")
    String value;
}
