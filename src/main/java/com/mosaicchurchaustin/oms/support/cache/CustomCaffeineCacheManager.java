package com.mosaicchurchaustin.oms.support.cache;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalCause;
import com.mosaicchurchaustin.oms.data.domain.events.KioskCacheRemovalEvent;
import lombok.AllArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.ApplicationEventPublisher;

import java.util.concurrent.TimeUnit;

@AllArgsConstructor
public class CustomCaffeineCacheManager extends CaffeineCacheManager {

    private final ApplicationEventPublisher publisher;


    public CustomCaffeineCacheManager(final ApplicationEventPublisher publisher,
                                      final String... cacheNames) {
        super(cacheNames);
        this.publisher = publisher;
    }

    @Override
    protected Cache createCaffeineCache(final String name) {
        if ("kiosk".equals(name)) {
            // For the kiosk cache, use a policy that supports many entries and a removal listener.
            return new CaffeineCache(name, Caffeine.newBuilder()
                    .expireAfterWrite(30, TimeUnit.MINUTES)
                    .maximumSize(1000)
                    .removalListener((key, value, cause) -> {
                        if (cause == RemovalCause.EXPIRED) {
                            publisher.publishEvent(new KioskCacheRemovalEvent(this, (String) key, (Long) value, cause));
                        }
                    }).build());
        } else {
            // For other caches that hold a single item
            return new CaffeineCache(name, Caffeine.newBuilder()
                    .expireAfterWrite(3, TimeUnit.MINUTES)
                    .maximumSize(1)
                    .build());
        }
    }
}

