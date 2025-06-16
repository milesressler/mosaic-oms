package com.mosaicchurchaustin.oms.controllers;


import com.mosaicchurchaustin.oms.data.entity.shower.ShowerReservationEntity;
import com.mosaicchurchaustin.oms.data.request.shower.ShowerReservationRequest;
import com.mosaicchurchaustin.oms.data.request.shower.StartShowerRequest;
import com.mosaicchurchaustin.oms.data.request.shower.UpdatePositionRequest;
import com.mosaicchurchaustin.oms.data.response.ShowerReservationGroupedResponse;
import com.mosaicchurchaustin.oms.data.response.ShowerReservationResponse;
import com.mosaicchurchaustin.oms.services.showers.ShowersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ShowerController {
    private final ShowersService showerService;

    @GetMapping("/reservations/shower/queue")
    public ShowerReservationGroupedResponse getQueue(
            Pageable pageable
    ) {
        return showerService.getGroupedQueue(pageable);
    }

    @GetMapping("/reservations/shower")
    public Page<ShowerReservationResponse> getShowerReservations(
            Pageable pageable
    ) {
        return showerService.getAll(pageable).map(ShowerReservationResponse::from);
    }

    @PostMapping("/reservations/shower")
    public ShowerReservationResponse createReservation(
            @RequestBody @Valid ShowerReservationRequest request
    ) {
        final ShowerReservationEntity entity = showerService.createReservation(request);
        return ShowerReservationResponse.from(entity);
    }

    @PutMapping("/reservations/{id}/position")
    public ShowerReservationResponse updatePosition(
            @PathVariable UUID id,
            @RequestBody @Valid UpdatePositionRequest request) {
        final ShowerReservationEntity entity = showerService.updateQueuePosition(id, request.newPosition());
        return ShowerReservationResponse.from(entity);
    }

    @PutMapping("/reservations/{id}/start")
    public ShowerReservationResponse startShower(
            @PathVariable UUID id,
            @RequestBody StartShowerRequest request) {
        final ShowerReservationEntity entity = showerService.startShower(id, request.showerNumber());
        return ShowerReservationResponse.from(entity);
    }

    @PutMapping("/reservations/{id}/end")
    public ShowerReservationResponse endShower(
            @PathVariable UUID id) {
        final ShowerReservationEntity entity = showerService.endShower(id);
        return ShowerReservationResponse.from(entity);
    }

    @DeleteMapping("/reservations/{id}")
    public ShowerReservationResponse cancelReservation(@PathVariable UUID id) {
        final ShowerReservationEntity entity = showerService.cancelReservation(id);
        return ShowerReservationResponse.from(entity);
    }
}
