package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.BugReportEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.request.CreateBugReportRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateBugReportRequest;
import com.mosaicchurchaustin.oms.data.response.BugReportResponse;
import com.mosaicchurchaustin.oms.repositories.BugReportRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class BugReportService {

    @Autowired
    BugReportRepository bugReportRepository;

    @Autowired
    UserService userService;

    @Autowired
    PostHogService postHogService;

    @Autowired
    TaskScheduler taskScheduler;

    @Transactional
    public BugReportResponse createBugReport(final CreateBugReportRequest request) {
        final UserEntity reporter = userService.currentUser();
        
        final BugReportEntity bugReport = BugReportEntity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(BugReportEntity.BugReportStatus.OPEN)
                .reporter(reporter)
                .build();

        final BugReportEntity savedBugReport = bugReportRepository.save(bugReport);
        
        // Schedule PostHog event ID lookup 10 seconds after creation
        taskScheduler.schedule(
            () -> updatePostHogEventIdForBug(savedBugReport.getUuid()),
            Instant.now().plus(Duration.ofSeconds(10))
        );
        
        return BugReportResponse.from(savedBugReport);
    }

    public List<BugReportResponse> getAllBugReports() {
        return bugReportRepository.findAllByOrderByCreatedDesc().stream()
                .map(BugReportResponse::from)
                .toList();
    }

    public List<BugReportResponse> getBugReportsByStatus(final BugReportEntity.BugReportStatus status) {
        return bugReportRepository.findByStatusOrderByCreatedDesc(status).stream()
                .map(BugReportResponse::from)
                .toList();
    }

    public Optional<BugReportResponse> getBugReportByUuid(final String uuid) {
        return bugReportRepository.findByUuid(uuid)
                .map(BugReportResponse::from);
    }

    @Transactional
    public Optional<BugReportResponse> updateBugReport(final String uuid, final UpdateBugReportRequest request) {
        return bugReportRepository.findByUuid(uuid)
                .map(bugReport -> {
                    if (request.getStatus() != null) {
                        bugReport.setStatus(request.getStatus());
                    }
                    return BugReportResponse.from(bugReportRepository.save(bugReport));
                });
    }

    @Transactional
    public void updatePostHogEventId(final String uuid, final String posthogEventId) {
        bugReportRepository.findByUuid(uuid)
                .ifPresent(bugReport -> {
                    bugReport.setPosthogEventId(posthogEventId);
                    bugReportRepository.save(bugReport);
                });
    }

    /**
     * Update PostHog event ID for a single bug report
     */
    @Async
    public void updatePostHogEventIdForBug(final String bugUuid) {
        try {
            final String eventId = postHogService.findBugReportEventId(bugUuid);
            if (eventId != null) {
                updatePostHogEventId(bugUuid, eventId);
                log.info("Updated bug report {} with PostHog event ID {}", bugUuid, eventId);
            } else {
                log.debug("No PostHog event found yet for bug {}", bugUuid);
            }
        } catch (final Exception e) {
            log.warn("Failed to update PostHog event ID for bug {}: {}", bugUuid, e.getMessage());
        }
    }

    /**
     * Scheduled task to find and update PostHog event IDs for recent bug reports
     * Runs every hour to catch any bugs that weren't processed by the 10-second delay
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Async
    public void updateMissingPostHogEventIds() {
        try {
            final Instant cutoffTime = Instant.now().minus(Duration.ofDays(1)); // Only check bugs from past day
            final List<BugReportEntity> bugsWithoutEventIds = bugReportRepository
                    .findRecentBugsWithoutPostHogEventId(cutoffTime);

            if (bugsWithoutEventIds.isEmpty()) {
                return;
            }

            log.info("Searching PostHog for {} recent bug report event IDs", bugsWithoutEventIds.size());

            bugsWithoutEventIds.stream()
                    .map(BaseUuidEntity::getUuid)
                    .forEach(this::updatePostHogEventIdForBug);

        } catch (final Exception e) {
            log.error("Error in scheduled PostHog event ID update task: {}", e.getMessage());
        }
    }
}
