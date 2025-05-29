package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.domain.ErrorCode;
import com.mosaicchurchaustin.oms.data.response.ErrorResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {


    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    @ExceptionHandler(EntityNotFoundException.class)
    public ErrorResponse handleNotFound(EntityNotFoundException ex) {
        return new ErrorResponse(ErrorCode.NOT_FOUND, ex.getMessage());
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(InvalidRequestException.class)
    public ErrorResponse handleInvalidRequest(InvalidRequestException ex) {
        return new ErrorResponse(ErrorCode.UNKNOWN_ERROR, ex.getMessage());
    }


    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ErrorResponse handleGeneric(Exception ex) {
        return new ErrorResponse(ErrorCode.UNKNOWN_ERROR,
                "Internal service error");
    }

}
