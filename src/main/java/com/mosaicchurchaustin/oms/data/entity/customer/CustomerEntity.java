package com.mosaicchurchaustin.oms.data.entity.customer;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.apache.commons.lang3.StringUtils;

import java.time.Instant;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Entity
@Table(name = "customers")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CustomerEntity extends BaseUuidEntity {

    public static String ENTITY_TYPE = "Customer";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }

    @Column(name = "first_name")
    String firstName;

    @Column(name = "last_name")
    String lastName;

    @Column(name = "flagged")
    boolean flagged;

    @Column(name = "shower_waiver_completed")
    Instant showerWaiverCompleted;

    public String fullName() {
        return Stream.of(firstName, lastName)
                .filter(StringUtils::isNotBlank)
                .collect(Collectors.joining(" "));
    }
}
