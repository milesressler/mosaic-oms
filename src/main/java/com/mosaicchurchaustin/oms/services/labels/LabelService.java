package com.mosaicchurchaustin.oms.services.labels;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.domain.barcode.QRCodeData;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LabelService {

    @Autowired
    QrCodeGenerator qrCodeGenerator;

    @Autowired
    PdfGenerator pdfGenerator;

    @Value("${mosaic.oms.frontend.url}")
    private String frontendUrl;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] generateOrderLabelPdf(final OrderEntity orderEntity, final OrderStatus orderStatus) {
        final var dataString = getOrderQrCodeData(orderEntity);
        final byte[] qrCodeBytes = qrCodeGenerator.generateQRCode(dataString);

        if (orderStatus == OrderStatus.PACKED) {
            return pdfGenerator.generatePackedOrderPDF(qrCodeBytes, orderEntity);
        } else if (orderStatus == OrderStatus.ACCEPTED) {
            return pdfGenerator.generateAcceptedOrderPDF(qrCodeBytes, orderEntity);
        } else {
            throw new InvalidRequestException("Invalid order status for label generation: " + orderStatus);
        }
    }

    private String getOrderQrCodeData(OrderEntity orderEntity) {
        final String url = String.format("%s/order/%x?source=qr", frontendUrl, orderEntity.getId());
        try {
            return objectMapper.writeValueAsString(
                    new QRCodeData(orderEntity.getId().toString(), "order", orderEntity.getUuid(), url)
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}