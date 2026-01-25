package com.mosaicchurchaustin.oms.data.request;

import com.mosaicchurchaustin.oms.data.entity.BugReportEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateBugReportRequest {
    
    private BugReportEntity.BugReportStatus status;
}