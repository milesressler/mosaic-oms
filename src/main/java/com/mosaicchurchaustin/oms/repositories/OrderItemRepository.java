package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    void deleteByIdIn(Collection<Long> ids);
}
