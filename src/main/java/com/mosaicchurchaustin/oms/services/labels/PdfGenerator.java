package com.mosaicchurchaustin.oms.services.labels;

import ch.qos.logback.core.testUtil.RandomUtil;
import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderItemSubstitutionEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;


@Service
public class PdfGenerator {

    private static final float LABEL_WIDTH = 175; // 2 3/7 inches in points
    private static final float LABEL_HEIGHT = 255;
    private static final float PADDING = 3;
    private static final float LINE_HEIGHT = 14f;// Margin for text
    private static final int ITEMS_PER_PAGE =10;// Margin for text

    public byte[] generatePackedOrderPDF(final byte[] qrCodeBytes, final OrderEntity orderEntity) {
        // Items that are not fully handled (exact fill + substitutions)
        final var unhandledItems = orderEntity.getOrderItemList().stream()
                .filter(item -> item.getQuantity() > item.getTotalHandled())
                .toList();
        // Items that have at least one substitution
        final var substitutedItems = orderEntity.getOrderItemList().stream()
                .filter(item -> !item.getSubstitutions().isEmpty())
                .toList();

        final boolean allHandled = unhandledItems.isEmpty() && substitutedItems.isEmpty();

        // Each substitution gets its own label line; combine unhandled items + substitution lines for paging
        final int totalLines = unhandledItems.size()
                + substitutedItems.stream().mapToInt(i -> i.getSubstitutions().size()).sum();
        final int totalPageCount = Math.max(1, (int) Math.ceil((double) totalLines / ITEMS_PER_PAGE));

        try (final PDDocument document = new PDDocument();
             final ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            final PDImageXObject qrCodeImage = PDImageXObject
                    .createFromByteArray(document, qrCodeBytes, "qrcode.png");

            // Build a flat list of lines to render
            record LabelLine(String text) {}
            final List<LabelLine> lines = new java.util.ArrayList<>();
            for (final OrderItemSubstitutionEntity sub : substitutedItems.stream()
                    .flatMap(i -> i.getSubstitutions().stream()).toList()) {
                final String originalDesc = sub.getOrderItem().getItemEntity().getDescription();
                final String subDesc = sub.getItem().getDescription();
                final String label = "SUB: " + subDesc + " (x" + sub.getQuantity() + ")"
                        + (originalDesc.equals(subDesc) ? "" : " [for " + originalDesc + "]");
                lines.add(new LabelLine(label));
            }
            for (final OrderItemEntity item : unhandledItems) {
                lines.add(new LabelLine(
                        "(" + item.getTotalHandled() + " of " + item.getQuantity() + ") "
                                + item.getItemEntity().getDescription()));
            }

            for (int pageNum = 0; pageNum < totalPageCount; pageNum++) {
                final PDPage page = appendPage(document);
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    final float qrSize = LABEL_WIDTH * 0.47f;
                    final float xPosition = LABEL_WIDTH - (qrSize + PADDING);
                    final float yPosition = LABEL_HEIGHT - qrSize;

                    contentStream.drawImage(qrCodeImage, xPosition, yPosition, qrSize, qrSize);
                    buildHeading(orderEntity, pageNum, totalPageCount, contentStream);

                    float itemYPosition = LABEL_HEIGHT - qrSize - PADDING - 10;
                    final int lineHeight = 16;

                    if (allHandled) {
                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                        contentStream.newLineAtOffset(PADDING, itemYPosition);
                        contentStream.showText("All items filled.");
                        contentStream.endText();
                        break;
                    }

                    final List<LabelLine> pageLines = lines.subList(
                            pageNum * ITEMS_PER_PAGE,
                            Math.min((pageNum + 1) * ITEMS_PER_PAGE, lines.size())
                    );

                    for (final LabelLine line : pageLines) {
                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                        contentStream.newLineAtOffset(PADDING, itemYPosition + 2);
                        contentStream.showText(line.text());
                        contentStream.endText();
                        itemYPosition -= lineHeight;
                    }
                }
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }



    public byte[] generateAcceptedOrderPDF(final byte[] qrCodeBytes, final OrderEntity orderEntity) {
        final var items = orderEntity.getOrderItemList();
        final int totalPageCount = (int) Math.ceil((double) items.size() / ITEMS_PER_PAGE);
        try (final PDDocument document = new PDDocument();
             final ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // Load the image into the PDF
            final PDImageXObject qrCodeImage = PDImageXObject
                    .createFromByteArray(document, qrCodeBytes, "qrcode.png");

            for (int pageNum = 0; pageNum < totalPageCount; pageNum++) {
                final PDPage page = appendPage(document);
                // Draw the image on the PDF
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    final float qrSize = LABEL_WIDTH * 0.5f; // 60% of label width
                    final float xPosition = LABEL_WIDTH - (qrSize + PADDING);  // Center horizontally
                    final float yPosition = LABEL_HEIGHT - qrSize;

                    contentStream.drawImage(qrCodeImage, xPosition, yPosition, qrSize, qrSize);
                    buildHeading(orderEntity, pageNum, totalPageCount, contentStream);

                    // Start position for items
                    float itemYPosition = LABEL_HEIGHT - qrSize - PADDING; // Adjust based on layout
                    int lineHeight = 16; // Adjust as needed

                    // Get items for this page
                    final List<OrderItemEntity> pageItems = items.subList(pageNum * ITEMS_PER_PAGE, Math.min((pageNum + 1) * ITEMS_PER_PAGE, items.size()));

                    for (final OrderItemEntity item : pageItems) {
//                        writeLineItem(item, contentStream);
                        drawItemWithCheckbox(contentStream, item.getItemEntity().getDescription(), item.getQuantity(), PADDING, itemYPosition);
                        itemYPosition -= lineHeight;
                    }
                }
            }

        // Save PDF to ByteArrayOutputStream
            document.save(outputStream);
            final var result = outputStream.toByteArray();
//            Files.write(Path.of("test_label" + RandomUtil.getPositiveInt() + ".pdf"), result); // Save PDF

            return result;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void buildHeading(final OrderEntity orderEntity,
                             final int page,
                             final int totalPages,
                             final PDPageContentStream contentStream) throws IOException {

        float textY = LABEL_HEIGHT - 24;

        contentStream.beginText();
        contentStream.newLineAtOffset(PADDING, textY);

        contentStream.setLeading(LINE_HEIGHT); // Line spacing

        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 8);
        contentStream.showText("# ");
        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 28);
        contentStream.showText(Optional.ofNullable(orderEntity.getId()).orElse(0L).toString());

        contentStream.newLine();
        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
        contentStream.showText(orderEntity.getCustomer().getFirstName());
        contentStream.newLine();
        contentStream.showText(orderEntity.getCustomer().getLastName());

        contentStream.setLeading(LINE_HEIGHT/2); // Line spacing
        contentStream.newLine();
        contentStream.setLeading(LINE_HEIGHT); // Line spacing
        contentStream.newLine();
        if (totalPages > 1) {
            contentStream.showText(String.format("%s of %s", page + 1, totalPages));
        }
        contentStream.newLine();
        contentStream.newLine(); // Extra space before items

        // End text block before drawing the checkbox
        contentStream.endText();
    }

