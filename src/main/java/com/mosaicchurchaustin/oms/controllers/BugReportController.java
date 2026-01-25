package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.BugReportEntity;
import com.mosaicchurchaustin.oms.data.request.CreateBugReportRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateBugReportRequest;
import com.mosaicchurchaustin.oms.data.response.BugReportResponse;
import com.mosaicchurchaustin.oms.services.BugReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bugs")
@RequiredArgsConstructor
public class BugReportController {

    private final BugReportService bugReportService;

    @PostMapping
    public BugReportResponse createBugReport(@RequestBody final CreateBugReportRequest request) {
        return bugReportService.createBugReport(request);
    }

    @GetMapping
    public List<BugReportResponse> getBugReports(
            @RequestParam(required = false) final BugReportEntity.BugReportStatus status) {
        if (status != null) {
            return bugReportService.getBugReportsByStatus(status);
        }
        return bugReportService.getAllBugReports();
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<BugReportResponse> getBugReport(@PathVariable final String uuid) {
        return bugReportService.getBugReportByUuid(uuid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<BugReportResponse> updateBugReport(
            @PathVariable final String uuid,
            @RequestBody final UpdateBugReportRequest request) {
        return bugReportService.updateBugReport(uuid, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}