package com.mosaicchurchaustin.oms.specifications;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class CustomerSpecification {

    public static Specification<CustomerEntity> withFilters(String name, Boolean flagged) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            /* ---------- name filter ---------- */
            if (name != null && !name.isBlank()) {
                String pattern = "%" + name.trim().toLowerCase() + "%";

                // firstName + " " + lastName
                Expression<String> fullName = cb.concat(
                        cb.concat(cb.lower(root.get("firstName")), cb.literal(" ")),
                        cb.lower(root.get("lastName"))
                );

                // lastName + " " + firstName  (Smith Joe)
                Expression<String> revFullName = cb.concat(
                        cb.concat(cb.lower(root.get("lastName")), cb.literal(" ")),
                        cb.lower(root.get("firstName"))
                );

                predicates.add(cb.or(
                        cb.like(fullName, pattern),
                        cb.like(revFullName, pattern)
                ));
            }

            /* ---------- flagged filter ---------- */
            if (flagged != null) {          // only add when caller actually specifies it
                predicates.add(cb.equal(root.get("flagged"), flagged));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
