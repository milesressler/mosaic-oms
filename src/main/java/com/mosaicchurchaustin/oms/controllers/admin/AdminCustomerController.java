package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.services.limits.ItemLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCustomerController {

    final ItemLimitService itemLimitService;

    /**
     * Reverses a fill on a completed order line (e.g. the customer gave the item back). Admin only.
     */
    @PostMapping(path = "/customer/{id}/item-history/order-items/{orderItemId}/unfill")
    public void unfillOrderItem(@PathVariable("id") final UUID id, @PathVariable("orderItemId") final Long orderItemId) {
        itemLimitService.unfillOrderItem(id.toString(), orderItemId);
    }
}
