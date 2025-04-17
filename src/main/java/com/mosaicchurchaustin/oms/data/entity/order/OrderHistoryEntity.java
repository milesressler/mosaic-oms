package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

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
    Instant timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "export_type")
    OrderExportType exportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_order_status", nullable = false)
    OrderStatus previousOrderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    OrderEventType eventType;

    @Column(name = "comment")
    String comment;


    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }




}
