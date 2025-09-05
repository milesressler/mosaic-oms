package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.chat.ChatMessageEntity;
import com.mosaicchurchaustin.oms.data.request.ChatMessageRequest;
import com.mosaicchurchaustin.oms.data.response.ChatMessageResponse;
import com.mosaicchurchaustin.oms.data.response.UserResponse;
import com.mosaicchurchaustin.oms.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/message")
    public ChatMessageResponse sendMessage(@RequestBody final ChatMessageRequest request) {
        final ChatMessageEntity message = chatService.sendMessage(request);
        return ChatMessageResponse.from(message);
    }

    @GetMapping("/global")
    public Page<ChatMessageResponse> getGlobalMessages(
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "20") final int size) {
        
        final Pageable pageable = PageRequest.of(page, size);
        return chatService.getGlobalMessages(pageable);
    }

    @GetMapping("/direct/{userId}")
    public Page<ChatMessageResponse> getDirectMessages(
            @PathVariable final UUID userId,
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "20") final int size) {
        
        final Pageable pageable = PageRequest.of(page, size);
        return chatService.getDirectMessages(userId, pageable);
    }

    @GetMapping("/participants")
    public List<UserResponse> getDirectMessageParticipants() {
        return chatService.getDirectMessageParticipants();
    }

    @GetMapping("/search")
    public Page<ChatMessageResponse> searchMessages(
            @RequestParam final String q,
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "20") final int size) {
        
        final Pageable pageable = PageRequest.of(page, size);
        final Page<ChatMessageEntity> messages = chatService.searchMessages(q, pageable);
        return messages.map(ChatMessageResponse::from);
    }

}