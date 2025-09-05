package com.mosaicchurchaustin.oms.services.sockets;

import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageEntity;
import com.mosaicchurchaustin.oms.data.response.ChatMessageResponse;
import com.mosaicchurchaustin.oms.data.sockets.ChatNotification;
import com.mosaicchurchaustin.oms.services.ChatMessageEnricher;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatNotifier {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageEnricher chatMessageEnricher;

    public void notifyNewMessage(ChatMessageEntity message) {
        // Enrich the message with order details before sending via WebSocket
        ChatMessageResponse enrichedMessage = chatMessageEnricher.enrichMessageWithOrderDetails(message);
        
        ChatNotification notification = ChatNotification.builder()
                .message(enrichedMessage)
                .senderExtId(message.getSender().getExternalId())
                .senderName(message.getSender().getName())
                .build();

        if (message.isGlobalMessage()) {
            messagingTemplate.convertAndSend("/topic/chat/global", notification);
        } else {
            String senderChannel = "/topic/chat/dm/" + message.getSender().getExternalId();
            String recipientChannel = "/topic/chat/dm/" + message.getRecipient().getExternalId();
            
            messagingTemplate.convertAndSend(senderChannel, notification);
            messagingTemplate.convertAndSend(recipientChannel, notification);
        }
    }
}