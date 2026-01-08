package com.mosaicchurchaustin.oms.services.showers;

import com.google.common.collect.Lists;
import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.shower.ReservationStatus;
import com.mosaicchurchaustin.oms.data.entity.shower.ShowerReservationEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.request.shower.ShowerReservationRequest;
import com.mosaicchurchaustin.oms.data.response.CustomerResponse;
import com.mosaicchurchaustin.oms.data.response.ShowerQueueResponse;
import com.mosaicchurchaustin.oms.data.response.ShowerReservationResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.ShowerReservationRepository;
import com.mosaicchurchaustin.oms.services.common.CustomerResolver;
import com.mosaicchurchaustin.oms.services.common.common.UserResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

@Service
public class ShowersService {
    private static final long DEFAULT_QUEUE_INCREMENT = 100L;

    private static final int STALL_COUNT = 2;
    private static final int SHOWER_DURATION_MINUTES = 15;
    private static final int CLEANUP_MINUTES = 3;

    @Autowired
    ShowerReservationRepository showerReservationRepository;

    @Autowired
    CustomerResolver customerResolver;

    @Autowired
    UserResolver userResolver;


    // todo @Cacheable()
    public ShowerQueueResponse getGroupedQueue(final Pageable pageable) {
        final Instant now = Instant.now();

        // 1) Fetch active reservations (IN_USE or READY)
        final List<ShowerReservationEntity> activeList = showerReservationRepository
                .findByReservationStatusIn(Lists.newArrayList(
                        ReservationStatus.IN_USE,
                        ReservationStatus.READY
                ));

        // Map stall number -> active reservation
        final Map<Integer, ShowerReservationEntity> activeByStall = activeList.stream()
                .filter(r -> r.getShowerNumber() != null)
                .collect(Collectors.toMap(
                        ShowerReservationEntity::getShowerNumber,
                        r -> r
                ));

        // 2) Compute next-free times from active reservations
        final List<Instant> nextFree = activeByStall.values().stream()
                .map(r -> {
                    // For in-use: scheduled end = startedAt + duration, then cleanup
                    if (r.getReservationStatus() == ReservationStatus.IN_USE && r.getStartedAt() != null) {
                        Instant scheduledEnd = r.getStartedAt().plus(SHOWER_DURATION_MINUTES, ChronoUnit.MINUTES);
                        Instant cleanupEnd = scheduledEnd.plus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
                        // If overdue, enforce at least now + cleanup
                        Instant minNext = now.plus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
                        return cleanupEnd.isAfter(minNext) ? cleanupEnd : minNext;
                    }
                    // For READY (assigned but not started): available after cleanup from now
                    if (r.getReservationStatus() == ReservationStatus.READY) {
                        return now.plus(CLEANUP_MINUTES, ChronoUnit.MINUTES).plus(SHOWER_DURATION_MINUTES, ChronoUnit.MINUTES);
                    }
                    // Fallback: available now
                    return now;
                })
                .sorted()
                .collect(Collectors.toCollection(Lists::newArrayList));

        // 3) Include cleanup windows for recently completed reservations
        final Instant cleanupThreshold = now.minus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
        final List<ShowerReservationEntity> recentCompleted = showerReservationRepository
                .findByReservationStatusAndEndedAtAfter(
                        ReservationStatus.COMPLETED,
                        cleanupThreshold
                );
        final Map<Integer, Instant> cleanupUntil = new HashMap<>();
        for (var ent : recentCompleted) {
            if (ent.getShowerNumber() != null && ent.getEndedAt() != null) {
                cleanupUntil.put(
                        ent.getShowerNumber(),
                        ent.getEndedAt().plus(CLEANUP_MINUTES, ChronoUnit.MINUTES)
                );
            }
        }
        cleanupUntil.values().stream()
                .filter(t -> t.isAfter(now))
                .forEach(nextFree::add);

        // 4) Pad with 'now' for empty stalls
        while (nextFree.size() < STALL_COUNT) {
            nextFree.add(now);
        }
        nextFree.sort(Comparator.naturalOrder());

        // Snapshot schedule for queue estimation
        final List<Instant> initialSchedule = Lists.newArrayList(nextFree);

        // 5) Build StallStatus list, factoring in start time, end time, and cleanup
        final List<ShowerQueueResponse.StallStatus> stalls = Lists.newArrayList();
        for (int i = 1; i <= STALL_COUNT; i++) {
            final ShowerReservationEntity ent = activeByStall.get(i);

            // Determine scheduled end: use startedAt if present, else endedAt, else now
            final Instant scheduledEnd;
            if (ent != null) {
                if (ent.getStartedAt() != null) {
                    scheduledEnd = ent.getStartedAt()
                            .plus(SHOWER_DURATION_MINUTES, ChronoUnit.MINUTES);
                } else if (ent.getEndedAt() != null) {
                    scheduledEnd = ent.getEndedAt();
                } else {
                    scheduledEnd = now;
                }
            } else {
                scheduledEnd = now;
            }

            // Add cleanup window after scheduled end
            final Instant baseFree = scheduledEnd.plus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
            // Also respect any recent cleanup from completed entries
            final Instant cleanupFree = cleanupUntil.getOrDefault(i, baseFree);
            final Instant availableAt = baseFree.isAfter(cleanupFree) ? baseFree : cleanupFree;

            stalls.add(new ShowerQueueResponse.StallStatus(
                    i,
                    ent == null ? ReservationStatus.READY : ent.getReservationStatus(),
                    ent != null ? ShowerReservationResponse.from(ent) : null,
                    availableAt
            ));
        }

        // 6) Fetch waiting queue page
        final Page<ShowerReservationEntity> waitingPage = showerReservationRepository
                .findByReservationStatusOrderByQueuePositionAsc(
                        ReservationStatus.WAITING,
                        pageable
                );
        final List<ShowerReservationEntity> waitingList = waitingPage.getContent();

        // 7) Compute queue entries
        final List<Instant> schedule = Lists.newArrayList(initialSchedule);
        final List<ShowerQueueResponse.QueueEntryResponse> queueDto = Lists.newArrayList();
        for (final ShowerReservationEntity ent : waitingList) {
            final Instant startAt = schedule.remove(0);
            final boolean readyNow = !startAt.isAfter(now);

            queueDto.add(new ShowerQueueResponse.QueueEntryResponse(
                    ent.getUuid(),
                    CustomerResponse.from(ent.getCustomer()),
                    ent.getQueuePosition(),
                    startAt,
                    readyNow
            ));

            schedule.add(startAt.plus(SHOWER_DURATION_MINUTES + CLEANUP_MINUTES, ChronoUnit.MINUTES));
            Collections.sort(schedule);
        }

        // 8) Return combined response
        return new ShowerQueueResponse(stalls, queueDto);
    }

