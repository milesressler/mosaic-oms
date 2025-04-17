package com.mosaicchurchaustin.oms.config;

import com.hazelcast.config.Config;
import com.hazelcast.config.InMemoryFormat;
import com.hazelcast.config.MapConfig;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.listener.EntryAddedListener;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    HazelcastInstance hazelcastInstance(Config config) {
        final var hazelCast =  Hazelcast.newHazelcastInstance(config);
        hazelCast.getMap("transitData")
                .addEntryListener((EntryAddedListener<Object, Object>) event ->
                        System.out.println("Added key: " + event.getKey()), true);
        return hazelCast;

        // add removal listener for kiosk, or just update every 5 min or so
    }
//
//    @Bean
//    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
//        return new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
//    }

//    @Bean
//    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
//        return new HazelcastServerCacheManager(hazelcastInstance);
//    }

    // Declaration of Hazelcast configuration bean
    @Bean
    Config config() {
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
        );
        return config;
    }


//    @Bean("transitCacheManager")
//    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
//
//        return hazelcastInstance.;
////        return new CustomCaffeineCacheManager(publisher, "transitData", "items", "features", "kiosk");
//    }
//
//    @Configuration
//    class CacheCleanup {
//
//        @Autowired
//        TransitService transitService;
//
//        @Scheduled(fixedRate = 45, timeUnit = TimeUnit.SECONDS)
//        public void update() {
//            transitService.clearCached();
//        }


}
