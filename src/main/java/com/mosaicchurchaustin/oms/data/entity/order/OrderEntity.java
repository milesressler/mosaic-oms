package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.JoinFormula;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderEntity extends BaseUuidEntity {

    public static String ENTITY_NAME = "order";

    @ManyToOne(optional = false)
    CustomerEntity customer;

    @Column(name = "opt_in_notifications", nullable = false)
    Boolean optInNotifications;

    @Column(name = "phone_number")
    String phoneNumber;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinFormula("(" +
            "SELECT h.id " +
            "FROM order_history h " +
            "WHERE h.order_entity_id = id " +
            "AND h.type = 'STATUS_CHANGE'" +
            "ORDER BY h.timestamp DESC " +
            "LIMIT 1" +
            ")")
    OrderHistoryEntity lastStatusChange;

    @Override
    protected void onCreate() {
        super.onCreate();
        this.orderStatus = OrderStatus.CREATED;
    }
}
