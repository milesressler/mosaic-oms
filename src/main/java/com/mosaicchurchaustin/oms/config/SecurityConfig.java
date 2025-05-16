package com.mosaicchurchaustin.oms.config;

import com.mosaicchurchaustin.oms.data.constants.MosaicAuthority;
import com.mosaicchurchaustin.oms.data.constants.MosaicRole;
import com.mosaicchurchaustin.oms.services.DeviceService;
import com.mosaicchurchaustin.oms.services.security.CustomJwtGrantedAuthoritiesConverter;
import com.mosaicchurchaustin.oms.services.security.DeviceTokenAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Value("${mosaic.oms.frontend.url}")
    private String frontendUrl;

    @Autowired
    DeviceService deviceService;

    @Autowired
    @Bean
    public AuthenticationManager authenticationManager(
            final AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    final CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl, frontendUrl + "/"));
        configuration.setAllowedMethods(Arrays.asList(
                HttpMethod.GET.name(), HttpMethod.POST.name(), HttpMethod.PUT.name(), HttpMethod.DELETE.name()
        ));
        configuration.setAllowCredentials(true);
        configuration.addAllowedHeader("*");
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http, final JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
        final CsrfTokenRequestAttributeHandler csrfTokenRequestAttributeHandler = new CsrfTokenRequestAttributeHandler();
        final String mosaicRoles = Arrays.stream(MosaicRole.values())
                .map(MosaicRole::name)
                .map(String::toUpperCase)
                .collect(Collectors.joining("','", "'", "'"));

        final var KIOSK_OR_ANY_AUTHORITY = new WebExpressionAuthorizationManager(
                "hasAnyRole(" + mosaicRoles + ") or hasAuthority('" + MosaicAuthority.KIOSK.getAuthority() + "')"
        );

        csrfTokenRequestAttributeHandler.setCsrfRequestAttributeName(null);
        http
                .csrf(csrf ->
                        {
                            csrf
                                    // ignore our stomp endpoints since they are protected using Stomp headers
                                    .ignoringRequestMatchers("/api/ws");
                            csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
                            csrf.csrfTokenRequestHandler(csrfTokenRequestAttributeHandler);
                        }

                )
                .headers(headers -> headers
                        // allow same origin to frame our site to support iframe SockJS
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin
                        )
                )
                .authorizeHttpRequests((registry) -> {
                    registry.requestMatchers("/api/admin/**")
                            .hasAuthority(MosaicAuthority.ADMIN.getAuthority());
                    registry.requestMatchers(HttpMethod.GET, "/api/actuator/**")
                            .permitAll();
                    registry.requestMatchers(HttpMethod.GET, "/api/announcements/**")
                            .permitAll();

                    registry.requestMatchers(HttpMethod.GET, "/api/order/public/dashboard")
                            .access(KIOSK_OR_ANY_AUTHORITY);

                    registry.requestMatchers(HttpMethod.GET, "/api/transit/bus/arrivals")
                            .access(KIOSK_OR_ANY_AUTHORITY);

                    registry.requestMatchers(HttpMethod.GET, "/api/device/me")
                            .access(KIOSK_OR_ANY_AUTHORITY);

                    registry.requestMatchers(HttpMethod.GET, "/api/device/logout")
                            .permitAll();
                    registry.requestMatchers("/api/ws")
                            .permitAll();
                    registry.requestMatchers("/api/**")
                            .hasAnyRole(Arrays.stream(MosaicRole.values())
                                    .map(MosaicRole::name)
                                    .map(String::toUpperCase)
                                    .toArray(String[]::new));
                    registry.anyRequest().permitAll();
                })
                .httpBasic(AbstractHttpConfigurer::disable)
                .cors((cors) -> cors.configurationSource(corsConfigurationSource()))
                .oauth2ResourceServer((oauth2) -> oauth2.jwt(
                        jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                ))
                .addFilterBefore(new DeviceTokenAuthenticationFilter(deviceService), BearerTokenAuthenticationFilter.class);
        ;
        return http.build();
    }

    private Converter<Jwt, Collection<GrantedAuthority>> jwtGrantedAuthoritiesConverter() {
        return new CustomJwtGrantedAuthoritiesConverter();
    }


    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        final JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter());
        return jwtAuthenticationConverter;
    }


}

