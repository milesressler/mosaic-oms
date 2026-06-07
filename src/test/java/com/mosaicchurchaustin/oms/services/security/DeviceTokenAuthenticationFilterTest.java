package com.mosaicchurchaustin.oms.services.security;

import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import com.mosaicchurchaustin.oms.services.DeviceService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceTokenAuthenticationFilterTest {

    @Mock DeviceService deviceService;
    @Mock HttpServletRequest request;
    @Mock HttpServletResponse response;
    @Mock FilterChain filterChain;

    DeviceTokenAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new DeviceTokenAuthenticationFilter(deviceService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private DeviceEntity buildDevice(final boolean autoRenew, final Instant expiration) {
        final DeviceEntity device = new DeviceEntity();
        ReflectionTestUtils.setField(device, "uuid", "device-uuid");
        device.setAutoRenew(autoRenew);
        device.setExpiration(expiration);
        return device;
    }

    @Test
    void doFilterInternal_autoRenewDeviceNearExpiration_refreshesCookie() throws Exception {
        final Cookie cookie = new Cookie("DEVICE_TOKEN", "device-uuid:raw-token");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        final DeviceEntity device = buildDevice(true, Instant.now().plus(15, ChronoUnit.DAYS));
        when(deviceService.validateDeviceToken("raw-token")).thenReturn(Optional.of(device));

        final DeviceEntity refreshed = buildDevice(true, Instant.now().plus(364, ChronoUnit.DAYS));
        when(deviceService.refreshDeviceExpiration(device)).thenReturn(refreshed);

        filter.doFilterInternal(request, response, filterChain);

        verify(deviceService).refreshDeviceExpiration(device);
        verify(response).addCookie(any(Cookie.class));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_autoRenewDeviceNotNearExpiration_doesNotRefreshCookie() throws Exception {
        final Cookie cookie = new Cookie("DEVICE_TOKEN", "device-uuid:raw-token");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        final DeviceEntity device = buildDevice(true, Instant.now().plus(90, ChronoUnit.DAYS));
        when(deviceService.validateDeviceToken("raw-token")).thenReturn(Optional.of(device));

        filter.doFilterInternal(request, response, filterChain);

        verify(deviceService, never()).refreshDeviceExpiration(any());
        verify(response, never()).addCookie(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_fixedExpirationDeviceNearExpiration_doesNotRefreshCookie() throws Exception {
        final Cookie cookie = new Cookie("DEVICE_TOKEN", "device-uuid:raw-token");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        // autoRenew=false, but within 30 days — should not be extended
        final DeviceEntity device = buildDevice(false, Instant.now().plus(15, ChronoUnit.DAYS));
        when(deviceService.validateDeviceToken("raw-token")).thenReturn(Optional.of(device));

        filter.doFilterInternal(request, response, filterChain);

        verify(deviceService, never()).refreshDeviceExpiration(any());
        verify(response, never()).addCookie(any());
        verify(filterChain).doFilter(request, response);
    }
}
