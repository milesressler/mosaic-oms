package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.request.CreateItemRequest;
import com.mosaicchurchaustin.oms.data.response.SuggestedItemResponse;
import com.mosaicchurchaustin.oms.services.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ItemController {

    final ItemService itemService;

    @ResponseBody
    @GetMapping(path = "/item", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<ItemCategory, List<SuggestedItemResponse>> getAllItems() {
        return itemService.getSuggestedItems().entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey, // Keep the same ItemCategory key
                        entry -> entry.getValue().stream()
                                .map(SuggestedItemResponse::from) // Convert Items to SuggestedItemResponse
                                .toList()
                ));
    }

    @ResponseBody
    @PostMapping(path = "/item", produces = MediaType.APPLICATION_JSON_VALUE)
    public SuggestedItemResponse createItem(@Valid @RequestBody final CreateItemRequest request) {
        return SuggestedItemResponse.from(itemService.createItem(request));
    }
}
