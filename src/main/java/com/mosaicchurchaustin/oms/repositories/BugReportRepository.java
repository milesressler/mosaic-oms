package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.BugReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BugReportRepository extends JpaRepository<BugReportEntity, Long> {
    Optional<BugReportEntity> findByUuid(String uuid);
    List<BugReportEntity> findByStatusOrderByCreatedDesc(BugReportEntity.BugReportStatus status);
    List<BugReportEntity> findAllByOrderByCreatedDesc();
    
    @Query("SELECT b FROM BugReportEntity b WHERE (b.posthogEventId IS NULL OR b.posthogEventId = '') AND b.created > :cutoffTime ORDER BY b.created DESC")
    List<BugReportEntity> findRecentBugsWithoutPostHogEventId(@Param("cutoffTime") Instant cutoffTime);
}