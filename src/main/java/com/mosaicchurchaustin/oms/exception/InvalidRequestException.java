package com.mosaicchurchaustin.oms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)  // 400
public class InvalidRequestException extends BaseMosaicException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
