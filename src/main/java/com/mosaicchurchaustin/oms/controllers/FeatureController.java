package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.request.OrdersUpdateFeatureConfigRequest;
import com.mosaicchurchaustin.oms.data.response.FeatureConfigResponse;
import com.mosaicchurchaustin.oms.services.FeaturesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeatureController {

    final FeaturesService featuresService;

    @ResponseBody
    @PutMapping(path = "/feature/orders", produces = MediaType.APPLICATION_JSON_VALUE)
    public FeatureConfigResponse updateItem(
            @RequestBody final OrdersUpdateFeatureConfigRequest request) {
        return featuresService.updateFeaturesConfig(request);
    }

    @ResponseBody
    @GetMapping(path = "/feature", produces = MediaType.APPLICATION_JSON_VALUE)
    public FeatureConfigResponse getFeatureConfig() {
        return featuresService.getFeaturesConfig();
    }
}
