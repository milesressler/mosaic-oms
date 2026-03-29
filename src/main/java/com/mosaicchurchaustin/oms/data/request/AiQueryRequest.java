package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class AiQueryRequest {

    @NotBlank
    @Size(max = 1000)
    String question;

    List<ConversationTurn> history;

    @Data
    public static class ConversationTurn {
        String question;
        String answer;
    }
}
