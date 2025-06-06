package com.mosaicchurchaustin.oms.specifications;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;


public class OrdersSpecification {

    public static Specification<OrderEntity> withFilters(List<OrderStatus> statuses, String customerUuid) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (statuses != null && !statuses.isEmpty()) {
                predicates.add(root.get("orderStatus").in(statuses));
            }

            if (customerUuid != null && !customerUuid.isBlank()) {
                predicates.add(cb.equal(root.get("customer").get("uuid"), customerUuid));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

