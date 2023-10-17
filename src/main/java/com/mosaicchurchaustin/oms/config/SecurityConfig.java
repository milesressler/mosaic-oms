package com.mosaicchurchaustin.oms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http, final JwtDecoder jwtDecoder) throws Exception {
        http
                .authorizeHttpRequests((registry) -> {
                    registry.requestMatchers("/actuator/**").anonymous();
                    registry.anyRequest().authenticated();
                    //.hasAuthority("SCOPE_read:messages")
                })
                .httpBasic(Customizer.withDefaults())
                .cors(Customizer.withDefaults())
                .oauth2ResourceServer((server) -> server.jwt((jwt) ->
                        jwt
                                .decoder(jwtDecoder)
                ));
        return http.build();
    }
}
