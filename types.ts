export interface ProductData {
  title: string;
  description: string;
  images: GeneratedImage[];
  productContext: string;
}

export interface GeneratedImage {
  type: ImageType;
  url: string;
  label: string;
}

export enum ImageType {
  MAIN = 'Main Product',
  COMPARISON = 'Usage/Comparison',
  DIMENSIONS = 'Dimensions',
  MODEL = 'Model Usage',
  LIFESTYLE = 'Lifestyle',
}

export type InputMode = 'upload' | 'text';

export interface AppState {
  step: 'input' | 'processing' | 'results';
  loading: boolean;
  statusMessage: string;
  error: string | null;
  inputData: {
    mode: InputMode;
    value: string; // Base64 string for image, or text string for name/link
    mimeType?: string;
  } | null;
  result: ProductData | null;
}
