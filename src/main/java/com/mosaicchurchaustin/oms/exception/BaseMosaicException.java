package com.mosaicchurchaustin.oms.exception;

public class BaseMosaicException extends RuntimeException {
    public BaseMosaicException(String message) {
        super(message);
    }

    public BaseMosaicException(String message, Throwable cause) {
        super(message, cause);
    }
}
