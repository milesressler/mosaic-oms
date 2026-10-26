package com.mosaicchurchaustin.oms.data.entity.item;

import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
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

import java.time.LocalDate;

/**
 * A pickup of a limited item recorded by hand rather than through an order,
 * e.g. while moving over an old spreadsheet log.
 */
@Entity
@Table(name = "item_limit_entries")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ItemLimitEntryEntity extends BaseEntity {
    public static final String ENTITY_NAME = "ItemLimitEntry";

    @Override
    public String getEntityType() {
        return ENTITY_NAME;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    @ToString.Exclude
    CustomerEntity customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_entity_id")
    @ToString.Exclude
    ItemEntity itemEntity;

    /**
     * Local (America/Chicago) date the customer received the item
     */
    @Column(name = "received_on", nullable = false)
    LocalDate receivedOn;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "notes")
    String notes;

    @ManyToOne
    @JoinColumn(name = "created_by")
    @ToString.Exclude
    UserEntity createdBy;
}
