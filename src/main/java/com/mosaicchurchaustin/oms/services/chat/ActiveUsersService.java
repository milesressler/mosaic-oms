package com.mosaicchurchaustin.oms.services.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActiveUsersService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();

    @EventListener
    public void handleWebSocketConnectListener(final SessionConnectEvent event) {
        final StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        final Principal user = headerAccessor.getUser();
        
        if (user != null) {
            final String externalId = user.getName();
            activeUsers.add(externalId);
            log.debug("User connected: {}", externalId);
            
            // Broadcast online status change
            messagingTemplate.convertAndSend("/topic/user-status", 
                new UserStatusChange(externalId, true));
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(final SessionDisconnectEvent event) {
        final StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        final Principal user = headerAccessor.getUser();
        
        if (user != null) {
            final String externalId = user.getName();
            activeUsers.remove(externalId);
            log.debug("User disconnected: {}", externalId);
            
            // Broadcast offline status change
            messagingTemplate.convertAndSend("/topic/user-status", 
                new UserStatusChange(externalId, false));
        }
    }

    public Set<String> getActiveUsers() {
        return Set.copyOf(activeUsers);
    }

    public boolean isUserActive(final String externalId) {
        return activeUsers.contains(externalId);
    }

    public static class UserStatusChange {
        public final String externalId;
        public final boolean isOnline;

        public UserStatusChange(final String externalId, final boolean isOnline) {
            this.externalId = externalId;
            this.isOnline = isOnline;
        }
    }
}