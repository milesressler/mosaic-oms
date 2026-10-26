package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ItemLimitEntryRepository extends JpaRepository<ItemLimitEntryEntity, Long> {

    List<ItemLimitEntryEntity> findAllByCustomerIdOrderByReceivedOnDescIdDesc(Long customerId);

    List<ItemLimitEntryEntity> findAllByCustomerIdAndItemEntityIdIn(Long customerId, Collection<Long> itemIds);

    @Modifying
    @Query("UPDATE ItemLimitEntryEntity e SET e.customer.id = :toCustomerId WHERE e.customer.id = :fromCustomerId")
    int updateCustomerForAllEntries(@Param("fromCustomerId") Long fromCustomerId, @Param("toCustomerId") Long toCustomerId);
}