    public ShowerQueueResponse getShowerQueue(Pageable pageable) {
        Instant now = Instant.now();

        // 1) calculate stalls
        List<ShowerQueueResponse.StallStatus> stalls = calculateStallStatuses();

        // 2) build initial schedule from stall availability
        List<Instant> schedule = stalls.stream()
                .map(ShowerQueueResponse.StallStatus::availableAt)
                .sorted()
                .collect(Collectors.toList());

        // 3) fetch waiting queue
        Page<ShowerReservationEntity> waitingPage =
                showerReservationRepository.findByReservationStatusOrderByQueuePositionAsc(
                        ReservationStatus.WAITING,
                        pageable
                );
        List<ShowerReservationEntity> waitingList = waitingPage.getContent();

        // 4) build queue entries
        List<ShowerQueueResponse.QueueEntryResponse> queue = new ArrayList<>();
        for (ShowerReservationEntity ent : waitingList) {
            Instant startAt = schedule.remove(0);
            boolean readyNow = !startAt.isAfter(now);

            queue.add(new ShowerQueueResponse.QueueEntryResponse(
                    ent.getUuid(),
                    CustomerResponse.from(ent.getCustomer()),
                    ent.getQueuePosition(),
                    startAt,
                    readyNow
            ));

            // push back this stall’s next free time
            schedule.add(startAt
                    .plus(SHOWER_DURATION_MINUTES + CLEANUP_MINUTES, ChronoUnit.MINUTES));
            Collections.sort(schedule);
        }

        return new ShowerQueueResponse(stalls, queue);
    }


