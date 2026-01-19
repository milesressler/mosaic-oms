package com.mosaicchurchaustin.oms.data.response;

import java.time.Instant;

public record PrintJobResponse(
        Long id,
        String title,
        String state,
        Instant createTimestamp,
        Integer printerId,
        String printerName
) {
}
