package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.feature.FeatureConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeatureConfigRepository extends JpaRepository<FeatureConfigEntity, Long> {
    FeatureConfigEntity findFirstByOrderByIdDesc();
}
