package com.mosaicchurchaustin.oms.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.mosaicchurchaustin.oms.services.bus.TransitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean("transitCacheManager")
    public CacheManager cacheManager() {
        final CaffeineCacheManager cacheManager = new CaffeineCacheManager("transitData", "features");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(100));
        return cacheManager;
    }

    @Configuration
    class CacheCleanup {

        @Autowired
        TransitService transitService;

        @Scheduled(fixedRate = 45, timeUnit = TimeUnit.SECONDS)
        public void update() {
            transitService.clearCached();
        }

    }
}
