/**
 * Lesson image generation previously used Google Imagen.
 * OpenRouter text models used elsewhere do not replace Imagen; image fills are skipped until a dedicated image API is configured.
 */

export interface GenerateLessonImageResult {
  dataUrl: string | null;
  prompt: string;
  error?: string;
}

/**
 * Generate a single image from a text prompt. Image generation is currently disabled (no Imagen/OpenRouter image pipeline).
 * Returns null dataUrl; callers may leave placeholders in HTML.
 */
export async function generateLessonImage(prompt: string): Promise<GenerateLessonImageResult> {
  if (!prompt?.trim()) {
    return { dataUrl: null, prompt };
  }
  return { dataUrl: null, prompt };
}

/**
 * Replace HTML placeholders with data-prompt with generated images.
 * Figures with class "lesson-image" and data-prompt are replaced with img tags when generation succeeds.
 */
export async function fillLessonImagesInHtml(html: string): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const figures = doc.querySelectorAll('figure.lesson-image[data-prompt]');
  if (figures.length === 0) return html;
  for (const fig of figures) {
    const prompt = fig.getAttribute('data-prompt');
    if (!prompt) continue;
    const result = await generateLessonImage(prompt);
    if (result.dataUrl) {
      const img = doc.createElement('img');
      img.setAttribute('src', result.dataUrl);
      img.setAttribute('alt', prompt.slice(0, 100));
      img.className = 'lesson-generated-image';
      fig.replaceWith(img);
    }
    // If generation failed, leave the figure (with optional caption) as-is
  }
  return doc.body?.innerHTML ?? html;
}
