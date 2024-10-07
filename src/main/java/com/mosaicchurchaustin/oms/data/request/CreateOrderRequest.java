package com.mosaicchurchaustin.oms.data.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;


@Valid
public record CreateOrderRequest(
        @NotBlank(message = "First Name cannot be blank") String customerFirstName,
        @NotBlank(message = "Last Name cannot be blank") String customerLastName,
        @Pattern(regexp="(^$|[0-9]{10})", message = "customerPhone should be 10 digits")
        String customerPhone,
        Boolean optInNotifications,
        String specialInstructions,
        @NotEmpty List<@Valid OrderItemRequest> items) {
}
