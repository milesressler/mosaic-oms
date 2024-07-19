package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.BatchSize;

import java.util.List;

@Entity
@Table(name = "items")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ItemEntity extends BaseEntity {
    @Setter
    @Column(name = "placeholder", nullable = false)
    String placeholder;

    @Column(name = "description", nullable = false)
    String description;

    @Setter
    @Column(name = "is_suggested_item", nullable = false)
    Boolean isSuggestedItem;

    @BatchSize(size = 100)
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "itemEntity")
    List<OrderItemEntity> orderItems;

}
