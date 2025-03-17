package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.feature.FeatureConfigEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.Optional;

@Getter
@Builder
public class FeatureConfigResponse {
    private boolean groupMeEnabled;
    private String printOnTransitionToStatus;

    public static FeatureConfigResponse from(final FeatureConfigEntity featureConfigEntity) {
        return FeatureConfigResponse.builder()
                .groupMeEnabled(featureConfigEntity.isGroupMeEnabled())
                .printOnTransitionToStatus(Optional.of(featureConfigEntity)
                        .map(FeatureConfigEntity::getPrintOnTransitionToStatus)
                        .map(OrderStatus::name)
                        .orElse(null))
                .build();

    }
}
