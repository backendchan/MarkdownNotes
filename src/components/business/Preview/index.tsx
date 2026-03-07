import { useMemo, forwardRef, useEffect, useCallback, useRef } from 'react';
import { useNoteStore, useSettingStore } from '../../../store';
import { renderMarkdown } from '../../../services/markdown';
import { imageService } from '../../../services/image';
import styles from './styles.module.css';

interface PreviewProps {
  noteId: string;
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ noteId }, ref) => {
  const { notes } = useNoteStore();
  const { settings } = useSettingStore();
  const note = notes.find((n) => n.id === noteId);
  const contentRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    if (!note) return '';
    return renderMarkdown(note.content);
  }, [note]);

  const loadImage = useCallback(async (img: HTMLImageElement, imageId: string) => {
    try {
      const blob = await imageService.getImageData(imageId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        img.src = url;
        img.dataset.loaded = 'true';
      } else {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E图片丢失%3C/text%3E%3C/svg%3E';
      }
    } catch {
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E加载失败%3C/text%3E%3C/svg%3E';
    }
  }, []);

  const applyImageSize = useCallback((img: HTMLImageElement) => {
    const widthAttr = img.getAttribute('width');
    const heightAttr = img.getAttribute('height');
    const widthPercent = img.getAttribute('data-width-percent');
    const heightPercent = img.getAttribute('data-height-percent');
    
    if (widthPercent) {
      img.style.width = `${widthPercent}%`;
      img.style.height = 'auto';
    } else if (widthAttr) {
      const width = parseInt(widthAttr, 10);
      if (!isNaN(width)) {
        img.style.maxWidth = `${width}px`;
        img.style.width = '100%';
        img.style.height = 'auto';
      }
    }
    
    if (heightPercent) {
      img.style.height = `${heightPercent}%`;
    } else if (heightAttr && !widthPercent && !widthAttr) {
      const height = parseInt(heightAttr, 10);
      if (!isNaN(height)) {
        img.style.height = `${height}px`;
        img.style.width = 'auto';
      }
    }
  }, []);

  const processImages = useCallback(() => {
    if (!contentRef.current) return;

    const images = contentRef.current.querySelectorAll<HTMLImageElement>('img[data-src^="imgstore://"]');
    
    images.forEach((img) => {
      const dataSrc = img.getAttribute('data-src');
      if (!dataSrc) return;

      const imageId = dataSrc.replace('imgstore://', '').replace(/\s*=\s*.+$/, '');
      
      applyImageSize(img);

      if (!img.dataset.loaded) {
        loadImage(img, imageId);
      }
    });
    
    const normalImages = contentRef.current.querySelectorAll<HTMLImageElement>('img:not([data-src])');
    normalImages.forEach((img) => {
      applyImageSize(img);
    });
  }, [loadImage, applyImageSize]);

  useEffect(() => {
    processImages();
  }, [htmlContent, processImages]);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new MutationObserver(() => {
      processImages();
    });

    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [processImages]);

  useEffect(() => {
    return () => {
      if (!contentRef.current) return;
      const images = contentRef.current.querySelectorAll<HTMLImageElement>('img');
      images.forEach((img) => {
        if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
        }
      });
    };
  }, []);

  if (!note) {
    return (
      <div className={styles.empty}>
        <p>预览区域</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={styles.preview}
      style={{
        fontSize: settings.previewFontSize,
      }}
    >
      <div
        ref={contentRef}
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
});

Preview.displayName = 'Preview';
