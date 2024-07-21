package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
    Optional<ItemEntity> findByDescription(String description);
    Optional<ItemEntity> findByDescriptionAndRemovedIsTrue(String description);
    List<ItemEntity> findAllByIsSuggestedItem(Boolean isSuggestedItem);
}
