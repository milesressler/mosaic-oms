package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.request.CreateItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateItemRequest;
import com.mosaicchurchaustin.oms.data.response.AdminItemResponse;
import com.mosaicchurchaustin.oms.services.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminItemController {

    final ItemService itemService;

    @ResponseBody
    @PutMapping(path = "/item/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public AdminItemResponse updateItem(@PathVariable("id") final Long id,
                                        @Valid @RequestBody final UpdateItemRequest request) {
        return AdminItemResponse.from(itemService.updateItem(id, request));
    }

    @ResponseBody
    @GetMapping(path = "/item/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public AdminItemResponse fetchItem(@PathVariable("id") final Long id) {
        return AdminItemResponse.from(itemService.getItem(id));
    }

    @ResponseBody
    @PostMapping(path = "/item", produces = MediaType.APPLICATION_JSON_VALUE)
    public AdminItemResponse createItem(@Valid @RequestBody final CreateItemRequest request) {
        return AdminItemResponse.from(itemService.createItem(request));
    }

    @ResponseBody
    @GetMapping(path = "/item", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<AdminItemResponse> getAllItems(@PageableDefault(size = 25, sort = "description", direction = Sort.Direction.ASC)final Pageable pageable,
                                               @RequestParam(required = false, name = "categories") final List<ItemCategory> categoriesFilters,
                                               @RequestParam(required = false, defaultValue = "true") final Boolean managedItemsOnly) {
        return itemService.getPagedItems(pageable, managedItemsOnly, categoriesFilters)
                .map(AdminItemResponse::from);
    }

    @ResponseBody
    @DeleteMapping(path = "/item/{id}")
    public void removeItem(@PathVariable("id") final Long id) {
        itemService.removeItem(id);
    }


}
