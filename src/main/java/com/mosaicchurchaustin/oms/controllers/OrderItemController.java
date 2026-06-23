package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemSubstitutionEntity;
import com.mosaicchurchaustin.oms.data.request.CreateSubstitutionRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateOrderItemsFilledRequest;
import com.mosaicchurchaustin.oms.data.response.OrderDetailResponse;
import com.mosaicchurchaustin.oms.data.response.OrderItemResponse;
import com.mosaicchurchaustin.oms.data.response.OrderItemSubstitutionResponse;
import com.mosaicchurchaustin.oms.services.OrderService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderItemController {

    @Autowired
    private OrderService orderService;

    @ResponseBody
    @PutMapping(path = "/orderitem/quantity/bulk", produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public OrderDetailResponse updateOrderItemQuantityFilledBulk(
             @RequestBody @Valid UpdateOrderItemsFilledRequest request
    ){
        return OrderDetailResponse.from(
                orderService.updateOrderItemQuantities(request.orderUuid(), request.quantities()));
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

    @ResponseBody
    @PostMapping(path = "/orderitem/{id}/substitution", produces = MediaType.APPLICATION_JSON_VALUE)
    public OrderItemSubstitutionResponse addSubstitution(
            @PathVariable("id") Long orderItemId,
            @Valid @RequestBody CreateSubstitutionRequest request
    ) {
        final OrderItemSubstitutionEntity substitution = orderService.addSubstitution(orderItemId, request);
        return OrderItemSubstitutionResponse.from(substitution);
    }

    @DeleteMapping(path = "/orderitem/{id}/substitution/{substitutionUuid}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeSubstitution(
            @PathVariable("id") Long orderItemId,
            @PathVariable("substitutionUuid") String substitutionUuid
    ) {
        orderService.removeSubstitution(orderItemId, substitutionUuid);
    }
}
