import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg';
  quality?: number;
  includeNotes?: boolean;
  includeThumbnails?: boolean;
  pageSize?: 'A4' | 'Letter' | 'A3';
  orientation?: 'portrait' | 'landscape';
}

export interface SlideExportData {
  slides: Array<{
    title: string;
    content: string;
    notes?: string;
    type: string;
    template?: string;
    theme?: string;
  }>;
  presentationTitle: string;
  totalSlides: number;
}

export class SlideExportService {
  /**
   * Export slides to PDF
   */
  static async exportToPDF(
    slideElements: HTMLElement[],
    options: ExportOptions = { format: 'pdf' }
  ): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: options.pageSize || 'A4'
    });

    for (let i = 0; i < slideElements.length; i++) {
      const element = slideElements[i];
      
      try {
        // Capture slide as canvas
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        // Add new page for each slide (except first)
        if (i > 0) {
          pdf.addPage();
        }

        // Calculate dimensions to fit page
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add slide image to PDF
        const imgData = canvas.toDataURL('image/png', options.quality || 0.9);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Add slide number
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Slide ${i + 1}`,
          pdf.internal.pageSize.getWidth() - 20,
          pdf.internal.pageSize.getHeight() - 10
        );

      } catch (error) {
        console.error(`Error capturing slide ${i + 1}:`, error);
        // Add error page
        if (i > 0) pdf.addPage();
        pdf.setFontSize(16);
        pdf.text(`Error capturing slide ${i + 1}`, 20, 50);
      }
    }

    return pdf.output('blob');
  }

  /**
   * Export slides to images
   */
  static async exportToImages(
    slideElements: HTMLElement[],
    options: ExportOptions = { format: 'png' }
  ): Promise<Blob[]> {
    const images: Blob[] = [];

    for (let i = 0; i < slideElements.length; i++) {
      const element = slideElements[i];
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, `image/${options.format}`, options.quality || 0.9);
        });

        images.push(blob);
      } catch (error) {
        console.error(`Error capturing slide ${i + 1}:`, error);
      }
    }

    return images;
  }

  /**
   * Export slides as ZIP file
   */
  static async exportToZIP(
    slideElements: HTMLElement[],
    presentationTitle: string,
    options: ExportOptions = { format: 'png' }
  ): Promise<Blob> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Export images
    const images = await this.exportToImages(slideElements, options);
    
    // Add images to ZIP
    images.forEach((image, index) => {
      const filename = `slide-${String(index + 1).padStart(2, '0')}.${options.format}`;
      zip.file(filename, image);
    });

    // Add metadata file
    const metadata = {
      title: presentationTitle,
      totalSlides: slideElements.length,
      exportDate: new Date().toISOString(),
      format: options.format
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Download file
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export presentation with all options
   */
  static async exportPresentation(
    slideElements: HTMLElement[],
    presentationTitle: string,
    options: ExportOptions = { format: 'pdf' }
  ): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${presentationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}`;

    try {
      let blob: Blob;
      let extension: string;

      switch (options.format) {
        case 'pdf':
          blob = await this.exportToPDF(slideElements, options);
          extension = 'pdf';
          break;
        case 'png':
        case 'jpg':
          if (slideElements.length === 1) {
            const images = await this.exportToImages(slideElements, options);
            blob = images[0];
            extension = options.format;
          } else {
            blob = await this.exportToZIP(slideElements, presentationTitle, options);
            extension = 'zip';
          }
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      this.downloadFile(blob, `${filename}.${extension}`);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export presentation');
    }
  }

  /**
   * Generate slide thumbnails for preview
   */
  static async generateThumbnails(
    slideElements: HTMLElement[],
    size: { width: number; height: number } = { width: 200, height: 150 }
  ): Promise<string[]> {
    const thumbnails: string[] = [];

    for (const element of slideElements) {
      try {
        const canvas = await html2canvas(element, {
          scale: 0.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: size.width * 2,
          height: size.height * 2
        });

        const thumbnail = canvas.toDataURL('image/png', 0.7);
        thumbnails.push(thumbnail);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        thumbnails.push(''); // Empty string for failed thumbnails
      }
    }

    return thumbnails;
  }
}
