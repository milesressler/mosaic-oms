package com.mosaicchurchaustin.oms.services.labels;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.response.PrintJobResponse;
import com.mosaicchurchaustin.oms.data.response.PrinterResponse;
import okhttp3.Credentials;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PrintingService {

    private static final String PRINTNODE_URL = "https://api.printnode.com";

    @Value("${printnode.api.key}")
    private String apiKey;

    @Value("${printnode.printer.id}")
    private Integer printerId;

    @Autowired
    LabelService labelService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final OkHttpClient client = new OkHttpClient.Builder()
            .addInterceptor(chain -> {
                final Request original = chain.request();
                final Request request = original.newBuilder()
                        .header("Authorization", Credentials.basic(apiKey, ""))
                        .header("Content-Type", "application/json")
                        .build();
                return chain.proceed(request);
            })
            .build();


    public void printAcceptedOrderLabel(final OrderEntity orderEntity) {
        final byte[] pdfBytes = labelService.generateOrderLabelPdf(orderEntity, OrderStatus.ACCEPTED);
        printPdf(pdfBytes, String.format("Order %s Accepted Label", orderEntity.getId()));
    }

    public void printPackedLabel(final OrderEntity orderEntity) {
        final byte[] pdfBytes = labelService.generateOrderLabelPdf(orderEntity, OrderStatus.PACKED);
        printPdf(pdfBytes, String.format("Order %s Packed Label", orderEntity.getId()));
    }

    private void printPdf(final byte[] pdfBytes, final String title) {
        final String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

        final String jsonPayload = """
            {
                "printerId": %d,
                "title": "%s",
                "contentType": "pdf_base64",
                "content": "%s",
                "source": "Spring Boot App"
            }
            """.formatted(printerId, title, base64Pdf);

        final Request request = new Request.Builder()
                .url(PRINTNODE_URL + "/printjobs")
                .post(RequestBody.create(jsonPayload, okhttp3.MediaType.get("application/json")))
                .build();

        try (final Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Print job failed: " + response.body().string());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<PrinterResponse> getAllPrinters() {
        final Request request = new Request.Builder()
                .url(PRINTNODE_URL + "/printers")
                .get()
                .build();

        try (final Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to fetch printers: " + response.body().string());
            }
            return objectMapper.readValue(response.body().string(), new TypeReference<>() {});
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    @SuppressWarnings("unchecked")
    public Map<String, Object> getPrinter(final Integer printerId) {
        final Request request = new Request.Builder()
                .url(PRINTNODE_URL + "/printers/" + printerId)
                .get()
                .build();

        try (final Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to fetch printer: " + response.body().string());
            }
            final List<Map<String, Object>> printers = objectMapper.readValue(response.body().string(), List.class);
            return printers.isEmpty() ? null : printers.get(0);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<PrintJobResponse> getPrintJobsForPrinter(final Integer printerId) {
        final Request request = new Request.Builder()
                .url(PRINTNODE_URL + "/printers/" + printerId + "/printjobs")
                .get()
                .build();

        try (final Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to fetch print jobs for printer: " + response.body().string());
            }
            final List<Map<String, Object>> rawJobs = objectMapper.readValue(response.body().string(), List.class);
            return rawJobs.stream()
                    .map(this::mapToPrintJobResponse)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private PrintJobResponse mapToPrintJobResponse(final Map<String, Object> jobData) {
        final Long id = Long.valueOf(String.valueOf(jobData.get("id")));
        final String title = (String) jobData.get("title");
        final String state = (String) jobData.get("state");
        final String createTimeStr = (String) jobData.get("createTimestamp");
//        final Integer printerId = (Integer) jobData.get("printer");
//        final String printerName = (String) jobData.get("printerName");
        
        Instant createTimestamp = null;
        if (createTimeStr != null) {
            try {
                createTimestamp = Instant.parse(createTimeStr);
            } catch (Exception e) {
                // Handle different timestamp formats if needed
            }
        }
        
        return new PrintJobResponse(id, title, state, createTimestamp, null, null);
    }

    public Integer getConfiguredPrinterId() {
        return printerId;
    }
}
