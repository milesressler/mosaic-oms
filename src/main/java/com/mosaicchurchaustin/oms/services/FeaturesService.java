package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.request.UpdateFeatureConfigRequest;
import com.mosaicchurchaustin.oms.data.response.FeatureConfigResponse;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.FeatureConfigRepository;
import com.mosaicchurchaustin.oms.services.sockets.FeaturesNotifier;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeaturesService {

    @Autowired
    FeaturesNotifier featuresNotifier;

    @Autowired
    FeatureConfigRepository featureConfigRepository;
    public static final String FEATURES_KEY = "featuresKey";


    @Cacheable(value = "features", key = "#root.target.FEATURES_KEY")
    @Transactional
    public FeatureConfigResponse getFeaturesConfig() {
        return FeatureConfigResponse.from(featureConfigRepository.findFirstByOrderByIdDesc());
    }

    @CachePut(value = "features", key = "#root.target.FEATURES_KEY")
    public FeatureConfigResponse updateFeaturesConfig(final UpdateFeatureConfigRequest request) {
        final var existing = featureConfigRepository.findFirstByOrderByIdDesc();
        if (request.groupMeEnabled() != null) {
            existing.setGroupMeEnabled(request.groupMeEnabled());
        }

        if (request.printOnTransitionToStatus() != null) {
            if (request.printOnTransitionToStatus().isBlank()) {
                existing.setPrintOnTransitionToStatus(null);
            } else {
                final OrderStatus orderStatus = OrderStatus.valueOf(request.printOnTransitionToStatus());
                final var validStatus = List.of(OrderStatus.ACCEPTED, OrderStatus.PACKED);
                if (validStatus.contains(orderStatus)) {
                    existing.setPrintOnTransitionToStatus(orderStatus);
                } else {
                    throw new InvalidRequestException("Invalid print on transition to status: " + request.printOnTransitionToStatus());
                }
            }
        }
        final var result = featureConfigRepository.save(existing);
        featuresNotifier.notifyFeaturesChange(existing);
        return FeatureConfigResponse.from(result);
    }
}
