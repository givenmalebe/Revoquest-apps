import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface CertificatePayload {
  learnerName: string;
  learnerId: string;
  courseTitle: string;
  issueDate: string; // already formatted for display
}

// Served from public/Certificate/ (copied from project Certificate/ folder).
const CERT_TEMPLATE_URL = '/Certificate/certificate%20template.pdf';

export function certificateDownloadFilename(courseTitle: string): string {
  const safe = (courseTitle || 'course').replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
  return `${safe || 'course'}_certificate.pdf`;
}

/** Trigger browser download for a generated certificate PDF. */
export function downloadCertificateBlob(blob: Blob, courseTitle: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = certificateDownloadFilename(courseTitle);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Loads the PDF certificate template and draws the learner's details onto it.
 * Returns a Blob containing the final PDF for download/printing.
 */
export async function generateCertificateFromTemplate(
  payload: CertificatePayload
): Promise<Blob> {
  const res = await fetch(CERT_TEMPLATE_URL);
  if (!res.ok) {
    throw new Error('Could not load certificate template PDF.');
  }
  const templateArrayBuffer = await res.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateArrayBuffer);
  const pages = pdfDoc.getPages();
  if (pages.length === 0) {
    throw new Error('Certificate template has no pages.');
  }

  const page = pages[0];
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSizeName = 20;
  const fontSizeCourse = 16;
  const fontSizeMeta = 12;
  const fontSizeId = 16;

  // These coordinates are tuned for a typical landscape A4 template.
  // You can adjust x/y values later to match the exact Canva design.
  const centerX = width / 2;

  const learnerNameText = payload.learnerName || 'Learner';
  const courseText = payload.courseTitle || 'Course';
  // Template already has the labels "ID NO:" and "Date of issue" – we only draw the values.
  const idText = payload.learnerId || '-';
  const dateText = payload.issueDate;

  const nameWidth = font.widthOfTextAtSize(learnerNameText, fontSizeName);
  const courseWidth = font.widthOfTextAtSize(courseText, fontSizeCourse);
  const dateWidth = font.widthOfTextAtSize(dateText, fontSizeMeta);

  // Learner name – centered in the \"presented to\" slot (nudged slightly down)
  page.drawText(learnerNameText, {
    x: centerX - nameWidth / 2,
    y: height * 0.540,
    size: fontSizeName,
    font,
    color: rgb(0.1, 0.1, 0.2),
  });

  // Course title – centered just below "HAS SUCCESSFULLY COMPLETED" (nudged slightly down)
  page.drawText(courseText, {
    x: centerX - courseWidth / 2,
    y: height * 0.33,
    size: fontSizeCourse,
    font,
    color: rgb(0.15, 0.15, 0.25),
  });

  // Learner ID – to the right of the static "ID NO:" label in the centre block
  page.drawText(idText, {
    x: centerX + width * 0.04,
    y: height * 0.428,
    size: fontSizeId,
    font,
    color: rgb(0.25, 0.25, 0.35),
  });

  // Date issued – slightly higher above the "Date of issue" label at the bottom-left
  page.drawText(dateText, {
    x: width * 0.22 - dateWidth / 2,
    y: height * 0.20,
    size: fontSizeMeta,
    font,
    color: rgb(0.25, 0.25, 0.35),
  });

  const pdfBytes = await pdfDoc.save();
  // Convert Uint8Array to a plain ArrayBuffer for Blob
  const arrayBuffer = (pdfBytes.buffer as ArrayBuffer).slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength
  );
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

