package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;

@Valid
public record OrdersUpdateFeatureConfigRequest(
        Boolean ordersOpen
) implements FeatureConfigRequestInterface {

    @Override
    public Boolean groupMeEnabled() {
        return null;
    }

    @Override
    public String printOnTransitionToStatus() {
        return "";
    }
}
