package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.client.GroupMeBotClient;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class GroupMeService {

    @Autowired
    GroupMeBotClient groupMeBotClient;


    public void handleOrderCreated(final OrderEntity orderEntity) {
        try {
            final String message = tryGetSerializedOrder(orderEntity);
            groupMeBotClient.postMessage(message);
        } catch (Exception e) {
            log.error("Error posting message to GroupMe: {}", e.getMessage());
        }
    }


    public String tryGetSerializedOrder(OrderEntity order) {
        try {
            return getSerializedOrder(order);
        } catch (Exception e) {
            return "";
        }
    }

    private String getSerializedOrder(OrderEntity order) {

        final String topLevelContent = String.format("""
                Friend: %s
                Order Taker: %s
                
                Order Items:
                """, 
                order.getCustomerFullName(),
                order.getLastStatusChange().getUserEntity().getName());

        final StringBuilder sb = new StringBuilder(topLevelContent);

        order.getOrderItemList()
            .forEach(orderItem -> {
                sb.append(String.format("- %s",
                        orderItem.getItemEntity().getDescription()));

                Optional.ofNullable(StringUtils.defaultIfBlank(orderItem.getNotes(), null))
                        .map(itemNote -> String.format(" [%s]", itemNote))
                        .ifPresent(sb::append);

                sb.append(StringUtils.LF);
            });


        // Add special instructions for the order if any
        if (order.getSpecialInstructions() != null && !order.getSpecialInstructions().isEmpty()) {
            sb.append(String.format("""
                    
                    Special Instructions: %s
                    """, order.getSpecialInstructions()));
        }

        return sb.toString();
    }
}
