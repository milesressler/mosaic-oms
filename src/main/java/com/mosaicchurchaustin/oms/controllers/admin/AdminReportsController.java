package com.mosaicchurchaustin.oms.controllers.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminReportsController {

//
//    @ResponseBody
//    @GetMapping(path = "/r", produces = MediaType.APPLICATION_JSON_VALUE)
//    public List<SuggestedItemResponse> getAllItems() {
//        return itemService.getSuggestedItems().stream()
//                .map(SuggestedItemResponse::from)
//                .toList();
//    }

}
