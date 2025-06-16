package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.request.CreateCustomerRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateCustomerRequest;
import com.mosaicchurchaustin.oms.data.response.CustomerResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerSearchResponse;
import com.mosaicchurchaustin.oms.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
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
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CustomerController {

    final CustomerService customerService;

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
}
