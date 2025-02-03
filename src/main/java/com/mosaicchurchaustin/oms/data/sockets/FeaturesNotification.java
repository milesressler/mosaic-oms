package com.mosaicchurchaustin.oms.data.sockets;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class FeaturesNotification {
    Map<String, String> featureValues;
}
