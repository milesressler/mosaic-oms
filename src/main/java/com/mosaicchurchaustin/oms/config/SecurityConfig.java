package com.mosaicchurchaustin.oms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Value("${mosaic.oms.frontend.url}")
    private String frontendUrl;


    final CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin(
                frontendUrl
        );
        configuration.setAllowedMethods(Arrays.asList(
                HttpMethod.GET.name(), HttpMethod.POST.name(), HttpMethod.PUT.name()
        ));
        configuration.addAllowedHeader("*");
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

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
                .cors((cors) -> cors.configurationSource(corsConfigurationSource()))
                .oauth2ResourceServer((oauth2) ->  oauth2.jwt(
                        Customizer.withDefaults()))
                ;
        return http.build();
    }


}
