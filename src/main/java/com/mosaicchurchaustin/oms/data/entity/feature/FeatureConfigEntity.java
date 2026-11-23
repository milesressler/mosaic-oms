package com.mosaicchurchaustin.oms.data.entity.feature;


import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
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
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Map;

@Entity
@Table(name = "features")
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditLogListener.class)
public class FeatureConfigEntity extends BaseEntity implements Auditable, Serializable {


    public static String ENTITY_NAME = "FeatureConfig";

    @Override
    public String getEntityType() {
        return ENTITY_NAME;
    }

    @Setter
    @Column(name = "groupme_enabled", nullable = false)
    boolean groupMeEnabled;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "print_on_transition_to_status", nullable = false)
    OrderStatus printOnTransitionToStatus;

    @Setter
    @Column(name = "orders_open", nullable = false)
    boolean ordersOpen;

    /**
     * Special event shown to order takers. Null when no event is running.
     */
    @Setter
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "active_special_event_id")
    SpecialEventEntity activeSpecialEvent;

    @Transient
    @Getter
    Map<String, String> previousState;


    @Override
    public void stashState() {
        this.previousState = getCurrentState();
    }

    @Override
    public Map<String, String> getCurrentState() {
        return Map.of(
                "groupMeEnabled", String.valueOf(groupMeEnabled),
                "printOnTransitionToStatus", String.valueOf(printOnTransitionToStatus),
                "ordersOpen", String.valueOf(ordersOpen),
                "activeSpecialEvent", activeSpecialEvent == null ? "" : activeSpecialEvent.getUuid()
        );
    }
}
