package com.mosaicchurchaustin.oms.support.cache;

import com.mosaicchurchaustin.oms.data.domain.cache.DeviceAccessPersistenceEvent;
import com.mosaicchurchaustin.oms.data.domain.cache.LastUsedUpdate;
import com.mosaicchurchaustin.oms.repositories.DeviceRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@AllArgsConstructor
public class DeviceAccessPersistenceListener implements ApplicationListener<DeviceAccessPersistenceEvent> {

    private final DeviceRepository deviceRepository;

    @Override
    @Transactional
    public void onApplicationEvent(final DeviceAccessPersistenceEvent updateBatch) {
        final List<LastUsedUpdate> batch = updateBatch.getEntries().entrySet().stream()
                .map(e -> new LastUsedUpdate(e.getKey(), Instant.ofEpochMilli(e.getValue())))
                .toList();
        deviceRepository.updateLastAccessedBatch(batch);
    }
}
