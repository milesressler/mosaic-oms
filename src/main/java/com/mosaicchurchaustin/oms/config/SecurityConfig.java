package com.mosaicchurchaustin.oms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
public class SecurityConfig {



    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((registry) -> {
                    registry.requestMatchers("/actuator/**").anonymous();
                    registry.requestMatchers(HttpMethod.GET, "/item").anonymous();
                    registry.anyRequest().authenticated();
                    //.hasAuthority("SCOPE_read:messages")
                })
                .httpBasic(Customizer.withDefaults())
                .cors(Customizer.withDefaults())
                .oauth2ResourceServer((oauth2) ->  oauth2.jwt(
                        Customizer.withDefaults()))
                ;
        return http.build();
    }


}
