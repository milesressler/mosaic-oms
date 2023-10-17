package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record UpdateOrderRequest(
        String customerName,
        @Pattern(regexp="(^$|[0-9]{10})", message = "customerPhone should be 10 digits")
        String customerPhone,
        Boolean optInNotifications,
        String specialInstructions,
        List<@NotNull Long> removeItems,
        List<@Valid ItemRequest> setItems,
        List<@Valid ItemRequest> addItems) {
}
