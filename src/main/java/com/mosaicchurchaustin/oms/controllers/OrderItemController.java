package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderItemRequest;
import com.mosaicchurchaustin.oms.data.response.OrderItemResponse;
import com.mosaicchurchaustin.oms.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderItemController {


    @Autowired
    private OrderService orderService;
    @ResponseBody
    @PutMapping(path = "/orderitem/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderItemResponse updateOrderItem(
            @PathVariable("id") Long orderItemId,
            @Valid @RequestBody UpdateOrderItemRequest request
    ){
        final OrderItemEntity orderItemEntity = orderService.updateOrderItem(orderItemId, request);
        return OrderItemResponse.from(orderItemEntity);
    }
//    @ResponseBody
//    @PutMapping(path = "/orderitem/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
//    public OrderItemResponse updateOrderItem(
//            @PathVariable Long id
//    ) {
//        // TODO
//        return OrderItemResponse.builder().build();
//    }
}
