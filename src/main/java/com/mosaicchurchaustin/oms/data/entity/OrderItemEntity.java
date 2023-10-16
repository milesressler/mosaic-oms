package com.mosaicchurchaustin.oms.data.entity;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItemEntity extends BaseEntity {

    @ManyToOne(optional = false)
    OrderEntity orderEntity;

    @ManyToOne(optional = false)
    ItemEntity itemEntity;

    @Column(name = "notes")
    String notes;

    @Column(name = "quantity")
    Integer quantity;

    @Column(name = "quantity_fulfilled")
    Integer quantityFulfilled;



}
