package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {


    Stream<OrderEntity> findByCreatedBefore(@Param("tenDaysAgo") Calendar tenDaysAgo);

    List<OrderEntity> findAllByUuidIn(List<String> uuids);

    Optional<OrderEntity> findByUuid(String uuid);
    Page<OrderEntity> findAllByOrderStatusIn(Pageable pageable, List<OrderStatus> orderStatusList);

    @Query("SELECT o FROM OrderEntity o " +
            "WHERE o.orderStatus IN ('NEEDS_INFO', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'PACKING', 'PACKED', 'IN_TRANSIT', 'READY_FOR_CUSTOMER_PICKUP') " +
            "OR (o.orderStatus IN ('COMPLETED', 'CANCELLED', 'REJECTED') AND  timestampdiff(SECOND, o.updated, CURRENT_TIMESTAMP) <= 300) " +
            "ORDER BY " +
            "CASE " +
            "  WHEN o.orderStatus = 'NEEDS_INFO' THEN 1 " +
            "  WHEN o.orderStatus IN ('CANCELLED', 'REJECTED') THEN 2 " +
            "  WHEN o.orderStatus = 'READY_FOR_CUSTOMER_PICKUP' THEN 3 " +
            "  WHEN o.orderStatus = 'PENDING_ACCEPTANCE' THEN 5 " +
            "  WHEN o.orderStatus IN ('COMPLETED') THEN 6 " +
            "  ELSE 4 " +
            "END, " +
            "o.created ASC")
    List<OrderEntity> findOrdersForDashboard();
}
