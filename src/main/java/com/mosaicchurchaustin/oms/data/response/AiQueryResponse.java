package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiQueryResponse {
    List<String> columns;
    List<List<Object>> rows;
    int rowCount;
}
