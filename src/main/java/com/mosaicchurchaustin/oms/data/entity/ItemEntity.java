package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "items")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ItemEntity extends BaseEntity {
    @Column(name = "placeholder", nullable = false)
    String placeholder;

    @Column(name = "description", nullable = false)
    String description;

    @Column(name = "is_suggested_item", nullable = false)
    Boolean isSuggestedItem;
}
