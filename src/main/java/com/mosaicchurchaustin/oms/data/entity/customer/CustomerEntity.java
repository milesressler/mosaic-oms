package com.mosaicchurchaustin.oms.data.entity.customer;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Entity
@Table(name = "customers")
@Getter
@Setter
@ToString
@Builder
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

    @Column(name = "first_name_soundex", updatable = false, insertable = false)
    String firstNameSoundex;

    @Column(name = "last_name_soundex", updatable = false, insertable = false)
    String lastNameSoundex;

    @Column(name = "flagged")
    boolean flagged;

    @Column(name = "obfuscate_name")
    boolean obfuscateName;

    @Column(name = "shower_waiver_completed")
    Instant showerWaiverCompleted;

    public boolean isWaiverValid() {
        return this.showerWaiverCompleted != null &&
                this.showerWaiverCompleted.isAfter(Instant.now().minus(365, ChronoUnit.DAYS));
    }

    public String fullName() {
        return Stream.of(firstName, lastName)
                .filter(StringUtils::isNotBlank)
                .collect(Collectors.joining(" "));
    }
}
