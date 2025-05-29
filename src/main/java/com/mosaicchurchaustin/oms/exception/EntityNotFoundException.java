package com.mosaicchurchaustin.oms.exception;

// 404
public class EntityNotFoundException extends BaseMosaicException {
    public EntityNotFoundException(final String entityName, final String id) {
        super(String.format("%s with id %s not found", entityName, id));
    }
}
