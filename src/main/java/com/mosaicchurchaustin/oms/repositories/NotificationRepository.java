package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.notification.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    
    Optional<NotificationEntity> findFirstByRecipientIdOrderByCreatedDesc(Long recipientId);
    List<NotificationEntity> findByRecipientIdOrderByCreatedDesc(Long recipientId);

    Long countByRecipientId(Long recipientId);
    
    Long countByRecipientIdAndIdGreaterThan(Long recipientId, Long lastSeenId);
    
    @Query("SELECT n FROM NotificationEntity n WHERE n.recipient.id = :recipientId ORDER BY n.created DESC LIMIT :limit")
    List<NotificationEntity> findByRecipientIdOrderByCreatedDescWithLimit(@Param("recipientId") Long recipientId, @Param("limit") int limit);
    
    @Query("SELECT n FROM NotificationEntity n WHERE n.recipient.id = :recipientId AND n.id < :cursor ORDER BY n.created DESC LIMIT :limit")
    List<NotificationEntity> findByRecipientIdWithCursor(@Param("recipientId") Long recipientId, @Param("cursor") Long cursor, @Param("limit") int limit);
}
