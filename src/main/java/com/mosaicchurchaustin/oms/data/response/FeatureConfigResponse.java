package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventEntity;
import com.mosaicchurchaustin.oms.data.entity.feature.FeatureConfigEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.Optional;

@Getter
@Builder
public class FeatureConfigResponse {
    private boolean groupMeEnabled;
    private boolean ordersOpen;
    private OrderStatus printOnTransitionToStatus;
    private String activeSpecialEventUuid;
    private String activeSpecialEventName;

    public static FeatureConfigResponse from(final FeatureConfigEntity featureConfigEntity) {
        return FeatureConfigResponse.builder()
                .groupMeEnabled(featureConfigEntity.isGroupMeEnabled())
                .ordersOpen(featureConfigEntity.isOrdersOpen())
                .printOnTransitionToStatus(featureConfigEntity.getPrintOnTransitionToStatus())
                .activeSpecialEventUuid(Optional.ofNullable(featureConfigEntity.getActiveSpecialEvent())
                        .map(SpecialEventEntity::getUuid).orElse(null))
                .activeSpecialEventName(Optional.ofNullable(featureConfigEntity.getActiveSpecialEvent())
                        .map(SpecialEventEntity::getName).orElse(null))
                .build();

    }
}
