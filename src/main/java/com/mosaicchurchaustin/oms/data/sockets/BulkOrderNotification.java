package com.mosaicchurchaustin.oms.data.sockets;

import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BulkOrderNotification {

    String userName;
    String userExtId;
    List<OrderResponse> orders;

}
