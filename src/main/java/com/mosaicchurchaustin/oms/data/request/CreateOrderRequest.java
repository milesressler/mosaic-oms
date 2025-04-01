package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.UUID;


@Valid
public record CreateOrderRequest(
        String customerFirstName,
        String customerLastName,
        UUID customerUuid,
        @Pattern(regexp="(^$|[0-9]{10})", message = "customerPhone should be 10 digits")
        String customerPhone,
        Boolean optInNotifications,
        String specialInstructions,
        @NotEmpty List<@Valid OrderItemRequest> items) {
}
