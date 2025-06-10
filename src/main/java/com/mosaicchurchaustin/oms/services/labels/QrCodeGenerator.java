package com.mosaicchurchaustin.oms.services.labels;


import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Hashtable;

@Component
public class QrCodeGenerator {
    final QRCodeWriter qrCodeWriter = new QRCodeWriter();

    @SneakyThrows
    public byte[] generateQRCode(final String data) {

        Hashtable<EncodeHintType, Object> hints = new Hashtable<>() {{
            put(EncodeHintType.MARGIN, 0);
            put(EncodeHintType.CHARACTER_SET, "UTF-8");
            put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        }};

        // Ask ZXing for plenty of room (pixels, not modules)
        int qrPixels = 300;
        BitMatrix matrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, qrPixels, qrPixels, hints);

        int w = matrix.getWidth();                 // real size chosen by ZXing
        BufferedImage img = new BufferedImage(w, w, BufferedImage.TYPE_INT_RGB);

        for (int x = 0; x < w; x++) {
            for (int y = 0; y < w; y++) {
                img.setRGB(x, y, matrix.get(x, y) ? 0x000000 : 0xFFFFFF);
            }
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(img, "png", out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

//    public static void main(String[] args) throws Exception {
//        // Example usage
//        QrCodeGenerator generator = new QrCodeGenerator();
//        String data = "";
//            try {
//                data =  new ObjectMapper().writeValueAsString(
//                        new QRCodeData("2000", "order", UUID.randomUUID().toString())
//                );
//            } catch (JsonProcessingException e) {
//                throw new RuntimeException(e);
//
//        }
//
//        var bytes = generator.generateQRCode(data);
////        byte[] qrCodeBytes = Files.readAllBytes(Path.of("/Users/milesressler/workspace/mosaic/mosaic-oms/qrcode95.png")); // Load an example QR code image
////        byte[] pdfBytes = generator.generatePdfWithQRCode(qrCodeBytes, "12345", "John Doe");
//
//        Files.write(Path.of("qr_code_" + RandomUtil.getPositiveInt() + ".png"), bytes); // Save PDF
//        System.out.println("QR code saved");
//    }
}

