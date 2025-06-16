package com.mosaicchurchaustin.oms.specifications;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;


public class OrdersSpecification {

    public static Specification<OrderEntity> withFilters(List<OrderStatus> statuses, String customerName, String customerUuid, Long orderId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (statuses != null && !statuses.isEmpty()) {
                predicates.add(root.get("orderStatus").in(statuses));
            }

            if (customerName != null && !customerName.isBlank()) {
                Join<OrderEntity, CustomerEntity> customer = root.join("customer");

                // joe smith  ->  "%joe smith%"
                String pattern = "%" + customerName.trim().toLowerCase() + "%";

                Expression<String> fullName =
                        cb.concat(
                                cb.concat(
                                        cb.lower(customer.get("firstName")),
                                        cb.literal(" ")
                                ),
                                cb.lower(customer.get("lastName"))
                        );

                // If you also want "smith joe" to match, build a second concat in reverse order
                Expression<String> revFullName =
                        cb.concat(
                                cb.concat(
                                        cb.lower(customer.get("lastName")),
                                        cb.literal(" ")
                                ),
                                cb.lower(customer.get("firstName"))
                        );

                predicates.add(
                        cb.or(
                                cb.like(fullName, pattern),
                                cb.like(revFullName, pattern)      // comment this line out if you don’t need the reverse match
                        )
                );            }

            if (customerUuid != null && !customerUuid.isBlank()) {
                predicates.add(cb.equal(root.get("customer").get("uuid"), customerUuid));
            }
            if (orderId != null) {
                predicates.add(cb.equal( root.get("id"), orderId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

