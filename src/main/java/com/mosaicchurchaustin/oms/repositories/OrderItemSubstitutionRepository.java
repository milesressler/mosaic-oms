package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderItemSubstitutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OrderItemSubstitutionRepository extends JpaRepository<OrderItemSubstitutionEntity, Long> {
    Optional<OrderItemSubstitutionEntity> findByUuid(String uuid);

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM OrderItemSubstitutionEntity s " +
           "WHERE s.orderItem.orderEntity.customer.excludeFromMetrics = false " +
           "AND s.orderItem.orderEntity.orderStatus = 'COMPLETED' " +
           "AND (:startDate IS NULL OR s.orderItem.orderEntity.created >= :startDate) " +
           "AND (:endDate IS NULL OR s.orderItem.orderEntity.created <= :endDate)")
    Long sumSubstitutedQuantities(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
