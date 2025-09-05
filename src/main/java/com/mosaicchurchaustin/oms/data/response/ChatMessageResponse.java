package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageEntity;
import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageResponse {
    
    private Long id;
    private String uuid;
    private UserResponse sender;
    private UserResponse recipient;
    private String content;
    private ChatMessageType messageType;
    private Instant createdAt;
    private Boolean isEdited;
    private Instant editedAt;
    private Boolean isDirectMessage;
    private String[] orderReferences;
    private OrderResponse[] orderDetails;

    public static ChatMessageResponse from(ChatMessageEntity entity) {
        return ChatMessageResponse.builder()
                .id(entity.getId())
                .uuid(entity.getUuid())
                .sender(UserResponse.from(entity.getSender()))
                .recipient(entity.getRecipient() != null ? UserResponse.from(entity.getRecipient()) : null)
                .content(entity.getContent())
                .messageType(entity.getMessageType())
                .createdAt(entity.getCreatedAt())
                .isEdited(entity.getIsEdited())
                .editedAt(entity.getEditedAt())
                .isDirectMessage(entity.isDirectMessage())
                .orderReferences(extractOrderReferences(entity.getContent()))
                .build();
    }

    private static final Pattern ORDER_PATTERN = Pattern.compile("(?i)#(\\d+)");
    
    private static String[] extractOrderReferences(final String content) {
        if (content == null) return new String[0];
        
        final Matcher matcher = ORDER_PATTERN.matcher(content);
        
        return matcher.results()
                .map(result -> result.group(1))
                .distinct()
                .toArray(String[]::new);
    }
}
