/**
 * PDF Data URL Converter
 * Converts blob URLs to data URLs for direct PDF viewing
 */

export const convertBlobToDataUrl = async (blobUrl: string): Promise<string | null> => {
  try {
    console.log('Converting blob URL to data URL:', blobUrl);
    
    // Check if it's a blob URL
    if (!blobUrl.startsWith('blob:')) {
      return blobUrl;
    }

    // Try to fetch the blob and convert to data URL
    try {
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('Successfully converted blob to data URL');
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          console.error('Error reading blob as data URL');
          reject(new Error('Failed to read blob as data URL'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (fetchError) {
      console.warn('Failed to fetch blob, trying direct approach:', fetchError);
      // If fetch fails due to CORS, we'll fall back to the original URL
      return blobUrl;
    }
  } catch (error) {
    console.error('Error converting blob to data URL:', error);
    return null;
  }
};

export const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

export const getPdfDisplayUrl = async (originalUrl: string): Promise<string> => {
  if (isBlobUrl(originalUrl)) {
    const dataUrl = await convertBlobToDataUrl(originalUrl);
    return dataUrl || originalUrl;
  }
  return originalUrl;
};
