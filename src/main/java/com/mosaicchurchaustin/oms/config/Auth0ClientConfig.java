package com.mosaicchurchaustin.oms.config;

import com.auth0.client.mgmt.ManagementAPI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class Auth0ClientConfig {

    @Value("${auth0.domain}")
    String domain;

    @Value("${auth0.clientId}")
    String clientId;

    @Value("${auth0.clientSecret}")
    String clientSecret;

    @Value("${auth0.managementAudience}")
    String managementAudience;


    private RestTemplate restTemplate = new RestTemplate();

    private String getManagementApiToken() {
        String tokenUrl = "https://" + domain + "/oauth/token";

        final HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = new HashMap<>();
        body.put("client_id", clientId);
        body.put("client_secret", clientSecret);
        body.put("audience", managementAudience);
        body.put("grant_type", "client_credentials");

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, entity, Map.class);

        return (String) response.getBody().get("access_token");
    }
    @Bean
    ManagementAPI managementAPI() {
        return ManagementAPI.newBuilder(
                domain,
                getManagementApiToken())
                .build();
    }


}
