package com.mosaicchurchaustin.oms.config;

import com.auth0.client.mgmt.ManagementAPI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@EnableScheduling
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

        Map<String, String> request = new HashMap<>();
        request.put("client_id", clientId);
        request.put("client_secret", clientSecret);
        request.put("audience", managementAudience);
        request.put("grant_type", "client_credentials");

        final HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

        final ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, entity, Map.class);
        final Map<String, Object> body = response.getBody();
        return (String) body.get("access_token");
    }
    @Bean
    ManagementAPI managementAPI() {
        return ManagementAPI.newBuilder(
                domain,
                "fake"
//                getManagementApiToken()
                )
                .build();
    }

    @Configuration
    class TokenProvider {

        @Autowired
        ManagementAPI managementAPI;

        // Expires in 86400 seconds
        @Scheduled(fixedRate = 20, timeUnit = TimeUnit.HOURS)
        void updateToken() {
            managementAPI.setApiToken(getManagementApiToken());
        }

    }

}
