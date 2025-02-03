package com.mosaicchurchaustin.oms.services.sockets;

import com.google.common.collect.Maps;
import com.mosaicchurchaustin.oms.data.entity.feature.FeatureConfigEntity;
import com.mosaicchurchaustin.oms.data.sockets.FeaturesNotification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class FeaturesNotifier {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public FeaturesNotifier(final SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Method to send a message
    public void notifyFeaturesChange(FeatureConfigEntity features) {

        final var differences = Maps.difference(features.getPreviousState(), features.getCurrentState())
                .entriesDiffering()
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        val -> val.getValue().rightValue()
                ));
        final FeaturesNotification featuresNotification = FeaturesNotification.builder()
                .featureValues(differences)
                .build();

        messagingTemplate.convertAndSend("/topic/features/updated", featuresNotification);
    }
}
