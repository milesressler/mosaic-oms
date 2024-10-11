package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.client.GroupMeClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class GroupMeService {

    @Autowired
    GroupMeClient groupMeClient;

    public void postMessage(String message) {
        try {
            groupMeClient.postMessage(message);
        } catch (Exception e) {
            log.error("Error posting message to GroupMe: {}", e.getMessage());
        }
    }
}
