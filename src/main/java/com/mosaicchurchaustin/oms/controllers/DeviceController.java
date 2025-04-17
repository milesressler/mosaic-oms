package com.mosaicchurchaustin.oms.controllers;


import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import com.mosaicchurchaustin.oms.data.request.DeviceRequest;
import com.mosaicchurchaustin.oms.data.response.DeviceResponse;
import com.mosaicchurchaustin.oms.services.DeviceService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Arrays;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceService deviceService;

    private static final String DEVICE_COOKIE_NAME = "DEVICE_TOKEN";


    @GetMapping("/device")
    public Page<DeviceResponse> getDevices(final Pageable pageable) {
        return deviceService.getDevices(pageable)
                .map(DeviceResponse::from);
    }

    @GetMapping("/device/me")
    public String getMe(final HttpServletRequest request) {
        return Arrays.stream(request.getCookies()).map(Cookie::getName)
                .filter(value -> value.equalsIgnoreCase(DEVICE_COOKIE_NAME))
                .findAny()
                .map(i -> "connected")
                .orElse("disconnected");
    }


    @DeleteMapping("/device/{uuid}")
    public void deleteDevice(@PathVariable(name = "uuid") final String deviceUuid) {
        deviceService.deleteDevice(deviceUuid);
    }

    @PostMapping("/device/logout")
    public ResponseEntity<Void> deviceLogout(final HttpServletResponse response) {
        Cookie cookie = new Cookie(DEVICE_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Clear the cookie immediately
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/device")
    public ResponseEntity<DeviceResponse> createDevice(@Valid @RequestBody DeviceRequest request,
                                                       @RequestHeader("User-Agent") String userAgent,
                                                       HttpServletResponse response) {
        final DeviceEntity device = deviceService.createDevice(request, userAgent);

        // Create a secure cookie with the device UUID
        final Cookie cookie = new Cookie(DEVICE_COOKIE_NAME, String.format("%s:%s", device.getUuid(), device.getRawToken()));
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");

        if (device.getExpiration() != null) {
            // Calculate max age from device expiration
            final long diffInMillis = device.getExpiration().toEpochMilli() - Instant.now().toEpochMilli();
            final int maxAge = (int) (diffInMillis / 1000);  // convert milliseconds to seconds
            cookie.setMaxAge(maxAge);
        }

        response.addCookie(cookie);

        return ResponseEntity.status(HttpStatus.CREATED).body(DeviceResponse.from(device));
    }

}
