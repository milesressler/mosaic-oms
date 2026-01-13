package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class ProcessTimingsResponse {
    Double totalEndToEndTime;
    List<ProcessStage> processStages;

    @Value
    @Builder
    public static class ProcessStage {
        String stage;
        Double avgTime;
        String description;
    }
}
