package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventItemEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SpecialEventItemRepository extends JpaRepository<SpecialEventItemEntity, Long> {

    /**
     * Locks the event's lines for the given items, so two order takers can't both claim the last unit.
     * Ordered by id so concurrent orders for several items always lock in the same order.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM SpecialEventItemEntity i " +
            "WHERE i.specialEvent.id = :eventId AND i.itemEntity.id IN :itemIds " +
            "ORDER BY i.id")
    List<SpecialEventItemEntity> findForUpdate(@Param("eventId") Long eventId,
                                               @Param("itemIds") Collection<Long> itemIds);
}
