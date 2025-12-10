import { jsPDF } from "jspdf";

export interface ChatExportData {
  question: string;
  answer: string;
  sources?: Array<{ source?: string; chunk_index?: number }>;
  timestamp?: Date;
}

export function exportChatToPDF(data: ChatExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (
    text: string,
    fontSize: number,
    isBold: boolean = false,
    color: [number, number, number] = [0, 0, 0]
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  // Header
  doc.setFillColor(31, 41, 55); // Dark gray
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("LawGlance", margin, 25);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Legal Consultation Report", margin, 35);

  yPosition = 55;

  // Timestamp
  if (data.timestamp) {
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${data.timestamp.toLocaleString()}`,
      margin,
      yPosition
    );
    yPosition += 15;
  }

  // Separator line
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Question Section
  addText("Question:", 14, true, [37, 99, 235]); // Blue color
  addText(data.question, 11, false);
  yPosition += 5;

  // Separator
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Answer Section
  addText("Legal Guidance:", 14, true, [37, 99, 235]);

  // Format answer with proper spacing
  const answerParagraphs = data.answer.split("\n").filter((p) => p.trim());
  answerParagraphs.forEach((paragraph) => {
    addText(paragraph.trim(), 11, false);
    yPosition += 3;
  });

  // Sources Section
  if (data.sources && data.sources.length > 0) {
    yPosition += 10;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    addText("Referenced Sources:", 14, true, [37, 99, 235]);

    data.sources.forEach((source, index) => {
      if (source.source) {
        const sourceText = `${index + 1}. ${source.source}${
          source.chunk_index !== undefined
            ? ` (Section ${source.chunk_index})`
            : ""
        }`;
        addText(sourceText, 10, false, [75, 85, 99]);
      }
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(
    "This document is for informational purposes only and does not constitute legal advice.",
    margin,
    footerY
  );
  doc.text(
    `Page 1 of ${doc.getNumberOfPages()}`,
    pageWidth - margin - 30,
    footerY
  );

  // Save PDF
  const fileName = `LawGlance_Consultation_${
    data.timestamp
      ? data.timestamp.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
}

export function exportMultipleChats(chats: ChatExportData[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const addText = (
    text: string,
    fontSize: number,
    isBold: boolean = false,
    color: [number, number, number] = [0, 0, 0]
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  // Header
  doc.setFillColor(31, 41, 55);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("LawGlance", margin, 25);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Consultation History Report", margin, 35);

  yPosition = 55;

  // Process each chat
  chats.forEach((chat, chatIndex) => {
    if (chatIndex > 0) {
      yPosition += 10;
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }

    addText(`Consultation ${chatIndex + 1}`, 14, true, [37, 99, 235]);

    if (chat.timestamp) {
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(10);
      doc.text(chat.timestamp.toLocaleString(), margin, yPosition);
      yPosition += 15;
    }

    addText("Question:", 12, true, [0, 0, 0]);
    addText(chat.question, 11, false);

    addText("Answer:", 12, true, [0, 0, 0]);
    const answerParagraphs = chat.answer.split("\n").filter((p) => p.trim());
    answerParagraphs.forEach((paragraph) => {
      addText(paragraph.trim(), 11, false);
    });
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 15;
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "This document is for informational purposes only and does not constitute legal advice.",
      margin,
      footerY
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, footerY);
  }

  const fileName = `LawGlance_History_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
}
