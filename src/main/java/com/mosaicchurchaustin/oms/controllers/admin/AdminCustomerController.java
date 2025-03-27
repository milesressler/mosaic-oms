package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.response.CustomerResponse;
import com.mosaicchurchaustin.oms.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCustomerController {

    final CustomerService customerService;

    @ResponseBody
    @GetMapping(path = "/customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<CustomerResponse> getCustomersPaged(final Pageable pageable) {
        return customerService.getCustomers(pageable).map(CustomerResponse::from);
    }


    @ResponseBody
    @GetMapping(path = "/customer/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CustomerResponse getCustomerByUuid(@PathVariable("id") final UUID id) {
        return CustomerResponse.from(customerService.getCustomer(id.toString()));
    }

}
