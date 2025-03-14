package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Calendar;
import java.util.stream.Stream;

@Slf4j
@Component
public class MaintenanceService {

    @Autowired
    OrderRepository orderRepository;

    // Expires in 86400 seconds
    @Transactional
//    @Scheduled(fixedRate = 1, timeUnit = TimeUnit.DAYS)
    void cleanupOldOrders() {
        final Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -6);

        final Stream<OrderEntity> expiredOrders =
                orderRepository.findByCreatedBefore(calendar);

        expiredOrders.forEach(order -> {
            log.info("Cleaning up order {}", order.getId());
        });
    }
}
