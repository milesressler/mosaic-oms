package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.request.CreateOrderRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderStatusBulkRequest;
import com.mosaicchurchaustin.oms.data.response.OrderDetailResponse;
import com.mosaicchurchaustin.oms.data.response.OrderFeedResponse;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import com.mosaicchurchaustin.oms.services.OrderService;
import com.mosaicchurchaustin.oms.services.sockets.OrderNotifier;
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
    final OrderNotifier orderNotifier;

    @ResponseBody
    @PostMapping(path = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse submitOrder(@Valid @RequestBody CreateOrderRequest createOrderRequest) {
        // Better validation/error handler
        final OrderEntity orderEntity = orderService.createOrder(createOrderRequest);
        orderNotifier.notifyOrderCreated(orderEntity);
        return OrderDetailResponse.from(orderEntity);
    }


    @ResponseBody
    @GetMapping(path = "/order/view/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<OrderResponse> getDashboardOrders(final Pageable pageable) {
        return orderService.getDashboardOrders(pageable).stream().map(OrderResponse::from).toList();
    }
    @ResponseBody
    @GetMapping(path = "/order", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<OrderResponse> getOrders(final Pageable pageable,
                                         @RequestParam(value = "status", required = false)
                                         final List<String> statuses,
                                         @RequestParam(value = "detailed", required = false)
                                         final boolean detailed) {
        final Page<OrderEntity> results = orderService.getOrders(pageable, statuses);
        if (detailed) {
            return results.map(OrderDetailResponse::from);
        } else {
            return results.map(OrderResponse::from);
        }
    }

    @ResponseBody
    @GetMapping(path = "/order/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse getOrderDetail(
            @PathVariable("id") String orderId
    ) {
        final OrderEntity orderEntity = StringUtils.isNumeric(orderId) ?
                orderService.getOrder(Long.valueOf(orderId)) :
                orderService.getOrder(orderId);

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
    @PutMapping(path = "/order/bulk/state/{state}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<OrderDetailResponse> updateOrderStateBulk(
            @PathVariable("state") String orderState,
            @RequestBody UpdateOrderStatusBulkRequest request
            ){
        final List<OrderEntity> updatedOrders = orderService.updateOrderStatusBulk(request.orderUuids(), orderState);
        updatedOrders.forEach(order ->
                orderNotifier.notifyOrderStatusChanged(order, order.getLastStatusChange().getUserEntity()));

        return updatedOrders.stream().map(OrderDetailResponse::from).toList();
    }

    @ResponseBody
    @PutMapping(path = "/order/{uuid}/state/{state}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse updateOrderState(
            @PathVariable("uuid") String orderUuid,
            @PathVariable("state") String orderState
    ){
        final OrderEntity orderEntity = orderService.updateOrderStatus(orderUuid, orderState);
        orderNotifier.notifyOrderStatusChanged(orderEntity, orderEntity.getLastStatusChange().getUserEntity());
        return OrderDetailResponse.from(orderEntity);
    }

    @ResponseBody
    @PutMapping(path = "/order/{uuid}/assign", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderDetailResponse assignToMe(
            @RequestParam(value = "unassign", required = false, defaultValue = "false") Boolean unassign,
            @PathVariable("uuid") String orderUuid
    ){
        final OrderEntity orderEntity = unassign
                ? orderService.unassignOrder(orderUuid)
                : orderService.assignOrder(orderUuid);
        orderNotifier.notifyOrderAssigneeChanged(orderEntity);
        return OrderDetailResponse.from(orderEntity);
    }


    @ResponseBody
    @GetMapping(path ="/order/history", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<OrderFeedResponse> getOrderHistory(
            @RequestParam(required = false) final Long orderId
    ) {
        final List<OrderHistoryEntity> results;
        if (orderId != null) {
            results = orderService.getOrderHistory(orderId);
        } else {
            results = orderService.getOrderHistory();
        }
        return results.stream().map(OrderFeedResponse::from).toList();
    }


}

