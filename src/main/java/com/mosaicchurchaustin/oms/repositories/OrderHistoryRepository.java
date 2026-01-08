package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
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
}

