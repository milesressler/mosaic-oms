package com.mosaicchurchaustin.oms.specifications;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class OrderSpecBuilder {
    private List<OrderStatus> statuses;
    private String customerName;
    private String customerUuid;
    private Long orderId;
    private Long handledByUserId;
    private List<String> myOrdersActions;

    private OrderSpecBuilder() {}

    public static OrderSpecBuilder create() {
        return new OrderSpecBuilder();
    }

    public OrderSpecBuilder statuses(List<OrderStatus> statuses) {
        this.statuses = statuses;
        return this;
    }

    public OrderSpecBuilder customerName(String customerName) {
        this.customerName = customerName;
        return this;
    }

    public OrderSpecBuilder customerUuid(String customerUuid) {
        this.customerUuid = customerUuid;
        return this;
    }

    public OrderSpecBuilder orderId(Long orderId) {
        this.orderId = orderId;
        return this;
    }

    public OrderSpecBuilder handledByUser(Long handledByUserId) {
        this.handledByUserId = handledByUserId;
        return this;
    }

    public OrderSpecBuilder myOrdersActions(List<String> myOrdersActions) {
        this.myOrdersActions = myOrdersActions;
        return this;
    }

    public Specification<OrderEntity> build() {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();

            if (statuses != null && !statuses.isEmpty()) {
                p.add(root.get("orderStatus").in(statuses));
            }

            if (customerName != null && !customerName.isBlank()) {
                var cust = root.join("customer");
                String pattern = "%" + customerName.trim().toLowerCase() + "%";
                var fullName = cb.concat(cb.concat(cb.lower(cust.get("firstName")), cb.literal(" ")),
                        cb.lower(cust.get("lastName")));
                var revFullName = cb.concat(cb.concat(cb.lower(cust.get("lastName")), cb.literal(" ")),
                        cb.lower(cust.get("firstName")));
                p.add(cb.or(cb.like(fullName, pattern), cb.like(revFullName, pattern)));
            }

            if (customerUuid != null && !customerUuid.isBlank()) {
                p.add(cb.equal(root.get("customer").get("uuid"), customerUuid));
            }

            if (orderId != null) {
                p.add(cb.equal(root.get("id"), orderId));
            }

            if (handledByUserId != null) {
                Join<OrderEntity, OrderHistoryEntity> hist =
                        root.join("orderHistoryEntityList", JoinType.LEFT);
                Join<OrderHistoryEntity, UserEntity> user =
                        hist.join("userEntity", JoinType.LEFT);
                
                Predicate userPredicate = cb.equal(user.get("id"), handledByUserId);
                
                // If specific actions are requested, filter by order status transitions
                if (myOrdersActions != null && !myOrdersActions.isEmpty()) {
                    List<Predicate> actionPredicates = new ArrayList<>();
                    
                    if (myOrdersActions.contains("created")) {
                        // Orders where user was the creator (assigned user on PENDING_ACCEPTANCE)
                        actionPredicates.add(cb.and(
                            userPredicate,
                            cb.equal(hist.get("orderStatus"), OrderStatus.PENDING_ACCEPTANCE)
                        ));
                    }
                    
                    if (myOrdersActions.contains("packed")) {
                        // Orders where user packed them (transitions to PACKED or READY_FOR_CUSTOMER_PICKUP)
                        actionPredicates.add(cb.and(
                            userPredicate,
                            cb.or(
                                cb.equal(hist.get("orderStatus"), OrderStatus.PACKED),
                                cb.equal(hist.get("orderStatus"), OrderStatus.READY_FOR_CUSTOMER_PICKUP)
                            )
                        ));
                    }
                    
                    if (myOrdersActions.contains("transported")) {
                        // Orders where user transported them (transitions involving IN_TRANSIT)
                        actionPredicates.add(cb.and(
                            userPredicate,
                            cb.or(
                                cb.equal(hist.get("orderStatus"), OrderStatus.IN_TRANSIT),
                                cb.equal(hist.get("previousOrderStatus"), OrderStatus.IN_TRANSIT)
                            )
                        ));
                    }
                    
                    if (myOrdersActions.contains("distributed")) {
                        // Orders where user completed them (transitions to COMPLETED)
                        actionPredicates.add(cb.and(
                            userPredicate,
                            cb.equal(hist.get("orderStatus"), OrderStatus.COMPLETED)
                        ));
                    }
                    
                    if (!actionPredicates.isEmpty()) {
                        p.add(cb.or(actionPredicates.toArray(new Predicate[0])));
                    }
                } else {
                    // Default behavior: any interaction with the order
                    p.add(userPredicate);
                }
                
                query.distinct(true);
            }

            return cb.and(p.toArray(new Predicate[0]));
        };
    }
}
