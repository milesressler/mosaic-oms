package com.mosaicchurchaustin.oms.config;

import com.mosaicchurchaustin.oms.services.bus.TransitService;
import com.mosaicchurchaustin.oms.support.cache.CustomCaffeineCacheManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean("transitCacheManager")
    public CacheManager cacheManager(ApplicationEventPublisher publisher) {
        return new CustomCaffeineCacheManager(publisher, "transitData", "items", "features", "kiosk");
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
