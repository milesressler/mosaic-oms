package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.shower.ReservationStatus;
import com.mosaicchurchaustin.oms.data.entity.shower.ShowerReservationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowerReservationRepository extends JpaRepository<ShowerReservationEntity, Long>, JpaSpecificationExecutor<ShowerReservationEntity> {

    Optional<ShowerReservationEntity> findTopByReservationStatusOrderByQueuePositionDesc(ReservationStatus status);
    Optional<ShowerReservationEntity> findByUuid(String uuid);
    Optional<ShowerReservationEntity> findByShowerNumberAndReservationStatus(Integer showerNumber, ReservationStatus reservationStatus);
    List<ShowerReservationEntity> findByReservationStatusIn(List<ReservationStatus> reservationStatus);
    List<ShowerReservationEntity> findByReservationStatusAndEndedAtAfter(ReservationStatus reservationStatus, Instant endAt);
    Page<ShowerReservationEntity> findByReservationStatusOrderByQueuePositionAsc(ReservationStatus reservationStatus, Pageable pageable);


    @Query("""
    SELECT r FROM ShowerReservationEntity r
    WHERE r.reservationStatus = :status
    ORDER BY r.queuePosition ASC, r.created ASC
""")
    Page<ShowerReservationEntity> findQueueByStatus(
            @Param("status") ReservationStatus status,
            Pageable pageable
    );
}
