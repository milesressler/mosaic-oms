package com.mosaicchurchaustin.oms.data.request;

/**
 * @param uuid event order takers should see, or null to stop the running event
 */
public record ActiveSpecialEventRequest(String uuid) {
}
