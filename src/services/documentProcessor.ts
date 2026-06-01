import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error - Vite handles ?url imports
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker as unknown as string;
}

export interface DocumentProcessingResult {
  content: string;
  wordCount: number;
  characterCount: number;
  fileType: string;
  fileName: string;
  fileSize: number;
}

export class DocumentProcessor {
  async processDocument(file: File): Promise<DocumentProcessingResult> {
    const content = await this.extractTextFromFile(file);
    
    return {
      content,
      wordCount: this.countWords(content),
      characterCount: content.length,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size
    };
  }

  private async extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      return this.extractTextFromPDFFile(file);
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) reject(new Error('Failed to read file content'));
        else resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      if (file.type === 'text/plain' || file.type.includes('text/') || file.type === 'application/json') {
        reader.readAsText(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reject(new Error('DOCX files are not yet supported. Please convert to PDF or TXT format.'));
      } else {
        reject(new Error('Unsupported file type. Please upload a text, PDF, or JSON file.'));
      }
    });
  }

  private async extractTextFromPDFFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: { str?: string }) => ('str' in item ? item.str : ''))
        .join(' ');
      pageTexts.push(pageText);
    }
    return pageTexts.join('\n\n').trim() || `PDF "${file.name}" has no extractable text (may be scanned/image-based).`;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('text/')) return '📝';
    if (fileType === 'application/json') return '📋';
    if (fileType.includes('word')) return '📄';
    return '📁';
  }
}

export const documentProcessor = new DocumentProcessor();
