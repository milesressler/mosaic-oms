package com.mosaicchurchaustin.oms.services;

import com.hazelcast.core.HazelcastInstance;
import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import com.mosaicchurchaustin.oms.data.request.DeviceRequest;
import com.mosaicchurchaustin.oms.repositories.DeviceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceServiceTest {

    @Mock DeviceRepository deviceRepository;
    @Mock HazelcastInstance hazelcastInstance;

    @InjectMocks DeviceService deviceService;

    @Test
    void createDevice_withNoExpiration_setsAutoRenewAndRealExpiration() {
        final DeviceRequest request = new DeviceRequest("Lobby Kiosk", null);
        when(deviceRepository.save(any(DeviceEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        final DeviceEntity result = deviceService.createDevice(request, "Mozilla/5.0");

        assertThat(result.isAutoRenew()).isTrue();
        assertThat(result.getExpiration()).isNotNull();
        assertThat(result.getExpiration()).isAfter(Instant.now().plus(363, ChronoUnit.DAYS));
        assertThat(result.getExpiration()).isBefore(Instant.now().plus(365, ChronoUnit.DAYS));
    }

    @Test
    void createDevice_withExpiration_doesNotSetAutoRenew() {
        final OffsetDateTime futureDate = OffsetDateTime.now().plusDays(30);
        final DeviceRequest request = new DeviceRequest("Event Kiosk", futureDate);
        when(deviceRepository.save(any(DeviceEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        final DeviceEntity result = deviceService.createDevice(request, "Mozilla/5.0");

        assertThat(result.isAutoRenew()).isFalse();
        assertThat(result.getExpiration()).isNotNull();
    }

    @Test
    void refreshDeviceExpiration_setsExpirationTo364DaysAndSaves() {
        final DeviceEntity device = new DeviceEntity();
        device.setExpiration(Instant.now().plus(10, ChronoUnit.DAYS));
        when(deviceRepository.save(device)).thenReturn(device);

        final DeviceEntity result = deviceService.refreshDeviceExpiration(device);

        assertThat(result.getExpiration()).isAfter(Instant.now().plus(363, ChronoUnit.DAYS));
        assertThat(result.getExpiration()).isBefore(Instant.now().plus(365, ChronoUnit.DAYS));
        verify(deviceRepository).save(device);
    }
}
