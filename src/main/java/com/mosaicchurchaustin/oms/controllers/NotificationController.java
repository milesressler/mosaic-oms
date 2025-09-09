package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.response.NotificationSummaryResponse;
import com.mosaicchurchaustin.oms.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {

    final NotificationService notificationService;

    @ResponseBody
    @GetMapping(path = "/notifications", produces = MediaType.APPLICATION_JSON_VALUE)
    public NotificationSummaryResponse getNotifications(
            @RequestParam(required = false) Long cursor,
            @RequestParam(required = false) Integer pageSize
    ) {
        return notificationService.getNotificationSummaryForCurrentUser(cursor, pageSize);
    }

    @ResponseBody
    @PutMapping(path = "/notifications/mark-seen", produces = MediaType.APPLICATION_JSON_VALUE)
    public void markNotificationsAsSeen() {
        notificationService.markAllNotificationsAsSeenForCurrentUser();
    }
}