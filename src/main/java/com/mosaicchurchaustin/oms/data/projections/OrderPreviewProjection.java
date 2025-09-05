package com.mosaicchurchaustin.oms.data.projections;

import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;

public interface OrderPreviewProjection {
    Long getId();
    OrderStatus getOrderStatus();
    
    // Customer info for display
    String getCustomerFirstName();
    String getCustomerLastName();
    
    // Assignee info (optional)
    String getAssigneeName();
    String getAssigneeUuid();
}