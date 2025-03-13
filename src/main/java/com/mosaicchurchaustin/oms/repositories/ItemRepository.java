package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
    Optional<ItemEntity> findByDescription(String description);
    Optional<ItemEntity> findByDescriptionAndRemovedIsTrue(String description);

    @Query("""
        SELECT i FROM ItemEntity i
        LEFT JOIN OrderItemEntity oi ON i.id = oi.itemEntity.id
        WHERE i.isSuggestedItem = true and i.removed = false
        GROUP BY i.id
        ORDER BY COUNT(oi.orderEntity.id) DESC
    """)
    Stream<ItemEntity> findAllSuggestedItems();

    Page<ItemEntity> findAllByRemovedIsFalse(Pageable pageable);


}
