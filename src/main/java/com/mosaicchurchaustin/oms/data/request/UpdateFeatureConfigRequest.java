package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;

@Valid
public record UpdateFeatureConfigRequest(
        Boolean groupMeEnabled,
        Boolean ordersOpen,
        String printOnTransitionToStatus
) {
}
