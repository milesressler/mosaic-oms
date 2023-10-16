package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import jakarta.persistence.*;

import java.util.Calendar;

@Entity
@Table(name = "order_history")
public class OrderHistoryEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    OrderEntity orderEntity;

    @ManyToOne
    UserEntity userEntity;

    @Column(name = "timestamp")
    Calendar timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    OrderEventType eventType;


    @PrePersist
    protected void onCreate() {
        this.timestamp = Calendar.getInstance();
    }




}
