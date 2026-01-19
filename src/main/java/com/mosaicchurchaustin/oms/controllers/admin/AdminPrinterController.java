package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.response.PrintJobResponse;
import com.mosaicchurchaustin.oms.data.response.PrinterResponse;
import com.mosaicchurchaustin.oms.services.labels.PrintingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminPrinterController {

    final PrintingService printingService;

    @GetMapping("/configured-printer-id")
    public Integer getConfiguredPrinterId() {
        return printingService.getConfiguredPrinterId();
    }

    @ResponseBody
    @GetMapping(path = "/printers", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<PrinterResponse> getAllPrinters() {
        return printingService.getAllPrinters();
    }

    @ResponseBody
    @GetMapping(path = "/printer/{id}/print-jobs", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<PrintJobResponse> getPrintJobs(
            @PathVariable("id") Integer id
    ) {
        return printingService.getPrintJobsForPrinter(id);
    }
}
