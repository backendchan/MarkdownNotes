export interface ImageInfo {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: number;
  noteId?: string;
}

export interface ImageUploadResult {
  success: boolean;
  image?: ImageInfo;
  url?: string;
  error?: string;
}

export type ImageSize = 'small' | 'medium' | 'large' | 'custom';

export interface ImageSizeOption {
  label: string;
  value: ImageSize;
  width: number;
  height?: number;
}

export const IMAGE_SIZE_OPTIONS: ImageSizeOption[] = [
  { label: '小', value: 'small', width: 300 },
  { label: '中', value: 'medium', width: 600 },
  { label: '大', value: 'large', width: 900 },
];

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const IMAGE_STORAGE_KEY = 'md-notes:images';

export type SizeUnit = 'px' | '%';

export interface ImageSizeValue {
  value: number;
  unit: SizeUnit;
}

export interface ParsedImageSize {
  width?: ImageSizeValue;
  height?: ImageSizeValue;
}

export interface ImageSizeInfo {
  width?: number;
  height?: number;
  widthUnit?: SizeUnit;
  heightUnit?: SizeUnit;
  widthPercent?: number;
  heightPercent?: number;
}
