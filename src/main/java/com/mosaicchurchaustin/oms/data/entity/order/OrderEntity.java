package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.services.audit.AuditLogListener;
import com.mosaicchurchaustin.oms.services.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.JoinFormula;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditLogListener.class)
public class OrderEntity extends BaseUuidEntity implements Auditable {

    public static String ENTITY_NAME = "Order";

    @ManyToOne(optional = false)
    CustomerEntity customer; //TODO: change to first, last name

    @ManyToOne(optional = false)
    CustomerEntity first;

    @ManyToOne(optional = false)
    CustomerEntity last;

    @ManyToOne()
    @JoinColumn(name = "assignee")
    UserEntity assignee;

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

    @Transient
    @Getter
    Map<String, String> previousState;

    @Override
    public String getEntityType() {
        return ENTITY_NAME;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        this.orderStatus = OrderStatus.PENDING_ACCEPTANCE;
    }

    @Override
    public void stashState() {
        this.previousState = getCurrentState();

    }

    @Override
    public Map<String, String> getCurrentState() {
        return Map.of(
                "specialInstructions", StringUtils.defaultIfBlank(specialInstructions, ""),
                "orderStatus", orderStatus.name(),
                "assignee", Optional.ofNullable(assignee).map(UserEntity::getExternalId).orElse(""),
                "cartId", StringUtils.defaultIfBlank(cartId, "")
        );
    }
}
