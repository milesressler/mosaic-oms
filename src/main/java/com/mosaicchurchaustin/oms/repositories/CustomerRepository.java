package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.projections.CustomerSearchProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Long>, JpaSpecificationExecutor<CustomerEntity> {

    Optional<CustomerEntity> findByFirstNameAndLastName(String firstName, String lastName);
    Optional<CustomerEntity> findByUuid(String uuid);

    @Query("""
SELECT scored.firstName as firstName,
       scored.lastName as lastName,
       scored.uuid as uuid,
       scored.flagged as flagged,
       scored.showerWaiverCompleted as showerWaiverCompleted,
       (scored.firstScore + scored.lastScore) AS matchScore
FROM (
    SELECT c.firstName AS firstName,
           c.lastName AS lastName,
           c.uuid AS uuid,
           c.showerWaiverCompleted AS showerWaiverCompleted,
           c.flagged AS flagged,
           CASE
                      WHEN c.firstName = :firstName THEN 5
                      WHEN c.firstName LIKE CONCAT(:firstName, '%') AND LENGTH(:firstName) >= 3 THEN 4
                      WHEN c.firstName LIKE CONCAT('%', :firstName, '%') AND LENGTH(:firstName) >= 3 THEN 2
                      WHEN c.firstName LIKE CONCAT('%', :firstName, '%') THEN 1
                      ELSE 0
                  END +
                  CASE
                      WHEN c.firstNameSoundex = SOUNDEX(:firstName) THEN 2
                      ELSE 0
                  END AS firstScore,
                  CASE
                      WHEN c.lastName = :lastName THEN 5
                      WHEN c.lastName LIKE CONCAT(:lastName, '%') AND LENGTH(:lastName) >= 3 THEN 4
                      WHEN c.lastName LIKE CONCAT('%', :lastName, '%') AND LENGTH(:lastName) >= 3 THEN 2
                      WHEN c.lastName LIKE CONCAT('%', :lastName, '%') THEN 1
                      ELSE 0
                  END +
                  CASE
                      WHEN c.lastNameSoundex = SOUNDEX(:lastName) THEN 2
                      ELSE 0
                  END AS lastScore
    FROM CustomerEntity c
) AS scored
WHERE (scored.firstScore > 0 OR scored.lastScore > 0)
ORDER BY matchScore DESC
LIMIT :limit
""")
    List<CustomerSearchProjection> searchCustomers(@Param("firstName") String firstName,
                                                   @Param("lastName") String lastName,
                                                   @Param("limit") int limit);

}
