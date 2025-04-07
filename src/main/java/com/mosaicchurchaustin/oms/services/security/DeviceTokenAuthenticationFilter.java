package com.mosaicchurchaustin.oms.services.security;

import com.mosaicchurchaustin.oms.data.constants.MosaicAuthority;
import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import com.mosaicchurchaustin.oms.services.DeviceService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class DeviceTokenAuthenticationFilter extends OncePerRequestFilter {

    private final DeviceService deviceService;

    public DeviceTokenAuthenticationFilter(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @Override
    protected void doFilterInternal(@NotNull HttpServletRequest request,
                                    @NotNull HttpServletResponse response,
                                    @NotNull FilterChain filterChain) throws ServletException, IOException {
        // Only proceed if no authentication is already set
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            final Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("DEVICE_TOKEN".equals(cookie.getName())) {
                        final String deviceToken = cookie.getValue().split(":")[1];
                        // Validate the device token using your service.
                        final Optional<DeviceEntity> deviceOpt = deviceService.validateDeviceToken(deviceToken);
                        if (deviceOpt.isPresent()) {
                            deviceService.updateDeviceAccess(deviceOpt.get().getUuid());
                            // Create an Authentication token with KIOSK authority
                            final List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(MosaicAuthority.KIOSK.getAuthority()));
                            final UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(deviceOpt.get(), null, authorities);
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
