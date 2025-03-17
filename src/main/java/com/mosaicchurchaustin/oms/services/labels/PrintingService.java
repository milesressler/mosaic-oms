package com.mosaicchurchaustin.oms.services.labels;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.pojo.barcode.QRCodeData;
import okhttp3.Credentials;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Base64;

@Component
public class PrintingService {

    private static final String PRINTNODE_URL = "https://api.printnode.com";

    @Value("${printnode.api.key}")
    private String apiKey;

    @Value("${printnode.printer.id}")
    private Integer printerId;

    @Autowired
    QrCodeGenerator qrCodeGenerator;

    @Autowired
    PdfGenerator pdfGenerator;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .addInterceptor(chain -> {
                Request original = chain.request();
                Request request = original.newBuilder()
                        .header("Authorization", Credentials.basic(apiKey, ""))
                        .header("Content-Type", "application/json")
                        .build();
                return chain.proceed(request);
            })
            .build();

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public void printAcceptedOrderLabel(final OrderEntity orderEntity) {
        // Generate QR Code
        final var dataString = getOrderQrCodeData(orderEntity);

        final byte[] qrCodeBytes = qrCodeGenerator.generateQRCode(dataString);

        final byte[] pdfBytes = pdfGenerator.generateAcceptedOrderPDF(qrCodeBytes, orderEntity);
        final String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
//        final File filePdf = new File("qrcode"  + orderEntity.getId() + ".pdf");
//        try (FileOutputStream fos = new FileOutputStream(filePdf)) {
//            fos.write(pdfBytes);
//        }

        // Create JSON payload for PrintNode
        final String jsonPayload = """
            {
                "printerId": %d,
                "title": "Order QR Code",
                "contentType": "pdf_base64",
                "content": "%s",
                "source": "Spring Boot App"
            }
            """.formatted(printerId, base64Pdf);


        final Request request = new Request.Builder()
                .url(PRINTNODE_URL + "/printjobs")
                .post(RequestBody.create(jsonPayload, okhttp3.MediaType.get("application/json")))
                .build();

        // Execute request
        try (final Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Print job failed: " + response.body().string());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void printPackedLabel(final OrderEntity orderEntity) {
        // Generate QR Code
        final var dataString = getOrderQrCodeData(orderEntity);

        final byte[] qrCodeBytes = qrCodeGenerator.generateQRCode(dataString);


        final byte[] pdfBytes = pdfGenerator.generatePackedOrderPDF(qrCodeBytes, orderEntity);
        final String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

        // Create JSON payload for PrintNode
        final String jsonPayload = """
            {
                "printerId": %d,
                "title": "Order QR Code",
                "contentType": "pdf_base64",
                "content": "%s",
                "source": "Spring Boot App"
            }
            """.formatted(printerId, base64Pdf);


        final Request request = new Request.Builder()
                .url(PRINTNODE_URL + "/printjobs")
                .post(RequestBody.create(jsonPayload, okhttp3.MediaType.get("application/json")))
                .build();

        // Execute request
        if (false) {
            try (final Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new RuntimeException("Print job failed: " + response.body().string());
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private String getOrderQrCodeData(OrderEntity orderEntity)  {
        try {
            return objectMapper.writeValueAsString(
                    new QRCodeData(orderEntity.getId().toString(), "order")
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
