package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.request.CreateOrderRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderRequest;
import com.mosaicchurchaustin.oms.data.response.OrderDetailResponse;
import com.mosaicchurchaustin.oms.data.response.OrderItemResponse;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import com.mosaicchurchaustin.oms.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    final OrderService orderService;

    @ResponseBody
    @PostMapping(path = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse submitOrder(@Valid @RequestBody CreateOrderRequest createOrderRequest) {
        // Better validation/error handler
        final OrderEntity orderEntity = orderService.createOrder(createOrderRequest);
        return OrderDetailResponse.from(orderEntity);
    }

    @ResponseBody
    @GetMapping(path = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<OrderResponse> getOrders(final Pageable pageable,
                                         @RequestParam(value = "status", required = false)
                                             final List<String> statuses) {
        return  orderService.getOrders(pageable, statuses)
                .map(OrderResponse::from);

    }

    @ResponseBody
    @GetMapping(path = "/order/{uuid}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse getOrderDetail(
            @PathVariable("uuid") String orderUuid
    ) {
        final OrderEntity orderEntity = StringUtils.isNumeric(orderUuid) ?
                orderService.getOrder(Long.valueOf(orderUuid)) :
                orderService.getOrder(orderUuid);

        return OrderDetailResponse.from(orderEntity);
    }

    @ResponseBody
    @PutMapping(path = "/order/{uuid}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse updateOrderDetails(
            @PathVariable("uuid") String orderUuid,
            @Valid @RequestBody UpdateOrderRequest updateOrderRequest
    ) {
        final OrderEntity orderEntity = orderService.updateOrder(orderUuid, updateOrderRequest);
        return OrderDetailResponse.from(orderEntity);
    }

    @ResponseBody
    @PutMapping(path = "/order/{uuid}/state/{state}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse updateOrderState(
            @PathVariable("uuid") String orderUuid,
            @PathVariable("state") String orderState
    ){
        final OrderEntity orderEntity = orderService.updateOrderStatus(orderUuid, orderState);
        return OrderDetailResponse.from(orderEntity);
    }

    @ResponseBody
    @PutMapping(path = "/orderitem/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderItemResponse updateOrderItem(
            @PathVariable("id") Long orderItemId,
            @Valid @RequestBody UpdateOrderItemRequest request
            ){
        final OrderItemEntity orderItemEntity = orderService.updateOrderItem(orderItemId, request);
        return OrderItemResponse.from(orderItemEntity);
    }


}

