package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialEventRepository extends JpaRepository<SpecialEventEntity, Long> {

    Optional<SpecialEventEntity> findByUuid(String uuid);

    List<SpecialEventEntity> findAllByOrderByCreatedDesc();
}
