package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
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

    @Column(name = "cart_id")
    String cartId;

    @OneToMany(mappedBy = "orderEntity")
    @ToString.Exclude
    final List<OrderHistoryEntity> orderHistoryEntityList = new ArrayList<>();

    @OneToMany(mappedBy = "orderEntity")
    @ToString.Exclude
    final List<OrderItemEntity> orderItemList = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    OrderStatus orderStatus;

    @ManyToOne(fetch = FetchType.EAGER)
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
