package com.mosaicchurchaustin.oms.data.domain.cache;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;

@Getter
@Setter
public class DeviceAccessPersistenceEvent extends ApplicationEvent {
    private Map<String, Long> entries;

    public DeviceAccessPersistenceEvent(final Object source, final Map<String, Long> entries ) {
        super(source);
        this.entries = entries;
    }
}
