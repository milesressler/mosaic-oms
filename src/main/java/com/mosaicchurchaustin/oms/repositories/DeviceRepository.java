package com.mosaicchurchaustin.oms.repositories;


import com.mosaicchurchaustin.oms.data.domain.cache.LastUsedUpdate;
import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<DeviceEntity, UUID> {
    // Additional query methods can be added here if needed.
    Optional<DeviceEntity> findByUuid(String deviceId);
    Optional<DeviceEntity> findByHashedToken(String token);

    /**
     * Update the lastAccessed column for the device with the given UUID.
     */
    @Modifying
    @Query("""
        UPDATE DeviceEntity d
        SET d.lastAccessed = :lastAccessed
        WHERE d.uuid = :uuid
    """)
    void updateLastAccessedByUuid(@Param("uuid") String uuid,
                                  @Param("lastAccessed") Instant lastAccessed);

    /**
     * Convenience method to flush a whole batch in one go.
     */
    default void updateLastAccessedBatch(List<LastUsedUpdate> batch) {
        // By default this will run N updates in a loop; JPA may or may not batch them
        batch.forEach(u -> updateLastAccessedByUuid(u.uuid(), u.lastAccessed()));
    }
}
