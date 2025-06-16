package com.mosaicchurchaustin.oms.data.entity.shower;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "shower_reservations")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShowerReservationEntity extends BaseUuidEntity {

    public static String ENTITY_NAME = "ShowerReservation";


    @Override
    public String getEntityType() {
        return ENTITY_NAME;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private CustomerEntity customer;

    @ManyToOne()
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "reservation_status", nullable = false)
    private ReservationStatus reservationStatus = ReservationStatus.WAITING;

    @Column(name = "queue_position", nullable = false)
    private Long queuePosition;

    @Column(name = "notes")
    String notes;

    @Column(name = "shower_number")
    private Integer showerNumber;
}
