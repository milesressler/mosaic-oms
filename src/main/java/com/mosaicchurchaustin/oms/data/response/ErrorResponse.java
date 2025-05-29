package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.domain.ErrorCode;
import lombok.Data;

@Data
public class ErrorResponse {
    private String message;
    private ErrorCode errorCode;

    public ErrorResponse(final ErrorCode errorCode, final String message) {
        this.errorCode = errorCode;
        this.message = message;
    }

    // Getters and setters
}
