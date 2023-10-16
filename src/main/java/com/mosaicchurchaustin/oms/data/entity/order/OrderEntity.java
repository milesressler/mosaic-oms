package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderEntity extends BaseUuidEntity {

    @ManyToOne
    CustomerEntity customer;

    @Column(name = "opt_in_notifications", nullable = false)
    Boolean optInNotifications;

    @Column(name = "special_instructions")
    String specialInstructions;

    @OneToMany(mappedBy = "orderEntity")
    @ToString.Exclude
    final List<OrderHistoryEntity> orderHistoryEntityList = new ArrayList<>();

    @OneToMany(mappedBy = "orderEntity")
    @ToString.Exclude
    final List<OrderItemEntity> orderItemList = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    OrderStatus orderStatus;

    @Override
    protected void onCreate() {
        super.onCreate();
        this.orderStatus = OrderStatus.CREATED;
    }
}
