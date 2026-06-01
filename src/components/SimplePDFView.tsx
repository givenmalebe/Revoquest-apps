import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileText, Eye, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error - Vite ?url import
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker as unknown as string;
}

interface SimplePDFViewProps {
  file: {
    id: string;
    name: string;
    type: 'pdf';
    url: string;
    size: number;
  };
  onError?: (error: string) => void;
}

const SimplePDFView: React.FC<SimplePDFViewProps> = ({ file, onError }) => {
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadPdf = useCallback(async () => {
    if (!file.url) return;
    setLoading(true);
    setError(null);
    try {
      const pdf = await pdfjsLib.getDocument(file.url).promise;
      const n = pdf.numPages;
      setNumPages(n);
      if (n === 0) setError('PDF has no pages.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load PDF';
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [file.url, onError]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  useEffect(() => {
    if (!numPages || pageNumber < 1 || pageNumber > numPages || !canvasRef.current || !containerRef.current) return;
    let cancelled = false;
    const renderPage = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(file.url).promise;
        const page = await pdf.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const width = Math.min(containerRef.current!.clientWidth || 800, 800);
        const scale = width / baseViewport.width;
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const ctx = canvas.getContext('2d');
        if (!ctx || cancelled) return;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to render page');
      }
    };
    renderPage();
    return () => { cancelled = true; };
  }, [file.url, pageNumber, numPages]);

  const retryLoad = () => {
    setError(null);
    setNumPages(null);
    setPageNumber(1);
    loadPdf();
  };

  if (loading && !numPages) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">PDF Viewer</h4>
        </div>
        <div className="flex flex-col items-center justify-center h-96 border border-gray-300 dark:border-gray-700 rounded shadow-sm bg-gray-50 dark:bg-gray-800">
          <FileText className="h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">PDF Viewer</h4>
        </div>
        <div className="border border-gray-300 dark:border-gray-700 rounded shadow-sm overflow-hidden bg-white dark:bg-gray-900">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm text-center">
            Canvas viewer unavailable. Trying native viewer below.
          </div>
          <object
            data={file.url}
            type="application/pdf"
            className="w-full h-[600px] min-h-[400px]"
            title={`PDF - ${file.name}`}
          >
            <div className="flex flex-col items-center justify-center h-96 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 p-4">
              <AlertCircle className="h-12 w-12 text-red-500 shrink-0" />
              <p className="mt-3 text-center font-medium">{error}</p>
              <p className="text-sm text-center mt-2">Use the Text or Slides tabs, or download the file.</p>
              <a href={file.url} download={file.name} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 inline-flex items-center gap-2">
                Download PDF
              </a>
              <button onClick={retryLoad} className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline">Try again</button>
            </div>
          </object>
        </div>
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400"><strong>File:</strong> {file.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5 text-blue-600" />
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">PDF Viewer</h4>
      </div>

      <div ref={containerRef} className="border border-gray-300 dark:border-gray-700 rounded shadow-sm overflow-hidden bg-white dark:bg-gray-900">
        <div className="min-h-[500px] overflow-auto flex flex-col items-center bg-gray-100 dark:bg-gray-800/50 p-4">
          <canvas ref={canvasRef} className="shadow-md max-w-full h-auto" />
          {numPages !== null && numPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4 mt-4">
              <button
                type="button"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {pageNumber} of {numPages}
              </span>
              <button
                type="button"
                onClick={() => setPageNumber((p) => Math.min(numPages!, p + 1))}
                disabled={pageNumber >= numPages!}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</p>
          <p className="mt-2 text-xs text-gray-500">Use the arrows to change page.</p>
        </div>
      </div>
    </div>
  );
};

export default SimplePDFView;
