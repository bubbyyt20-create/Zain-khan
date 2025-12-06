import { GoogleGenAI, Type } from "@google/genai";
import { ImageType, GeneratedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean base64 string
const cleanBase64 = (data: string) => {
  return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

/**
 * Step 2: Understand the product
 * Analyzes the input (image or text) to get a detailed context string.
 */
export const analyzeProduct = async (
  mode: 'upload' | 'text',
  value: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    let prompt = "";
    let contents: any = {};

    if (mode === 'upload') {
      prompt = `Analyze this image for a dropshipping product listing. 
      Identify exactly what the product is, its likely category, key features, materials, and human usage. 
      Be specific. Return a detailed paragraph description suitable for generating marketing assets.`;
      
      contents = {
        parts: [
          { inlineData: { mimeType, data: cleanBase64(value) } },
          { text: prompt }
        ]
      };
    } else {
      prompt = `Analyze this product input: "${value}". 
      If it is a URL, infer the product details from the string.
      Identify exactly what the product is, its likely category, key features, and human usage.
      Return a detailed paragraph description suitable for generating marketing assets.`;
      
      // Use Search tool if it looks like a URL or complex query to get better context
      const useSearch = value.startsWith('http') || value.includes('www.');
      
      const config: any = {};
      if (useSearch) {
         config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
      
      return response.text || "Unknown Product";
    }

    const response = await ai.models.generateContent({
      model,
      contents,
    });

    return response.text || "Unknown Product";

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze product.");
  }
};

/**
 * Step 3: Generate 5 Images
 */
export const generateProductImages = async (
  productContext: string, 
  inputImage?: string, 
  mimeType: string = 'image/jpeg'
): Promise<GeneratedImage[]> => {
  // Downgrade to gemini-2.5-flash-image to avoid 403 Permission Denied on Pro models
  const imageModel = 'gemini-2.5-flash-image';

  const prompts = [
    {
      type: ImageType.MAIN,
      label: "Main Image",
      prompt: `Professional e-commerce product photography of ${productContext}. 
      Clean pure white background. High resolution, 4k, Amazon listing style, studio lighting, sharp focus.`
    },
    {
      type: ImageType.COMPARISON,
      label: "Comparison",
      prompt: `Split screen comparison image. 
      Left side: Black and white, messy or difficult situation WITHOUT ${productContext}, labeled 'Before'. 
      Right side: Bright, colorful, organized situation WITH ${productContext}, labeled 'After'. 
      High quality, realistic.`
    },
    {
      type: ImageType.DIMENSIONS,
      label: "Dimensions",
      prompt: `Product photography of ${productContext} on a white background. 
      Overlay technical measurement lines (arrows) indicating height and width to show scale. 
      Professional infographic style.`
    },
    {
      type: ImageType.MODEL,
      label: "Model In Use",
      prompt: `A realistic photo of a model using ${productContext} in a natural setting. 
      The image should have 2-3 floating text bubbles highlighting key benefits like 'Easy to Use' or 'Durable'. 
      High quality commercial photography.`
    },
    {
      type: ImageType.LIFESTYLE,
      label: "Lifestyle",
      prompt: `A happy lifestyle shot of a model holding or standing near ${productContext}. 
      Smiling, blurred aesthetic background appropriate for the product category. 
      Warm lighting, inviting atmosphere.`
    }
  ];

  // We execute these in parallel for speed, but handle individual failures
  const imagePromises = prompts.map(async (p) => {
    try {
      const parts: any[] = [];
      
      // If user uploaded an image, provide it as reference to ensure the generated product looks the same
      if (inputImage) {
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64(inputImage)
          }
        });
        
        // Add specific instruction to use the reference image
        const strictPrompt = `Using the provided reference image, generate a ${p.label} image. 
        Scene Description: ${p.prompt}
        CRITICAL: The product in the output MUST match the visual identity, colors, materials, and shape of the provided reference image exactly. Do not alter the product's design.`;
        parts.push({ text: strictPrompt });
      } else {
        parts.push({ text: p.prompt });
      }

      const response = await ai.models.generateContent({
        model: imageModel,
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
                // Removed imageSize as it is not supported by gemini-2.5-flash-image
            }
        }
      });

      let imageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) throw new Error("No image data returned");

      return {
        type: p.type,
        label: p.label,
        url: imageUrl
      };
    } catch (e) {
      console.error(`Failed to generate ${p.type}`, e);
      // Return a placeholder on failure to not break the whole set
      return {
        type: p.type,
        label: p.label,
        url: "https://picsum.photos/1024/1024?grayscale" 
      };
    }
  });

  return Promise.all(imagePromises);
};

/**
 * Step 4: SEO Title
 */
export const generateSeoTitle = async (productContext: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create a short, high-converting Amazon-style SEO title for this product: ${productContext}. 
    Include the main keyword and the primary benefit. Keep it under 150 characters. Do not use quotes.`,
  });
  return response.text?.trim() || "Product Title";
};

/**
 * Step 5: SEO Description
 */
export const generateSeoDescription = async (productContext: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Write a compelling dropshipping product description for: ${productContext}.
    Length: 150-250 words.
    Structure:
    1. Hook/Intro
    2. Bullet points of key features
    3. Main Benefits
    4. Call to Action
    Tone: Persuasive, professional, and exciting. Use emojis where appropriate.`,
  });
  return response.text?.trim() || "Product Description";
};