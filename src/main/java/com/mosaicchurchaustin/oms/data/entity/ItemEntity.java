package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "items")
public class ItemEntity extends BaseEntity {
    @Column(name = "description")
    String description;

    @Column(name = "is_suggested_item")
    Boolean isSuggestedItem;
}
