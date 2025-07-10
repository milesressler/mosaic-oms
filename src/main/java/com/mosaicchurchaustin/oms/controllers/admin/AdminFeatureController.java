package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.request.AdminUpdateFeatureConfigRequest;
import com.mosaicchurchaustin.oms.data.response.FeatureConfigResponse;
import com.mosaicchurchaustin.oms.services.FeaturesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminFeatureController {

    final FeaturesService featuresService;

    @ResponseBody
    @PutMapping(path = "/feature", produces = MediaType.APPLICATION_JSON_VALUE)
    public FeatureConfigResponse updateItem(
            @RequestBody final AdminUpdateFeatureConfigRequest request) {
        return featuresService.updateFeaturesConfig(request);
    }
}
