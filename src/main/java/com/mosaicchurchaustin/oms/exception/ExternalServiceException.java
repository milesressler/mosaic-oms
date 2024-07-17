package com.mosaicchurchaustin.oms.exception;

public class ExternalServiceException extends BaseMosaicException {
    public ExternalServiceException(final String service, final String message, final Exception e) {
        super(String.format("Error accessing service %s: %s", service, message), e);
    }
}
