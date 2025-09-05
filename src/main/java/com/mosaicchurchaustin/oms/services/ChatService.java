package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageEntity;
import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageType;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.projections.ChatParticipantProjection;
import com.mosaicchurchaustin.oms.data.projections.OrderPreviewProjection;
import com.mosaicchurchaustin.oms.data.request.ChatMessageRequest;
import com.mosaicchurchaustin.oms.data.response.ChatMessageResponse;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import com.mosaicchurchaustin.oms.data.response.UserResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.repositories.ChatMessageRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.repositories.UserRepository;
import com.mosaicchurchaustin.oms.services.chat.ActiveUsersService;
import com.mosaicchurchaustin.oms.services.sockets.ChatNotifier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ChatNotifier chatNotifier;
    private final OrderRepository orderRepository;
    private final ActiveUsersService activeUsersService;

    private static final Pattern ORDER_REFERENCE_PATTERN = Pattern.compile("(?i)#(\\d+)");

    public ChatMessageEntity sendMessage(final ChatMessageRequest request) {
        final UserEntity sender = userService.currentUser();
        UserEntity recipient = null;

        if (request.getRecipientId() != null) {
            recipient = userRepository.findByUuid(request.getRecipientId().toString()).orElseThrow(() -> new EntityNotFoundException(UserEntity.ENTITY_TYPE, request.getRecipientId().toString()));
        }

        final ChatMessageType messageType = ORDER_REFERENCE_PATTERN.matcher(request.getContent()).find() 
                ? ChatMessageType.ORDER_REFERENCE 
                : ChatMessageType.TEXT;

        final ChatMessageEntity message = ChatMessageEntity.builder()
                .sender(sender)
                .recipient(recipient)
                .content(request.getContent())
                .messageType(messageType)
                .createdAt(Instant.now())
                .isEdited(false)
                .build();

        final ChatMessageEntity savedMessage = chatMessageRepository.save(message);
        
        chatNotifier.notifyNewMessage(savedMessage);
        
        return savedMessage;
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getGlobalMessages(final Pageable pageable) {
        final Page<ChatMessageEntity> messages = chatMessageRepository.findGlobalMessages(pageable);
        return messages.map(this::enrichMessageWithOrderDetails);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getDirectMessages(final UUID userId, final Pageable pageable) {
        final UserEntity currentUser = userService.currentUser();
        final UserEntity otherUser = userRepository.findByUuid(userId.toString()).orElseThrow(() -> new EntityNotFoundException(UserEntity.ENTITY_TYPE, userId.toString()));
        
        final Page<ChatMessageEntity> messages = chatMessageRepository.findDirectMessagesBetweenUsers(currentUser, otherUser, pageable);
        return messages.map(this::enrichMessageWithOrderDetails);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getDirectMessageParticipants() {
        final UserEntity currentUser = userService.currentUser();
        final List<ChatParticipantProjection> participantsWithLastMessage = chatMessageRepository.findParticipantsOrderedByRecentActivity(currentUser);
        
        return participantsWithLastMessage.stream()
                .map(this::convertProjectionToUserResponse)
                .toList();
    }

    private UserResponse convertProjectionToUserResponse(final ChatParticipantProjection projection) {
        final boolean isOnline = activeUsersService.isUserActive(projection.getExternalId());
        return UserResponse.builder()
                .uuid(projection.getUuid())
                .externalId(projection.getExternalId())
                .name(projection.getName())
                .avatar(projection.getAvatar())
                .lastMessageContent(projection.getLastMessageContent())
                .lastMessageTime(projection.getLastMessageTime())
                .lastMessageFromMe(projection.getLastMessageFromMe())
                .isOnline(isOnline)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageEntity> searchMessages(final String searchTerm, final Pageable pageable) {
        final UserEntity currentUser = userService.currentUser();
        return chatMessageRepository.searchMessages(searchTerm, currentUser, pageable);
    }

    private ChatMessageResponse enrichMessageWithOrderDetails(final ChatMessageEntity message) {
        final ChatMessageResponse baseResponse = ChatMessageResponse.from(message);
        
        // Extract order IDs from the message content
        final String[] orderReferences = baseResponse.getOrderReferences();
        if (orderReferences.length == 0) {
            // No order references, return base response with empty order details
            baseResponse.setOrderDetails(new OrderResponse[0]);
            return baseResponse;
        }

        // Convert string IDs to Long and fetch order previews
        final List<Long> orderIds = Arrays.stream(orderReferences)
                .map(Long::parseLong)
                .toList();

        final List<OrderPreviewProjection> orderPreviews = orderRepository.findOrderPreviewsByIds(orderIds);
        
        // Convert projections to OrderResponse objects
        final OrderResponse[] orderDetails = orderPreviews.stream()
                .map(this::convertProjectionToOrderResponse)
                .toArray(OrderResponse[]::new);

        baseResponse.setOrderDetails(orderDetails);
        return baseResponse;
    }

    private OrderResponse convertProjectionToOrderResponse(final OrderPreviewProjection projection) {
        return OrderResponse.builder()
                .id(projection.getId())
                .orderStatus(projection.getOrderStatus())
                .customer(OrderResponse.Customer.builder()
                        .firstName(projection.getCustomerFirstName())
                        .lastName(projection.getCustomerLastName())
                        .build())
                .assignee(projection.getAssigneeName() != null ? 
                    UserResponse.builder()
                            .name(projection.getAssigneeName())
                            .uuid(projection.getAssigneeUuid())
                            .build() : null)
                .build();
    }
}
