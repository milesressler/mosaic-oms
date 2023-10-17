package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;


public record CreateOrderRequest(
        @NotBlank(message = "customerName cannot be blank") String customerName,
        @Pattern(regexp="(^$|[0-9]{10})", message = "customerPhone should be 10 digits")
        String customerPhone,
        Boolean optInNotifications,
        String specialInstructions,
        @NotEmpty List<@Valid ItemRequest> items) {
}
