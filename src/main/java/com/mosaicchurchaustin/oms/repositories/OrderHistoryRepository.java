package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.projections.ProcessTimingProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistoryEntity, Long> {
    List<OrderHistoryEntity> findByUserEntityExternalIdOrderByTimestampDesc(String userExternalId);
    Page<OrderHistoryEntity> findAllByOrderEntityId(Pageable pageable, Long orderId);
    Optional<OrderHistoryEntity> findFirstByOrderEntityIdAndEventTypeOrderByTimestampAsc(Long orderEntityId, OrderEventType eventType);
    @Query("""
   select count(distinct oh.userEntity)
           from OrderHistoryEntity oh
           where (:startDate is null or oh.timestamp >= :startDate) and (:endDate is null or oh.timestamp <= :endDate) and oh.orderEntity.customer.excludeFromMetrics = false
""")
    Long countDistinctByUserEntity(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    @Query(value = """
        WITH order_timings AS (
            SELECT 
                o.id,
                TIMESTAMPDIFF(SECOND,
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'PENDING_ACCEPTANCE' THEN oh.timestamp END),
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'ACCEPTED' THEN oh.timestamp END)
                ) as lagTimeSeconds,
                TIMESTAMPDIFF(SECOND,
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'PACKED' THEN oh.timestamp END),
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'READY_FOR_CUSTOMER_PICKUP' THEN oh.timestamp END)
                ) as packToDeliverySeconds,
                TIMESTAMPDIFF(SECOND,
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'READY_FOR_CUSTOMER_PICKUP' THEN oh.timestamp END),
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'COMPLETED' THEN oh.timestamp END)
                ) as distributionTimeSeconds,
                TIMESTAMPDIFF(SECOND,
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'PENDING_ACCEPTANCE' THEN oh.timestamp END),
                    MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'COMPLETED' THEN oh.timestamp END)
                ) as totalTimeSeconds
            FROM orders o 
            LEFT JOIN order_history oh ON oh.order_entity_id = o.id 
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.order_status = 'COMPLETED'
              AND c.exclude_from_metrics = false
              AND (:startDate is null or oh.timestamp >= :startDate) 
              AND (:endDate is null or oh.timestamp <= :endDate)
            GROUP BY o.id
            HAVING MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'PENDING_ACCEPTANCE' THEN oh.timestamp END) IS NOT NULL
               AND MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'ACCEPTED' THEN oh.timestamp END) IS NOT NULL
               AND MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'PACKED' THEN oh.timestamp END) IS NOT NULL
               AND MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'READY_FOR_CUSTOMER_PICKUP' THEN oh.timestamp END) IS NOT NULL
               AND MIN(CASE WHEN oh.type = 'STATUS_CHANGE' AND oh.order_status = 'COMPLETED' THEN oh.timestamp END) IS NOT NULL
        )
        SELECT 
            AVG(lagTimeSeconds) as avgLagTimeSeconds,
            AVG(packToDeliverySeconds) as avgPackToDeliverySeconds,
            AVG(distributionTimeSeconds) as avgDistributionTimeSeconds,
            AVG(totalTimeSeconds) as avgTotalTimeSeconds
        FROM order_timings
        WHERE lagTimeSeconds IS NOT NULL 
          AND packToDeliverySeconds IS NOT NULL 
          AND distributionTimeSeconds IS NOT NULL
          AND totalTimeSeconds IS NOT NULL
        """, nativeQuery = true)
    ProcessTimingProjection findProcessTimingsForCompletedOrders(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
