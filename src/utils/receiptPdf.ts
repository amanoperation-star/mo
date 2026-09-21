import jsPDF from 'jspdf';
import { Student, CenterSettings } from '../types';
import { generateProfessionalReceipt } from './receiptCanvas';
import { getStoredCenterSettings } from './storage';

export interface ReceiptPdfResult {
  doc: jsPDF;
  blob: Blob;
  dataUri: string;
  fileName: string;
  download: () => void;
  print: () => void;
}

/**
 * Generates an official, publication-quality A4 PDF payment receipt for a student.
 */
export async function generateReceiptPdf(
  student: Student,
  scheduleText?: string,
  centerSettings?: CenterSettings
): Promise<ReceiptPdfResult> {
  const effectiveSettings = centerSettings || getStoredCenterSettings();

  // 1. Generate the Ultra-HD Canvas graphic (1000 x 1420 px)
  const { dataUrl } = await generateProfessionalReceipt(student, scheduleText, effectiveSettings);

  // 2. Initialize jsPDF in A4 portrait format (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm

  // Margin and dimension math:
  // Receipt canvas aspect ratio is 1000 : 1420 = 1 : 1.42
  // We use 10mm horizontal margins -> width = 190mm
  // Height = 190 * 1.42 = ~269.8mm
  // Top/bottom margins = (297 - 269.8) / 2 = ~13.6mm (perfect optical vertical centering)
  const marginX = 10;
  const printWidth = pageWidth - marginX * 2; // 190 mm
  const printHeight = (printWidth * 1420) / 1000; // ~269.8 mm
  const marginY = Math.max(8, (pageHeight - printHeight) / 2);

  // Add the high-resolution image to the PDF
  doc.addImage(dataUrl, 'PNG', marginX, marginY, printWidth, printHeight, undefined, 'FAST');

  // Metadata tags for PDF
  doc.setProperties({
    title: `إيصال دفع رسمي - ${student.name} - ${student.code}`,
    subject: `إيصال سداد وتفعيل اشتراك - ${student.course}`,
    author: effectiveSettings.teacherName || 'أ. أشرف السقا',
    keywords: 'إيصال دفع, اشتراك, كيمياء, سداد, ثانوية عامة',
    creator: effectiveSettings.centerName || 'المنظومة التعليمية الذكية',
  });

  const cleanStudentName = (student.name || 'طالب').trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
  const fileName = `إيصال_دفع_${cleanStudentName}_${student.code}.pdf`;

  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');

  const download = () => {
    doc.save(fileName);
  };

  const print = () => {
    // Open a printable window or invisible iframe
    try {
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        // Give browser reader a brief moment to render before calling print
        setTimeout(() => {
          try {
            printWindow.print();
          } catch {
            // fallback
          }
        }, 600);
      } else {
        // Pop-up blocker fallback: use hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          }, 300);
        };
      }
    } catch (e) {
      console.error('Direct print failed, triggering download instead:', e);
      download();
    }
  };

  return {
    doc,
    blob,
    dataUri,
    fileName,
    download,
    print,
  };
}

/**
 * Convenience helper to directly download PDF with one call
 */
export async function downloadReceiptPdf(
  student: Student,
  scheduleText?: string,
  centerSettings?: CenterSettings
): Promise<string> {
  const result = await generateReceiptPdf(student, scheduleText, centerSettings);
  result.download();
  return result.fileName;
}

/**
 * Convenience helper to directly trigger PDF print with one call
 */
export async function printReceiptPdf(
  student: Student,
  scheduleText?: string,
  centerSettings?: CenterSettings
): Promise<void> {
  const result = await generateReceiptPdf(student, scheduleText, centerSettings);
  result.print();
}
