package com.onboarding.system.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.onboarding.system.dto.ReportResponse;
import com.onboarding.system.dto.ReportRowDto;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

@Service
public class PdfReportService {

    public byte[] buildPdf(ReportResponse report) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            document.add(new Paragraph(report.getReportName(), titleFont));
            document.add(new Paragraph(
                    "Generated at: " + report.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                    textFont));
            document.add(new Paragraph("Total Records: " + report.getTotalRecords(), textFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(Math.max(report.getColumns().size(), 1));
            table.setWidthPercentage(100f);

            for (String column : report.getColumns()) {
                PdfPCell header = new PdfPCell(new Phrase(column, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                table.addCell(header);
            }

            for (ReportRowDto row : report.getRows()) {
                for (String column : report.getColumns()) {
                    table.addCell(new Phrase(row.getData().getOrDefault(column, "-"), textFont));
                }
            }

            document.add(table);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException exception) {
            throw new IllegalStateException("Unable to generate report PDF", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Unexpected PDF generation failure", exception);
        }
    }
}
