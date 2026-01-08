package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.projections.OrderPreviewProjection;
import com.mosaicchurchaustin.oms.data.projections.SystemOverviewProjection;
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
import java.util.stream.Stream;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {
    Stream<OrderEntity> findByCreatedBeforeAndOrderStatusNotIn(Instant cutoffTime, List<OrderStatus> orderStatuses);

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

    @Query("SELECT o.id as id, o.orderStatus as orderStatus, " +
           "c.firstName as customerFirstName, c.lastName as customerLastName, " +
           "u.name as assigneeName, u.uuid as assigneeUuid " +
           "FROM OrderEntity o " +
           "LEFT JOIN o.customer c " +
           "LEFT JOIN o.assignee u " +
           "WHERE o.id IN :orderIds")
    List<OrderPreviewProjection> findOrderPreviewsByIds(List<Long> orderIds);

    @Query("SELECT COUNT(distinct o.id) as completedOrders, " +
            "count(distinct o.customer) as uniqueCustomers," +
            " COALESCE(SUM(oi.quantity), 0) as totalItems," +
            " COALESCE(SUM(oi.quantityFulfilled), 0) as fulfilledItems " +
            "FROM OrderItemEntity oi JOIN oi.orderEntity o  WHERE o.orderStatus = 'COMPLETED' " +
            "AND (:startDate IS NULL OR o.created >= :startDate) " +
            "AND (:endDate IS NULL OR o.created <= :endDate)")
    SystemOverviewProjection findSystemOverview(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

}
