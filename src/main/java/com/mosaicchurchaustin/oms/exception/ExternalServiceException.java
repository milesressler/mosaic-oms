package com.mosaicchurchaustin.oms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.GATEWAY_TIMEOUT)
public class ExternalServiceException extends BaseMosaicException {
    public ExternalServiceException(final String service, final String message, final Exception e) {
        super(String.format("Error accessing service %s: %s", service, message), e);
    }
}
