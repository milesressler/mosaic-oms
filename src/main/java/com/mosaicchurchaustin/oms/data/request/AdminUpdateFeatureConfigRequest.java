package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;

@Valid
public record AdminUpdateFeatureConfigRequest (
        Boolean groupMeEnabled,
        Boolean ordersOpen,
        String printOnTransitionToStatus
) implements FeatureConfigRequestInterface {
}