    public List<ShowerQueueResponse.StallStatus> calculateStallStatuses() {
        Instant now              = Instant.now();
        Instant cleanupThreshold = now.minus(CLEANUP_MINUTES, ChronoUnit.MINUTES);

        // 1) fetch only what we need
        List<ShowerReservationEntity> activeOrReady   = showerReservationRepository.findByReservationStatusIn(
                List.of(ReservationStatus.IN_USE, ReservationStatus.READY)
        );
        List<ShowerReservationEntity> recentCompleted = showerReservationRepository.findByReservationStatusAndEndedAtAfter(
                ReservationStatus.COMPLETED,
                cleanupThreshold
        );

        // 2) combine & group by stall number
        Map<Integer, List<ShowerReservationEntity>> byStall = Stream
                .concat(activeOrReady.stream(), recentCompleted.stream())
                .filter(r -> r.getShowerNumber() != null)
                .collect(Collectors.groupingBy(ShowerReservationEntity::getShowerNumber));

        // 3) one pass to build statuses
        return IntStream.rangeClosed(1, STALL_COUNT)
                .mapToObj(stallNum -> {
                    List<ShowerReservationEntity> list =
                            byStall.getOrDefault(stallNum, Collections.emptyList());

                    // find active/reserved if any
                    Optional<ShowerReservationEntity> activeOpt = list.stream()
                            .filter(r -> r.getReservationStatus() != ReservationStatus.COMPLETED)
                            .findFirst();

                    // compute the max availability across all entries for this stall
                    Instant availableAt = list.stream()
                            .map(r -> computeAvailability(r, now))
                            .max(Comparator.naturalOrder())
                            .orElse(now);

                    return new ShowerQueueResponse.StallStatus(
                            stallNum,
                            activeOpt.map(ShowerReservationEntity::getReservationStatus)
                                    .orElse(ReservationStatus.READY),
                            activeOpt.map(ShowerReservationResponse::from).orElse(null),
                            availableAt
                    );
                })
                .collect(Collectors.toList());
    }

    // handles IN_USE, READY, or COMPLETED cleanup
    private Instant computeAvailability(ShowerReservationEntity r, Instant now) {
        return switch (r.getReservationStatus()) {
            case IN_USE -> {
                Instant end   = r.getStartedAt().plus(SHOWER_DURATION_MINUTES, ChronoUnit.MINUTES);
                Instant clean = end.plus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
                // enforce at least now+cleanup if overdue
                Instant floor = now.plus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
                yield clean.isAfter(floor) ? clean : floor;
            }
            case READY -> now.plus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
            case COMPLETED -> r.getEndedAt().plus(CLEANUP_MINUTES, ChronoUnit.MINUTES);
            default -> now;
        };
    }


    // todo @Cacheable()
    public Page<ShowerReservationEntity> getAll(final Pageable pageable) {
        return showerReservationRepository.findAll(pageable);
    }

    public ShowerReservationEntity createReservation(final ShowerReservationRequest request) {
        // Find or create customer
        final UserEntity userEntity = userResolver.resolveOrCreate();
        final CustomerEntity customer = customerResolver.resolveOrCreate(
                request.customerUuid(),
                null,
                null
        );

        if (!customer.isWaiverValid()) {
            throw new InvalidRequestException("Customer does not have a valid waiver");
        }

        // Get current max queue position
        final Long nextQueuePosition = showerReservationRepository
                .findTopByReservationStatusOrderByQueuePositionDesc(ReservationStatus.WAITING)
                .map(ShowerReservationEntity::getQueuePosition)
                .map(queuePosition -> queuePosition + DEFAULT_QUEUE_INCREMENT)
                .orElse(0L);

        // Create new reservation
        final ShowerReservationEntity reservation = ShowerReservationEntity.builder()
                .customer(customer)
                .createdBy(userEntity)
                .reservationStatus(ReservationStatus.WAITING)
                .queuePosition(nextQueuePosition)
                .build();

        return showerReservationRepository.save(reservation);
    }

