package com.mosaicchurchaustin.oms.repositories;


import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<DeviceEntity, UUID> {
    // Additional query methods can be added here if needed.
    Optional<DeviceEntity> findByUuid(String deviceId);
    Optional<DeviceEntity> findByHashedToken(String token);
}
