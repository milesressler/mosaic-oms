package com.mosaicchurchaustin.oms.data.sockets;

import com.mosaicchurchaustin.oms.data.response.ChatMessageResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatNotification {
    
    private ChatMessageResponse message;
    private String senderExtId;
    private String senderName;
}