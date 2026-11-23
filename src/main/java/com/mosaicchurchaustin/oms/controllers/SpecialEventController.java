package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.request.CreateSpecialEventOrderRequest;
import com.mosaicchurchaustin.oms.data.response.OrderDetailResponse;
import com.mosaicchurchaustin.oms.data.response.SpecialEventCustomerOrderResponse;
import com.mosaicchurchaustin.oms.data.response.SpecialEventResponse;
import com.mosaicchurchaustin.oms.services.events.SpecialEventService;
import com.mosaicchurchaustin.oms.services.sockets.OrderNotifier;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/special-event")
@RequiredArgsConstructor
public class SpecialEventController {

    final SpecialEventService specialEventService;
    final OrderNotifier orderNotifier;

    /**
     * The running event with live stock, or an empty body when no event is running
     */
    @ResponseBody
    @GetMapping(path = "/active", produces = MediaType.APPLICATION_JSON_VALUE)
    public SpecialEventResponse getActiveEvent() {
        return specialEventService.getActiveEvent().orElse(null);
    }

    @ResponseBody
    @GetMapping(path = "/{uuid}/customer/{customerUuid}/orders", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SpecialEventCustomerOrderResponse> getCustomerOrders(
            @PathVariable("uuid") final String uuid,
            @PathVariable("customerUuid") final String customerUuid) {
        return specialEventService.getCustomerOrders(uuid, customerUuid);
    }

    @ResponseBody
    @PostMapping(path = "/{uuid}/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse createOrder(
            @PathVariable("uuid") final String uuid,
            @Valid @RequestBody final CreateSpecialEventOrderRequest request) {
        final OrderEntity orderEntity = specialEventService.createOrder(uuid, request);
        orderNotifier.notifyOrderCreated(orderEntity);
        return OrderDetailResponse.from(orderEntity);
    }
}
