package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.services.announcements.ChangelogParser;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Setter
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementsController {

    @Autowired
    private List<ChangelogParser.ChangelogEntry> structuredChangelog;

    @GetMapping(value = "/changelog", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ChangelogParser.ChangelogEntry> getStructuredChangelog() {
       return structuredChangelog;
    }

    @GetMapping(value = "/ack", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<?,?> acknowledgeAnnouncements() {

        // todo persist
       return Map.of("success", true);
    }
}
