package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.Calendar;

@Entity
@Table(name = "order_history")
@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OrderHistoryEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(optional = false)
    @ToString.Exclude
    OrderEntity orderEntity;

    @ManyToOne(optional = false)
    @ToString.Exclude
    UserEntity userEntity;

    @Column(name = "timestamp", nullable = false)
    Calendar timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    OrderEventType eventType;


    @PrePersist
    protected void onCreate() {
        this.timestamp = Calendar.getInstance();
    }




}
