package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.feature.FeatureConfigEntity;
import com.mosaicchurchaustin.oms.data.request.UpdateFeatureConfigRequest;
import com.mosaicchurchaustin.oms.repositories.FeatureConfigRepository;
import com.mosaicchurchaustin.oms.services.sockets.FeaturesNotifier;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class FeaturesService {

    @Autowired
    FeaturesNotifier featuresNotifier;
    @Autowired
    FeatureConfigRepository featureConfigRepository;
    public static final String FEATURES_KEY = "featuresKey";


    @Cacheable(value = "features", key = "#root.target.FEATURES_KEY")
    @Transactional
    public FeatureConfigEntity getFeaturesConfig() {
        return featureConfigRepository.findFirstByOrderByIdDesc();
    }

    @CachePut(value = "features", key = "#root.target.FEATURES_KEY")
    public FeatureConfigEntity updateFeaturesConfig(final UpdateFeatureConfigRequest request) {
        final var existing = featureConfigRepository.findFirstByOrderByIdDesc();
        if (request.groupMeEnabled() != null) {
            existing.setGroupMeEnabled(request.groupMeEnabled());
        }
        final var result = featureConfigRepository.save(existing);
        featuresNotifier.notifyFeaturesChange(existing);
        return result;
    }
}
