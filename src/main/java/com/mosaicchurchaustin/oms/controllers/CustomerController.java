package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.response.CustomerResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerSearchResponse;
import com.mosaicchurchaustin.oms.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    @GetMapping(path = "/customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<CustomerResponse> getCustomersPaged(final Pageable pageable) {
        return customerService.getCustomers(pageable).map(CustomerResponse::from);
    }
}
