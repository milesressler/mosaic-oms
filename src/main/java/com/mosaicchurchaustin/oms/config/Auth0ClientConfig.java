package com.mosaicchurchaustin.oms.config;

import com.auth0.client.mgmt.ManagementAPI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Auth0ClientConfig {

    @Value("${auth0.domain}")
    String domain;

    @Value("${auth0.apitoken}")
    String apiToken;

    @Bean
    ManagementAPI managementAPI() {
        return ManagementAPI.newBuilder(
                domain,
                apiToken)
                .build();
    }
}
