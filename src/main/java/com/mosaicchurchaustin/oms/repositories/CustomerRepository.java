package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.projections.CustomerSearchProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {

    Optional<CustomerEntity> findByName(String name);
    Optional<CustomerEntity> findByUuid(String uuid);

    @Query("""
SELECT scored.name as name,
       scored.uuid as uuid,
       (scored.firstScore + scored.lastScore) AS matchScore
FROM (
    SELECT c.name AS name,
           c.uuid AS uuid,
           CASE
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', 1) AS string) = :firstName THEN 5
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', 1) AS string) LIKE CONCAT(:firstName, '%') AND LENGTH(:firstName) >= 3 THEN 4
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', 1) AS string) LIKE CONCAT('%', :firstName, '%') AND LENGTH(:firstName) >= 3 THEN 2
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', 1) AS string) LIKE CONCAT('%', :firstName, '%') THEN 1
                      ELSE 0
                  END +
                  CASE
                      WHEN SOUNDEX(CAST(SUBSTRING_INDEX(c.name, ' ', 1) AS string)) = SOUNDEX(:firstName) THEN 2
                      ELSE 0
                  END AS firstScore,
                  CASE
                      WHEN LOCATE(' ', c.name) = 0 THEN 0
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', -1) AS string) = :lastName THEN 5
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', -1) AS string) LIKE CONCAT(:lastName, '%') AND LENGTH(:lastName) >= 3 THEN 4
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', -1) AS string) LIKE CONCAT('%', :lastName, '%') AND LENGTH(:lastName) >= 3 THEN 2
                      WHEN CAST(SUBSTRING_INDEX(c.name, ' ', -1) AS string) LIKE CONCAT('%', :lastName, '%') THEN 1
                      ELSE 0
                  END +
                  CASE
                      WHEN LOCATE(' ', c.name) = 0 THEN 0
                      WHEN SOUNDEX(CAST(SUBSTRING_INDEX(c.name, ' ', -1) AS string)) = SOUNDEX(:lastName) THEN 2
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
