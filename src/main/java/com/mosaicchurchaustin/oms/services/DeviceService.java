package com.mosaicchurchaustin.oms.services;

import com.google.common.hash.Hashing;
import com.hazelcast.core.HazelcastInstance;
import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import com.mosaicchurchaustin.oms.data.request.DeviceRequest;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.repositories.DeviceRepository;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private HazelcastInstance hazelcastInstance;

    /**
     * Updates the device's last access timestamp in the "kiosk" cache.
     *
     * @param deviceUuid the unique identifier for the device
     */
    public void updateDeviceAccess(final String deviceUuid) {
        // You can choose to use System.currentTimeMillis() or a formatted date
        hazelcastInstance.getMap("kiosk").put(deviceUuid, Instant.now().toEpochMilli());
    }

    @CacheEvict(value = "kiosk", key = "#deviceUuid")
    public void deleteDevice(String deviceUuid) {
        final var device = getDevice(deviceUuid).orElseThrow(() -> new EntityNotFoundException(DeviceEntity.ENTITY_TYPE, deviceUuid));
        deviceRepository.delete(device);
    }


    public DeviceEntity createDevice(DeviceRequest request, String userAgent) {
        final DeviceEntity device = new DeviceEntity();
        device.setName(request.name().trim());
        device.setUserAgent(userAgent);

        if (request.expireAt() != null) {
            final var expireAtCalendar = Instant.ofEpochMilli(request.expireAt().toEpochSecond() * 1000);
            device.setExpiration(expireAtCalendar);
        }

        device.setRawToken(UUID.randomUUID().toString());
        final String sha256hex = getSha256hex(device.getRawToken());

        device.setHashedToken(sha256hex);
        return deviceRepository.save(device);
    }

    @NotNull
    private static String getSha256hex(String token) {
        return Hashing.sha256().hashString(token, StandardCharsets.UTF_8).toString();
    }

    public Page<DeviceEntity> getDevices(final Pageable pageable) {
        final Page<DeviceEntity> results = deviceRepository.findAll(pageable);
        results.getContent().forEach(device ->
                Optional.ofNullable(hazelcastInstance.getMap("kiosk").get(device.getUuid()))
                .map(Long.class::cast)
                .map(Instant::ofEpochMilli)
                .ifPresent(device::setLastAccessed));
        return results;
    }

    public Optional<DeviceEntity> getDevice(String id) {
        return deviceRepository.findByUuid(id);
    }

    public Optional<DeviceEntity> validateDeviceToken(final String token) {
        final String hashed = getSha256hex(token);
        return deviceRepository.findByHashedToken(hashed);
    }
}
