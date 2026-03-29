package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.AiQueryLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiQueryLogRepository extends JpaRepository<AiQueryLogEntity, Long> {
}
