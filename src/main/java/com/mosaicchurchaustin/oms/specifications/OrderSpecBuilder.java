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
import java.util.List;

public class OrderSpecBuilder {
    private List<OrderStatus> statuses;
    private String customerName;
    private String customerUuid;
    private Long orderId;
    private Long handledByUserId;

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
                p.add(cb.equal(user.get("id"), handledByUserId));
                query.distinct(true);
            }

            return cb.and(p.toArray(new Predicate[0]));
        };
    }
}
