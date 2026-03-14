package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiQueryRequest {

    @NotBlank
    @Size(max = 1000)
    String question;
}
