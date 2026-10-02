/**
 * Google Cloud Vision API Client
 * Enterprise-grade character & document OCR for curved labels, bottles, and dense ingredient panels.
 */
export async function extractTextWithGoogleVision(
  base64DataUrl: string,
  apiKey?: string
): Promise<string> {
  const effectiveKey = (apiKey && apiKey.trim().length > 5)
    ? apiKey.trim()
    : (import.meta as any).env?.VITE_GOOGLE_VISION_API_KEY || '';

  if (!effectiveKey) {
    throw new Error('Google Cloud Vision API key is not configured.');
  }

  // Extract base64 image data without the data URI prefix
  const rawBase64 = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${effectiveKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          image: { content: rawBase64 },
          features: [
            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
            { type: 'TEXT_DETECTION', maxResults: 1 }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData.error?.message || `HTTP ${response.status}`;
    throw new Error(`Google Cloud Vision error: ${msg}`);
  }

  const data = await response.json();
  const fullText = data.responses?.[0]?.fullTextAnnotation?.text || 
                   data.responses?.[0]?.textAnnotations?.[0]?.description || 
                   '';

  return fullText.trim();
}
