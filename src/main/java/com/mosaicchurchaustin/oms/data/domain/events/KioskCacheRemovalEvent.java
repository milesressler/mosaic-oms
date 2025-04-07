package com.mosaicchurchaustin.oms.data.domain.events;

import com.github.benmanes.caffeine.cache.RemovalCause;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Getter
@Setter
public class KioskCacheRemovalEvent extends ApplicationEvent {
    String deviceUuid;
    Long lastAccessTime;

    public KioskCacheRemovalEvent(Object source, String key, Long value, RemovalCause cause) {
        super(source);
        this.deviceUuid = key;
        this.lastAccessTime = value;
    }
}
