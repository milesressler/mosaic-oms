package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.response.AdminItemResponse;
import com.mosaicchurchaustin.oms.services.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminItemController {

    final ItemService itemService;

//    @ResponseBody
//    @PutMapping(path = "/item/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
//    public AdminItemResponse updateItem(@PathVariable("id") Long id) {
//        itemService.updateItem
//    }

    @ResponseBody
    @GetMapping(path = "/item", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<AdminItemResponse> getAllItems(final Pageable pageable) {
        return itemService.getPagedItems(pageable)
                .map(AdminItemResponse::from);
    }


}
