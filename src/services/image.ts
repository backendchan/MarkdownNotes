import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { ImageInfo, ImageUploadResult } from '../types';

const imageStore = localforage.createInstance({
  name: 'markdown-notes',
  storeName: 'images',
});

export const imageService = {
  async validateImage(file: File): Promise<{ valid: boolean; error?: string }> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `不支持的文件类型: ${file.type}。支持的格式: JPG, PNG, WEBP, GIF`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `文件大小超出限制: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大允许: 10MB`,
      };
    }

    return { valid: true };
  },

  async getImageDimensions(
    file: File
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('无法加载图片'));
      };

      img.src = url;
    });
  },

  async uploadImage(
    file: File,
    noteId?: string,
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResult> {
    try {
      const validation = await this.validateImage(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      onProgress?.(10);

      const dimensions = await this.getImageDimensions(file);
      onProgress?.(30);

      const id = uuidv4();
      const imageInfo: ImageInfo = {
        id,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        createdAt: Date.now(),
        noteId,
      };

      onProgress?.(50);

      const arrayBuffer = await file.arrayBuffer();
      onProgress?.(70);

      await imageStore.setItem(`info:${id}`, imageInfo);
      await imageStore.setItem(`data:${id}`, arrayBuffer);
      onProgress?.(90);

      const url = this.getImageUrl(id);
      onProgress?.(100);

      return {
        success: true,
        image: imageInfo,
        url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      };
    }
  },

  getImageUrl(id: string): string {
    return `imgstore://${id}`;
  },

  async getImageData(id: string): Promise<Blob | null> {
    const arrayBuffer = await imageStore.getItem<ArrayBuffer>(`data:${id}`);
    if (!arrayBuffer) return null;

    const info = await this.getImageInfo(id);
    if (!info) return null;

    return new Blob([arrayBuffer], { type: info.mimeType });
  },

  async getImageInfo(id: string): Promise<ImageInfo | null> {
    return imageStore.getItem<ImageInfo>(`info:${id}`);
  },

  async getAllImages(): Promise<ImageInfo[]> {
    const images: ImageInfo[] = [];
    await imageStore.iterate<ImageInfo, void>((value, key) => {
      if (key.startsWith('info:')) {
        images.push(value);
      }
    });
    return images.sort((a, b) => b.createdAt - a.createdAt);
  },

  async deleteImage(id: string): Promise<void> {
    await imageStore.removeItem(`info:${id}`);
    await imageStore.removeItem(`data:${id}`);
  },

  async deleteImagesByNoteId(noteId: string): Promise<void> {
    const images = await this.getAllImages();
    for (const image of images) {
      if (image.noteId === noteId) {
        await this.deleteImage(image.id);
      }
    }
  },

  async getImageCount(): Promise<number> {
    let count = 0;
    await imageStore.iterate<void, void>((_, key) => {
      if (key.startsWith('info:')) {
        count++;
      }
    });
    return count;
  },

  async getStorageSize(): Promise<number> {
    let size = 0;
    await imageStore.iterate<ArrayBuffer, void>((value, key) => {
      if (key.startsWith('data:')) {
        size += value.byteLength;
      }
    });
    return size;
  },

  async clearAllImages(): Promise<void> {
    await imageStore.clear();
  },
};
