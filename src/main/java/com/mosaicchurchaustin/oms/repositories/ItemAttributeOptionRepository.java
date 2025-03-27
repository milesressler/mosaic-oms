package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.item.ItemAttributeOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface ItemAttributeOptionRepository extends JpaRepository<ItemAttributeOption, Long> {
    void deleteByIdIn(Collection<Long> ids);
}
