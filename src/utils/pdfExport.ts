import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename: string;
  onProgress?: (isGenerating: boolean) => void;
}

/**
 * Captures an HTML element using html2canvas and exports it as an A4 formatted PDF with jsPDF.
 * Supports multi-page splitting and high DPI rendering.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<void> {
  const { filename, onProgress } = options;
  if (onProgress) onProgress(true);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Remaining pages if content exceeds A4 height
    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
  } catch (error) {
    console.error('[Academia Virtual del Derecho] Error al generar documento PDF:', error);
    throw error;
  } finally {
    if (onProgress) onProgress(false);
  }
}
