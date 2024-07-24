package com.mosaicchurchaustin.oms.services.sockets;

import com.mosaicchurchaustin.oms.data.sockets.OrderNotification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderNotifier {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public OrderNotifier(final SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Method to send a message
    public void notifyOrderCreated(final OrderNotification notification) {
        messagingTemplate.convertAndSend("/topic/orders", notification);
    }

    // Example: Send a message every 5 seconds for demonstration purposes
    @Scheduled(fixedRate = 5000)
    public void sendPeriodicNotifications() {
        final OrderNotification notification = new OrderNotification(1L);
        notifyOrderCreated(notification);
    }
}
