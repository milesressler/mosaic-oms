package com.mosaicchurchaustin.oms.data.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record ShowerReservationGroupedResponse (
        List<ShowerReservationResponse> active,
        Page<ShowerReservationResponse> queued
) {}

