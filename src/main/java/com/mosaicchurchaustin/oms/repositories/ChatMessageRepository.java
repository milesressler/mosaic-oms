package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.projections.ChatParticipantProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, UUID> {

    @Query("SELECT cm FROM ChatMessageEntity cm WHERE cm.recipient IS NULL ORDER BY cm.createdAt DESC")
    Page<ChatMessageEntity> findGlobalMessages(Pageable pageable);

    @Query("SELECT cm FROM ChatMessageEntity cm WHERE " +
           "(cm.sender = :user1 AND cm.recipient = :user2) OR " +
           "(cm.sender = :user2 AND cm.recipient = :user1) " +
           "ORDER BY cm.createdAt DESC")
    Page<ChatMessageEntity> findDirectMessagesBetweenUsers(
            @Param("user1") UserEntity user1,
            @Param("user2") UserEntity user2,
            Pageable pageable
    );


    @Query("SELECT cm FROM ChatMessageEntity cm WHERE cm.content LIKE %:searchTerm% " +
           "AND (cm.recipient IS NULL OR cm.sender = :user OR cm.recipient = :user) " +
           "ORDER BY cm.createdAt DESC")
    Page<ChatMessageEntity> searchMessages(
            @Param("searchTerm") String searchTerm,
            @Param("user") UserEntity user,
            Pageable pageable
    );

    @Query("SELECT u.uuid as uuid, u.externalId as externalId, u.name as name, u.avatar as avatar, " +
           "SUBSTRING(lastMsg.content, 1, 100) as lastMessageContent, " +
           "lastMsg.createdAt as lastMessageTime, " +
           "CASE WHEN lastMsg.sender = :currentUser THEN true ELSE false END as lastMessageFromMe " +
           "FROM UserEntity u " +
           "LEFT JOIN ChatMessageEntity lastMsg ON lastMsg.id = ( " +
               "SELECT cm2.id FROM ChatMessageEntity cm2 " +
               "WHERE ((cm2.sender = u AND cm2.recipient = :currentUser) OR " +
                      "(cm2.sender = :currentUser AND cm2.recipient = u)) " +
               "ORDER BY cm2.createdAt DESC LIMIT 1" +
           ") " +
           "ORDER BY lastMsg.createdAt DESC NULLS LAST, u.name ASC")
    List<ChatParticipantProjection> findParticipantsOrderedByRecentActivity(@Param("currentUser") UserEntity currentUser);
}