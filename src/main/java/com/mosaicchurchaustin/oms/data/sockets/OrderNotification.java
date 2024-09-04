package com.mosaicchurchaustin.oms.data.sockets;

import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderNotification {

    String userName;
    String userExtId;
    Long orderId;
    String orderUuid;
    OrderStatus orderStatus;
    String assigneeExtId;
    String assigneeName;
    OrderResponse order;
}
