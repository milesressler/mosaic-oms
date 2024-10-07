package com.mosaicchurchaustin.oms.data.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;


@Valid
public record UpdateOrderRequest(
        String customerFirstName,
        String customerLastName,
        @Pattern(regexp="(^$|[0-9]{10})", message = "customerPhone should be 10 digits")
        String customerPhone,
        Boolean optInNotifications,
        String specialInstructions,
        List<@NotNull Long> removeItems,
        List<@Valid OrderItemRequest> setItems,
        List<@Valid OrderItemRequest> addItems) {
}
