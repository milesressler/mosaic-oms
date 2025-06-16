package com.mosaicchurchaustin.oms.services.showers;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.shower.ReservationStatus;
import com.mosaicchurchaustin.oms.data.entity.shower.ShowerReservationEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.request.shower.ShowerReservationRequest;
import com.mosaicchurchaustin.oms.data.response.ShowerReservationGroupedResponse;
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
import java.util.List;
import java.util.UUID;

@Service
public class ShowersService {
    private static final long DEFAULT_QUEUE_INCREMENT = 100L;

    @Autowired
    ShowerReservationRepository showerReservationRepository;

    @Autowired
    CustomerResolver customerResolver;

    @Autowired
    UserResolver userResolver;


    // todo @Cacheable()
    public ShowerReservationGroupedResponse getGroupedQueue(Pageable pageable) {
        final List<ShowerReservationEntity> activeList =
                showerReservationRepository.findQueueByStatus(ReservationStatus.IN_USE, Pageable.ofSize(20)).getContent();

        final Page<ShowerReservationEntity> waitingPage =
                showerReservationRepository.findQueueByStatus(ReservationStatus.WAITING, pageable);

        return new ShowerReservationGroupedResponse(
                activeList.stream().map(ShowerReservationResponse::from).toList(),
                waitingPage.map(ShowerReservationResponse::from)
        );
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

    public ShowerReservationEntity startShower(final UUID id, final Integer showerNumber) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.WAITING) {
            throw new InvalidRequestException("Only WAITING reservations can be started.");
        }

        showerReservationRepository.findByShowerNumberAndReservationStatus(
                showerNumber, ReservationStatus.IN_USE
        ).ifPresent(showerReservation -> {
            throw new InvalidRequestException("Shower already in use.");
        });

        reservation.setReservationStatus(ReservationStatus.IN_USE);
        reservation.setStartedAt(Instant.now());
        reservation.setShowerNumber(showerNumber);
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


    public ShowerReservationEntity updateQueuePosition(final UUID id, final Long newPosition) {
        final ShowerReservationEntity reservation = showerReservationRepository.findByUuid(id.toString())
                .orElseThrow(() -> new EntityNotFoundException("ShowerReservation", id.toString()));

        if (reservation.getReservationStatus() != ReservationStatus.WAITING) {
            throw new InvalidRequestException("Only WAITING reservations can be reordered.");
        }

        reservation.setQueuePosition(newPosition);
        return showerReservationRepository.save(reservation);
    }
}
