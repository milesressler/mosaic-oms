package com.mosaicchurchaustin.oms.services.labels;


import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Hashtable;

@Component
public class QrCodeGenerator {
    final static int matrixSize = 32;
    final QRCodeWriter qrCodeWriter = new QRCodeWriter();

    public byte[] generateQRCode(final String data) {

        final Hashtable<EncodeHintType, Object> hints = new Hashtable<>() {{
            put(EncodeHintType.MARGIN, 0);  // Remove margin
        }};

        final BitMatrix byteMatrix;
        try {
            byteMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, matrixSize, matrixSize, hints);
        } catch (WriterException e) {
            throw new RuntimeException(e);
        }

        final BufferedImage qrImage = new BufferedImage(matrixSize, matrixSize, BufferedImage.TYPE_INT_RGB);
        qrImage.createGraphics();

        final Graphics2D graphics = (Graphics2D) qrImage.getGraphics();
        graphics.setColor(Color.WHITE);
        graphics.fillRect(0, 0, matrixSize, matrixSize);
        // Paint and save the image using the ByteMatrix
        graphics.setColor(Color.BLACK);

        for (int i = 0; i < matrixSize; i++) {
            for (int j = 0; j < matrixSize; j++) {
                if (byteMatrix.get(i, j)) {
                    graphics.fillRect(i, j, 1, 1);
                }
            }
        }

        final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            ImageIO.write(qrImage, "png", outputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return outputStream.toByteArray();
    }

//    public static void main(String[] args) throws Exception {
//        // Example usage
//        QrCodeGenerator generator = new QrCodeGenerator();
//        var bytes = generator.generateQRCode("https://mosaic.miles-smiles.us/order/1");
////        byte[] qrCodeBytes = Files.readAllBytes(Path.of("/Users/milesressler/workspace/mosaic/mosaic-oms/qrcode95.png")); // Load an example QR code image
////        byte[] pdfBytes = generator.generatePdfWithQRCode(qrCodeBytes, "12345", "John Doe");
//
//        Files.write(Path.of("qr_code_" + RandomUtil.getPositiveInt() + ".png"), bytes); // Save PDF
//        System.out.println("QR code saved");
//    }
}

