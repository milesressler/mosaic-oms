package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "orders")
public class OrderEntity extends BaseUuidEntity {

    @ManyToOne
    CustomerEntity customer;

    @Column(name = "opt_in_notifications")
    Boolean optInNotifications;

    @Column(name = "special_instructions")
    String specialInstructions;

    @OneToMany
    List<OrderHistoryEntity> orderHistoryEntityList;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    OrderStatus orderStatus;

//    @Formula("(SELECT COALESCE(SUM(p.amount),0) FROM products p " +
//            "INNER JOIN categories c ON p.category_id=c.id " +
//            "WHERE p.category_id=id)")
//    OrderHistoryEntity latestStatus;
}