    private static PDPage appendPage(final PDDocument document) {
        final PDPage page = new PDPage(new PDRectangle(LABEL_WIDTH, LABEL_HEIGHT));
        document.addPage(page);
        return page;
    }

    /**
     * Helper method to draw an item with a checkbox.
     */

    private void drawItemWithCheckbox(PDPageContentStream contentStream, String itemName, int quantity, float x, float y) throws IOException {
        float boxSize = 10;

        // Draw checkbox
        contentStream.setLineWidth(1);
        contentStream.addRect(x, y, boxSize, boxSize);
        contentStream.stroke();

        // Restart text block for text
        contentStream.beginText();
        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
        contentStream.newLineAtOffset(x + 15, y + 2);
        contentStream.showText("(" + quantity + ") " + itemName);
        contentStream.endText();
    }

    @Deprecated
    private void drawUnfulfilledItem(PDPageContentStream contentStream, String itemName, int quantityRequested, int quantityFulfilled, float x, float y) throws IOException {
        // Restart text block for text
        contentStream.beginText();
        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
        contentStream.newLineAtOffset(x, y + 2);
        contentStream.showText("(" + quantityFulfilled + " of " + quantityRequested + ") " + itemName);
        contentStream.endText();
    }

    public static void main(String[] args) throws Exception {
        // Example usage
        PdfGenerator generator = new PdfGenerator();
        byte[] qrCodeBytes = Files.readAllBytes(Path.of("/Users/milesressler/workspace/mosaic/mosaic-oms/qr_code_sample.png")); // Load an example QR code image
        byte[] pdfBytes = generator.generateAcceptedOrderPDF(qrCodeBytes,
                OrderEntity.builder()
                        .customer(new CustomerEntity("Fred", "Flintstone", "", "", false, false, null, false))
                        .build()
        );

        Files.write(Path.of("test_label" + RandomUtil.getPositiveInt() + ".pdf"), pdfBytes); // Save PDF
        System.out.println("PDF label saved as test_label.pdf");
    }
}

