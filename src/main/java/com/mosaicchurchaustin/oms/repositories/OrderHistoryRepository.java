package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistoryEntity, Long> {
    List<OrderHistoryEntity> findByUserEntityExternalIdOrderByTimestampDesc(String userExternalId);
    Page<OrderHistoryEntity> findAllByOrderEntityId(Pageable pageable, Long orderId);
}
