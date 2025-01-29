package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.feature.FeatureConfigEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FeatureConfigResponse {
    private boolean groupMeEnabled;

    public static FeatureConfigResponse from(final FeatureConfigEntity featureConfigEntity) {
        return FeatureConfigResponse.builder()
                .groupMeEnabled(featureConfigEntity.isGroupMeEnabled())
                .build();

    }
}
