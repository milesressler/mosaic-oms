package com.mosaicchurchaustin.oms.data.entity.item;

import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.services.audit.AuditLogListener;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

/**
 * These are attributes that can be set during the order, and represents the settable attributes
 * rather than the actaul values that were selected
 */
@Entity
@EntityListeners(AuditLogListener.class)
@Table(name = "item_attributes")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ItemAttribute extends BaseEntity {

    public static String ENTITY_TYPE = "ItemAttribute";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }

    @ManyToOne(optional = false)
    @ToString.Exclude
    ItemEntity itemEntity;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    ItemAttributeType attributeType;

    /**
     * Display field when presenting the option selector
     */
    @Column(name = "label")
    String label;

    /**
     * Slug to make it easier to identity
     */
    @Column(name = "value")
    String value;

    /**
     * whether the field must be set when ordering
     */
    @Column(name = "required", nullable = false)
    @Setter
    Boolean required;

    @OneToMany(mappedBy = "itemAttribute", fetch = FetchType.EAGER, cascade = CascadeType.REMOVE)
    @BatchSize(size = 100)
    @ToString.Exclude
    final List<ItemAttributeOption> attributeOptions = new ArrayList<>();


}
