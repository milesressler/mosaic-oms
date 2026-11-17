package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.request.CreateCustomerRequest;
import com.mosaicchurchaustin.oms.data.request.CreateItemLimitEntryRequest;
import com.mosaicchurchaustin.oms.data.request.MergeCustomerRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateCustomerRequest;
import com.mosaicchurchaustin.oms.data.response.CreateItemLimitEntryResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerItemHistoryResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerItemLimitResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerSearchResponse;
import com.mosaicchurchaustin.oms.data.response.MergeCustomerResponse;
import com.mosaicchurchaustin.oms.services.CustomerItemHistoryService;
import com.mosaicchurchaustin.oms.services.CustomerService;
import com.mosaicchurchaustin.oms.services.limits.ItemLimitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CustomerController {

    final CustomerService customerService;
    final ItemLimitService itemLimitService;
    final CustomerItemHistoryService customerItemHistoryService;

    @ResponseBody
    @GetMapping(path = "/customer/find", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<CustomerSearchResponse> searchCustomers(
            @RequestParam(value = "q") String query) {
        return customerService.searchCustomers(query)
                .stream()
                .map(CustomerSearchResponse::from)
                .toList();
    }

    @ResponseBody
    @GetMapping(path = "/customer/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CustomerResponse getCustomerByUuid(@PathVariable("id") final UUID id) {
        return CustomerResponse.from(customerService.getCustomer(id.toString()));
    }

    @ResponseBody
    @GetMapping(path = "/customer/{id}/item-limits", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<CustomerItemLimitResponse> getCustomerItemLimits(@PathVariable("id") final UUID id) {
        return itemLimitService.getCustomerItemLimits(id.toString());
    }

    @ResponseBody
    @GetMapping(path = "/customer/{id}/item-history", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<CustomerItemHistoryResponse> getCustomerItemHistory(
            @PathVariable("id") final UUID id,
            @PageableDefault(size = 25) final Pageable pageable,
            @RequestParam(value = "limitedOnly", defaultValue = "false") final boolean limitedOnly,
            @RequestParam(value = "fill", defaultValue = "ALL") final CustomerItemHistoryService.FillFilter fill,
            @RequestParam(value = "category", required = false) final ItemCategory category,
            @RequestParam(value = "q", required = false) final String query,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate to
    ) {
        return customerItemHistoryService.getHistory(
                id.toString(),
                new CustomerItemHistoryService.Filters(limitedOnly, fill, category, query, from, to),
                pageable);
    }

    @ResponseBody
    @PostMapping(path = "/customer/{id}/item-limits/entries", produces = MediaType.APPLICATION_JSON_VALUE)
    public CreateItemLimitEntryResponse createItemLimitEntry(@PathVariable("id") final UUID id,
                                                             @Valid @RequestBody final CreateItemLimitEntryRequest request) {
        return itemLimitService.createEntry(id.toString(), request);
    }

    @DeleteMapping(path = "/customer/{id}/item-limits/entries/{entryId}")
    public void deleteItemLimitEntry(@PathVariable("id") final UUID id, @PathVariable("entryId") final Long entryId) {
        itemLimitService.deleteEntry(id.toString(), entryId);
    }

    @ResponseBody
    @PostMapping(path = "/customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public CustomerResponse createCustomer(@RequestBody final CreateCustomerRequest customerRequest) {
        return CustomerResponse.from(customerService.createCustomer(customerRequest));
    }


    @ResponseBody
    @PutMapping(path = "/customer/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CustomerResponse updateCustomer(@PathVariable("id") final UUID id,
                                           @RequestBody final UpdateCustomerRequest customerRequest) {
        return CustomerResponse.from(customerService.updateCustomer(id.toString(), customerRequest));
    }


    @ResponseBody
    @GetMapping(path = "/customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<CustomerResponse> getCustomersPaged(
            @PageableDefault(sort = { "lastName", "firstName" }, direction = Sort.Direction.ASC)
            final Pageable pageable,
            @RequestParam(value = "name", required = false)
            final String name,
            @RequestParam(value = "flagged", required = false)
            final Boolean flagged
    ) {
        return customerService
                .getCustomers(pageable, name, flagged)
                .map(CustomerResponse::from);
    }

    @ResponseBody
    @PostMapping(path = "/customer/merge", produces = MediaType.APPLICATION_JSON_VALUE)
    public MergeCustomerResponse mergeCustomers(@RequestBody final MergeCustomerRequest mergeRequest) {
        return customerService.mergeCustomers(mergeRequest);
    }
}
