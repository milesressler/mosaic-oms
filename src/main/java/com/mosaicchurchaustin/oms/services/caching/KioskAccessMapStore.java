package com.mosaicchurchaustin.oms.services.caching;

import com.hazelcast.map.MapStore;
import com.mosaicchurchaustin.oms.data.domain.cache.DeviceAccessPersistenceEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class KioskAccessMapStore implements MapStore<String, Long> {

    @Autowired
    private ApplicationEventPublisher publisher;


    @Override
    public void storeAll(final Map<String, Long> map) {
        // Hazelcast batches up all changed entries since the last call,
        // and (with write-coalescing) only the most recent Instant per key
        publisher.publishEvent(new DeviceAccessPersistenceEvent(this,  map));
    }

    // No need to implement store(), delete(), loadAllKeys(), etc unless you also
    // want read-through or explicit deletes.
    @Override public void store(String key, Long value)        {
        publisher.publishEvent(new DeviceAccessPersistenceEvent(this,  Map.of(key, value)));
    }

    @Override public void delete(String key)                     { /* unused */ }
    @Override public void deleteAll(Collection<String> collection) {}
    @Override public Long load(String key)                    { return null; }
    @Override public Map<String, Long> loadAll(Collection<String> keys) { return Map.of(); }
    @Override public Iterable<String> loadAllKeys()              { return List.of(); }
}
