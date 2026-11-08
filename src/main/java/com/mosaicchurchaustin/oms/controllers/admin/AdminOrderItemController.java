package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.services.limits.ItemLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminOrderItemController {

    final ItemLimitService itemLimitService;

    /**
     * Reverses a fill on a completed order line (e.g. the customer gave the item back).
     */
    @PostMapping(path = "/orderitem/{orderItemId}/unfill")
    public void unfillOrderItem(@PathVariable("orderItemId") final Long orderItemId) {
        itemLimitService.unfillOrderItem(orderItemId);
    }
}
