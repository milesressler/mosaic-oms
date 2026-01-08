package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.entity.shower.ReservationStatus;
import com.mosaicchurchaustin.oms.data.entity.shower.ShowerReservationEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserSource;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.repositories.ShowerReservationRepository;
import com.mosaicchurchaustin.oms.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import static com.mosaicchurchaustin.oms.data.entity.order.OrderStatus.TERMINAL_STATES;

@Slf4j
@Component
public class MaintenanceService {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    OrderHistoryRepository orderHistoryRepository;

    @Autowired
    ShowerReservationRepository showerReservationRepository;


    // Expires in 43200 seconds
    @Transactional
    @Scheduled(fixedRate = 12, timeUnit = TimeUnit.HOURS)
    void expireLongRunningShowerReservations() {
        final Instant cutoff = Instant.now().minus(8, ChronoUnit.HOURS);
        
        final Stream<ShowerReservationEntity> expiredReservations = showerReservationRepository
                .findByReservationStatusIn(List.of(ReservationStatus.IN_USE, ReservationStatus.READY))
                .stream()
                .filter(reservation -> {
                    if (reservation.getReservationStatus() == ReservationStatus.IN_USE && reservation.getStartedAt() != null) {
                        return reservation.getStartedAt().isBefore(cutoff);
                    } else if (reservation.getReservationStatus() == ReservationStatus.READY
                            || reservation.getReservationStatus() == ReservationStatus.WAITING) {
                        return reservation.getCreated().isBefore(cutoff);
                    }
                    return false;
                });
        
        expiredReservations.forEach(reservation -> {
            log.info("Expiring long-running shower reservation {}", reservation.getUuid());
            reservation.setReservationStatus(ReservationStatus.CANCELLED);
            reservation.setEndedAt(Instant.now());
            showerReservationRepository.save(reservation);
        });
    }


    // Expires in 86400 seconds
    @Transactional
    @Scheduled(fixedRate = 1, timeUnit = TimeUnit.DAYS)
    void cleanupOldOrders() {
        final Instant instant = Instant.now().minus(6, ChronoUnit.DAYS);

        final UserEntity user = userRepository.findBySource(UserSource.SYSTEM)
                .findAny()
                .orElseThrow(() -> new RuntimeException("System user not found"));
        final Stream<OrderEntity> expiredOrders =
                orderRepository.findByCreatedBeforeAndOrderStatusNotIn(instant, TERMINAL_STATES);

        expiredOrders.forEach(order -> {
            log.info("Cleaning up order {}", order.getId());
            final OrderHistoryEntity orderHistoryEntity = OrderHistoryEntity
                    .builder()
                    .orderEntity(order)
                    .orderStatus(OrderStatus.CANCELLED)
                    .eventType(OrderEventType.STATUS_CHANGE)
                    .comment("Order expired")
                    .previousOrderStatus(order.getOrderStatus())
                    .userEntity(user)
                    .build();
            orderHistoryRepository.save(orderHistoryEntity);
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        });
    }
}
