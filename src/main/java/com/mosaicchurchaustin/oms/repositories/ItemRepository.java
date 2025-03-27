package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface ItemRepository extends JpaRepository<ItemEntity, Long>, JpaSpecificationExecutor<ItemEntity> {
    Optional<ItemEntity> findByDescription(String description);

    @Query("""
        SELECT i FROM ItemEntity i
        LEFT JOIN OrderItemEntity oi ON i.id = oi.itemEntity.id
        WHERE i.managed = true AND i.availability != 'DISCONTINUED'
        GROUP BY i.id
        ORDER BY COUNT(oi.orderEntity.id) DESC
    """)
    Stream<ItemEntity> findAllManagedItems();

    Page<ItemEntity> findAllByManagedIsTrue(Pageable pageable);


}
