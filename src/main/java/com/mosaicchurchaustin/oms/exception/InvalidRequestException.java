package com.mosaicchurchaustin.oms.exception;

// 400
public class InvalidRequestException extends BaseMosaicException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
