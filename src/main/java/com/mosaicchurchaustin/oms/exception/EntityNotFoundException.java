package com.mosaicchurchaustin.oms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)  // 404
public class EntityNotFoundException extends BaseMosaicException {
    public EntityNotFoundException(final String entityName, final String id) {
        super(String.format("%s with id %s not found", entityName, id));
    }
}
