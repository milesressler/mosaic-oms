package com.mosaicchurchaustin.oms.config;

import com.hazelcast.config.Config;
import com.hazelcast.config.InMemoryFormat;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.MapStoreConfig;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.mosaicchurchaustin.oms.services.caching.KioskAccessMapStore;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    HazelcastInstance hazelcastInstance(Config config) {
        return Hazelcast.newHazelcastInstance(config);
    }

    // Declaration of Hazelcast configuration bean
    @Bean
    Config config(final KioskAccessMapStore kioskStore) {
        final Config config = new Config();
        config.addMapConfig(
                new MapConfig("transitData")
                        .setTimeToLiveSeconds(45)
                        .setInMemoryFormat(InMemoryFormat.BINARY));

        config.addMapConfig(
                new MapConfig("items")
                        .setTimeToLiveSeconds(180)
                        .setInMemoryFormat(InMemoryFormat.BINARY));

        config.addMapConfig(
                new MapConfig("features")
                        .setTimeToLiveSeconds(180)
                        .setInMemoryFormat(InMemoryFormat.BINARY));

        config.addMapConfig(
                new MapConfig("kiosk")
                        .setTimeToLiveSeconds(30*60)
                        .setInMemoryFormat(InMemoryFormat.BINARY)
                        .setMapStoreConfig(new MapStoreConfig()
                                .setEnabled(true)
                                .setImplementation(kioskStore)
                                // write‑behind after 5 minutes
                                .setWriteDelaySeconds(300)
                                // coalesce multiple writes into one per key
                                .setWriteCoalescing(true)
                        )
        );
        return config;
    }

}
