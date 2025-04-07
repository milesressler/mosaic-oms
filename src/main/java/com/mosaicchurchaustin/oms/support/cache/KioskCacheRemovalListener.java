package com.mosaicchurchaustin.oms.support.cache;

import com.mosaicchurchaustin.oms.data.domain.events.KioskCacheRemovalEvent;
import com.mosaicchurchaustin.oms.services.DeviceService;
import lombok.AllArgsConstructor;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class KioskCacheRemovalListener implements ApplicationListener<KioskCacheRemovalEvent> {

    private final DeviceService deviceService;

    @Override
    public void onApplicationEvent(final KioskCacheRemovalEvent event) {
        // Call a method in DeviceService to handle the removal event.
        // For example, you could log the removal, update a record, or perform cleanup.
        deviceService.handleDeviceInactive(event.getDeviceUuid(), event.getLastAccessTime());
    }
}
