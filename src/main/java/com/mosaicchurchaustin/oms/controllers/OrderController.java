package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.request.CreateOrderRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderRequest;
import com.mosaicchurchaustin.oms.data.response.OrderItemResponse;
import com.mosaicchurchaustin.oms.data.response.OrderDetailResponse;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import com.mosaicchurchaustin.oms.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
        final Page<OrderEntity> orderEntities = orderService.getOrders(pageable, statuses);
        return new PageImpl<>(
                orderEntities.getContent().stream().map(OrderResponse::from).collect(Collectors.toList()),
                pageable,
                orderEntities.getTotalElements()
        );
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