    public ShowerReservationEntity cancelReservation(final UUID id) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException(ShowerReservationEntity.ENTITY_NAME, id.toString()));

        reservation.setReservationStatus(ReservationStatus.CANCELLED);
        reservation.setEndedAt(Instant.now());
        return showerReservationRepository.save(reservation);
    }

    public ShowerReservationEntity showerIsReady(final UUID id, final Integer showerNumber) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.WAITING) {
            throw new InvalidRequestException("Only WAITING reservations can be made ready.");
        }

        showerReservationRepository.findByShowerNumberAndReservationStatus(
                showerNumber, ReservationStatus.IN_USE
        ).ifPresent(showerReservation -> {
            throw new InvalidRequestException("Shower already in use.");
        });

        showerReservationRepository.findByShowerNumberAndReservationStatus(
                showerNumber, ReservationStatus.READY
        ).ifPresent(showerReservation -> {
            throw new InvalidRequestException("Shower already assigned to someone else.");
        });

        reservation.setReservationStatus(ReservationStatus.READY);
        reservation.setShowerNumber(showerNumber);
        return showerReservationRepository.save(reservation);
    }

    public ShowerReservationEntity startShower(final UUID id) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.READY) {
            throw new InvalidRequestException("Only READY reservations can be started.");
        }

        showerReservationRepository.findByShowerNumberAndReservationStatus(
                reservation.getShowerNumber(),
                ReservationStatus.IN_USE
        ).ifPresent(showerReservation -> {
            throw new InvalidRequestException("Shower already in use.");
        });

        reservation.setReservationStatus(ReservationStatus.IN_USE);
        reservation.setStartedAt(Instant.now());
        return showerReservationRepository.save(reservation);
    }


    public ShowerReservationEntity endShower(final UUID id) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.IN_USE) {
            throw new InvalidRequestException("Only WAITING reservations can be started.");
        }

        reservation.setReservationStatus(ReservationStatus.COMPLETED);
        reservation.setEndedAt(Instant.now());
        return showerReservationRepository.save(reservation);
    }


    public ShowerReservationEntity updateQueuePosition(final UUID id, final Long newQueueIndex) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.WAITING) {
            throw new InvalidRequestException("Only WAITING reservations can be reordered.");
        }

        // Get all waiting reservations ordered by position
        final List<ShowerReservationEntity> allWaiting = showerReservationRepository
                .findByReservationStatusOrderByQueuePositionAsc(ReservationStatus.WAITING, Pageable.unpaged())
                .getContent();

        // Find current index in the ordered list
        int currentIndex = -1;
        for (int i = 0; i < allWaiting.size(); i++) {
            if (allWaiting.get(i).getUuid().equals(reservation.getUuid())) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex == -1) {
            throw new IllegalStateException("Reservation not found in waiting queue");
        }

        // Convert 1-based frontend index to 0-based
        int newIndex = (int) (newQueueIndex - 1);
        
        // Validate new index
        if (newIndex < 0 || newIndex >= allWaiting.size()) {
            throw new InvalidRequestException("Invalid queue position");
        }

        if (currentIndex == newIndex) {
            return reservation;
        }

        // Remove from current position and insert at new position
        ShowerReservationEntity moving = allWaiting.remove(currentIndex);
        allWaiting.add(newIndex, moving);

        // Reassign all position values based on the new order
        for (int i = 0; i < allWaiting.size(); i++) {
            allWaiting.get(i).setQueuePosition((long) i * DEFAULT_QUEUE_INCREMENT);
        }

        // Save all affected reservations
        showerReservationRepository.saveAll(allWaiting);
        
        return reservation;
    }

    public ShowerReservationEntity moveUp(final UUID id) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.WAITING) {
            throw new InvalidRequestException("Only WAITING reservations can be reordered.");
        }

        // Get all waiting reservations ordered by position
        final List<ShowerReservationEntity> allWaiting = showerReservationRepository
                .findByReservationStatusOrderByQueuePositionAsc(ReservationStatus.WAITING, Pageable.unpaged())
                .getContent();

        // Find current index in the ordered list
        int currentIndex = -1;
        for (int i = 0; i < allWaiting.size(); i++) {
            if (allWaiting.get(i).getUuid().equals(reservation.getUuid())) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex == -1) {
            throw new IllegalStateException("Reservation not found in waiting queue");
        }

        // Can't move up if already first
        if (currentIndex == 0) {
            return reservation;
        }

        // Swap with the person above (lower index)
        ShowerReservationEntity current = allWaiting.get(currentIndex);
        ShowerReservationEntity above = allWaiting.get(currentIndex - 1);
        
        Long tempPosition = current.getQueuePosition();
        current.setQueuePosition(above.getQueuePosition());
        above.setQueuePosition(tempPosition);

        showerReservationRepository.saveAll(List.of(current, above));
        return current;
    }

    public ShowerReservationEntity moveDown(final UUID id) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.WAITING) {
            throw new InvalidRequestException("Only WAITING reservations can be reordered.");
        }

        // Get all waiting reservations ordered by position
        final List<ShowerReservationEntity> allWaiting = showerReservationRepository
                .findByReservationStatusOrderByQueuePositionAsc(ReservationStatus.WAITING, Pageable.unpaged())
                .getContent();

        // Find current index in the ordered list
        int currentIndex = -1;
        for (int i = 0; i < allWaiting.size(); i++) {
            if (allWaiting.get(i).getUuid().equals(reservation.getUuid())) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex == -1) {
            throw new IllegalStateException("Reservation not found in waiting queue");
        }

        // Can't move down if already last
        if (currentIndex == allWaiting.size() - 1) {
            return reservation;
        }

        // Swap with the person below (higher index)
        ShowerReservationEntity current = allWaiting.get(currentIndex);
        ShowerReservationEntity below = allWaiting.get(currentIndex + 1);
        
        Long tempPosition = current.getQueuePosition();
        current.setQueuePosition(below.getQueuePosition());
        below.setQueuePosition(tempPosition);

        showerReservationRepository.saveAll(List.of(current, below));
        return current;
    }
}
