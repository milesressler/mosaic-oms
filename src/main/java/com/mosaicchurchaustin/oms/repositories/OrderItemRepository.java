package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.entity.order.attributes.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    void deleteByIdIn(Collection<Long> ids);

    interface ItemClaimCount {
        Long getItemId();
        Long getClaimed();
    }

    /**
     * Units of each item on a special event's orders, leaving out orders in the given (e.g. cancelled) statuses.
     */
    @Query("""
        SELECT oi.itemEntity.id AS itemId, SUM(oi.quantity) AS claimed
          FROM OrderItemEntity oi
         WHERE oi.orderEntity.specialEvent.id = :eventId
           AND oi.orderEntity.orderStatus NOT IN :excludedStatuses
         GROUP BY oi.itemEntity.id
        """)
    List<ItemClaimCount> countClaimedForSpecialEvent(@Param("eventId") Long eventId,
                                                     @Param("excludedStatuses") Collection<OrderStatus> excludedStatuses);

    /**
     * Same as {@link #countClaimedForSpecialEvent} but as a locking read, which sees the latest committed orders
     * rather than the transaction's snapshot. Used for stock checks, after the event's lines are locked.
     */
    @Query(nativeQuery = true, value = """
        SELECT oi.item_entity_id AS itemId, CAST(SUM(oi.quantity) AS SIGNED) AS claimed
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_entity_id
         WHERE o.special_event_id = :eventId
           AND o.order_status NOT IN (:excludedStatuses)
         GROUP BY oi.item_entity_id
         LOCK IN SHARE MODE
        """)
    List<ItemClaimCount> countClaimedForSpecialEventLocking(@Param("eventId") Long eventId,
                                                            @Param("excludedStatuses") Collection<String> excludedStatuses);


    interface LimitedItemReceipt {
        Long getItemId();
        Integer getQuantity();
        Instant getCompletedAt();
        Instant getOrderUpdated();
    }

    /**
     * Items a customer received on completed orders. Uses the fulfilled quantity, falling back to the
     * requested quantity for older orders that did not track fulfillment.
     */
    @Query("""
        SELECT oi.itemEntity.id AS itemId,
               COALESCE(oi.quantityFulfilled, oi.quantity) AS quantity,
               (SELECT MAX(h.timestamp) FROM OrderHistoryEntity h
                 WHERE h.orderEntity = o
                   AND h.eventType = :statusChange
                   AND h.orderStatus = :completed) AS completedAt,
               COALESCE(o.updated, o.created) AS orderUpdated
        FROM OrderItemEntity oi
        JOIN oi.orderEntity o
        WHERE o.customer.id = :customerId
          AND o.orderStatus = :completed
          AND oi.itemEntity.id IN :itemIds
          AND (:excludeOrderId IS NULL OR o.id <> :excludeOrderId)
    """)
    List<LimitedItemReceipt> findCompletedReceipts(@Param("customerId") Long customerId,
                                                   @Param("itemIds") Collection<Long> itemIds,
                                                   @Param("excludeOrderId") Long excludeOrderId,
                                                   @Param("completed") OrderStatus completed,
                                                   @Param("statusChange") OrderEventType statusChange);

    interface CustomerItemHistoryLine {
        Long getOrderItemId();
        Long getOrderId();
        String getOrderUuid();
        Instant getCompletedAt();
        Instant getOrderUpdated();
        Long getItemId();
        Integer getQuantity();
        Integer getQuantityFulfilled();
        String getNotes();
        Map<String, AttributeValue> getAttributes();
    }

    /**
     * Every line on a customer's completed orders, filled or not. Selects columns rather than entities so
     * the orders' eager associations aren't loaded for each line.
     */
    @Query("""
        SELECT oi.id AS orderItemId,
               o.id AS orderId,
               o.uuid AS orderUuid,
               (SELECT MAX(h.timestamp) FROM OrderHistoryEntity h
                 WHERE h.orderEntity = o
                   AND h.eventType = :statusChange
                   AND h.orderStatus = :completed) AS completedAt,
               COALESCE(o.updated, o.created) AS orderUpdated,
               oi.itemEntity.id AS itemId,
               oi.quantity AS quantity,
               oi.quantityFulfilled AS quantityFulfilled,
               oi.notes AS notes,
               oi.attributes AS attributes
        FROM OrderItemEntity oi
        JOIN oi.orderEntity o
        WHERE o.customer.id = :customerId
          AND o.orderStatus = :completed
    """)
    List<CustomerItemHistoryLine> findCompletedHistory(@Param("customerId") Long customerId,
                                                       @Param("completed") OrderStatus completed,
                                                       @Param("statusChange") OrderEventType statusChange);
}
