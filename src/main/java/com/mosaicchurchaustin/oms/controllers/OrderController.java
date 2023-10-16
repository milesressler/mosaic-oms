package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    @ResponseBody
    @GetMapping(path = "/order/{id}", produces = "application/json")
    public OrderResponse submitOrder(@PathVariable("id") final String orderId) {
        return OrderResponse.builder().id("d").build();
    }
}

