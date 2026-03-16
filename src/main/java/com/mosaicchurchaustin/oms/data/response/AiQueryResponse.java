package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiQueryResponse {
    String answer;
}
