package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.sockets.OrderNotification;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationController {
    @MessageMapping("/order")
    @SendTo("/topic/orders/created")
    public OrderNotification send(final OrderNotification notification) {
        return notification;
    }

    @MessageMapping("/authorize")
    @SendTo("/topic/orders/created")
    public String send(final String notification) {
        return "got it";
    }

    @MessageMapping("/broadcast")
    @SendTo("/topic/reply")
    public String broadcastMessage(@Payload String message) {
        System.out.println("message: " + message);
        return "You have received a message: " + message;
    }
}
