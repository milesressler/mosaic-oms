package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.item.ItemAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface ItemAttributeRepository extends JpaRepository<ItemAttribute, Long> {
    void deleteByIdIn(Collection<Long> ids);
}
