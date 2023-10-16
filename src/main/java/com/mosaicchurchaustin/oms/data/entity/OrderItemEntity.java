package com.mosaicchurchaustin.oms.data.entity;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class OrderItemEntity extends BaseEntity {

    @ManyToOne(optional = false)
    @ToString.Exclude
    OrderEntity orderEntity;

    @ManyToOne(optional = false)
    @ToString.Exclude
    ItemEntity itemEntity;

    @Column(name = "notes")
    String notes;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "quantity_fulfilled")
    Integer quantityFulfilled;



}
