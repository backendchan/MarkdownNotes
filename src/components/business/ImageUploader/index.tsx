import { useState, useRef, useCallback } from 'react';
import { Modal, Progress, Button, Slider, message } from 'antd';
import { UploadOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { imageService } from '../../../services';
import type { ImageSize, ImageInfo } from '../../../types';
import { IMAGE_SIZE_OPTIONS } from '../../../types';
import styles from './styles.module.css';

interface ImageUploaderProps {
  open: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
  noteId?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const ImageUploader = ({
  open,
  onClose,
  onInsert,
  noteId,
}: ImageUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ImageInfo | null>(null);
  const [selectedSize, setSelectedSize] = useState<ImageSize>('medium');
  const [customWidth, setCustomWidth] = useState(600);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setUploadedImage(null);
    setSelectedSize('medium');
    setCustomWidth(600);
    setDimensions(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    const validation = await imageService.validateImage(file);
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }

    setSelectedFile(file);
    setStatus('idle');
    setError(null);
    setUploadedImage(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const dims = await imageService.getImageDimensions(file);
      setDimensions(dims);
    } catch {
      message.error('无法读取图片尺寸');
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setProgress(0);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const result = await imageService.uploadImage(
        selectedFile,
        noteId,
        (p) => {
          setProgress(p);
        }
      );

      if (result.success && result.image) {
        setStatus('success');
        setUploadedImage(result.image);
        message.success('图片上传成功');
      } else {
        setStatus('error');
        setError(result.error || '上传失败');
        message.error(result.error || '上传失败');
      }
    } catch (err) {
      setStatus('error');
      const errorMsg = err instanceof Error ? err.message : '上传失败';
      setError(errorMsg);
      message.error(errorMsg);
    }
  }, [selectedFile, noteId]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetState();
  }, [resetState]);

  const handleInsert = useCallback(() => {
    if (!uploadedImage) return;

    const sizeOption = IMAGE_SIZE_OPTIONS.find((opt) => opt.value === selectedSize);
    const width = selectedSize === 'custom' ? customWidth : sizeOption?.width || 600;

    const markdown = `![${uploadedImage.filename}](${imageService.getImageUrl(uploadedImage.id)} =${width}x)`;
    onInsert(markdown);
    onClose();
    resetState();
  }, [uploadedImage, selectedSize, customWidth, onInsert, onClose, resetState]);

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setError(null);
    setUploadedImage(null);
    setDimensions(null);
  }, [previewUrl]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleModalClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  return (
    <Modal
      title="上传图片"
      open={open}
      onCancel={handleModalClose}
      footer={null}
      width={600}
      centered
      destroyOnHidden
    >
      <div className={styles.uploader}>
        {!selectedFile ? (
          <div
            className={styles.dropZone}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadOutlined className={styles.uploadIcon} />
            <p className={styles.dropText}>点击或拖拽图片到此处上传</p>
            <p className={styles.dropHint}>
              支持 JPG、PNG、WEBP、GIF 格式，最大 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleInputChange}
              className={styles.hiddenInput}
            />
          </div>
        ) : (
          <div className={styles.previewSection}>
            <div className={styles.previewContainer}>
              <img src={previewUrl!} alt="预览" className={styles.previewImage} />
              <button
                className={styles.removeButton}
                onClick={handleRemove}
                type="button"
                disabled={status === 'uploading'}
              >
                <DeleteOutlined />
              </button>
            </div>

            <div className={styles.fileInfo}>
              <p>
                <strong>文件名:</strong> {selectedFile.name}
              </p>
              <p>
                <strong>大小:</strong> {formatFileSize(selectedFile.size)}
              </p>
              {dimensions && (
                <p>
                  <strong>尺寸:</strong> {dimensions.width} x {dimensions.height} px
                </p>
              )}
            </div>

            {status === 'idle' && (
              <div className={styles.sizeSelector}>
                <p className={styles.sizeLabel}>选择显示尺寸:</p>
                <div className={styles.sizeOptions}>
                  {IMAGE_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`${styles.sizeButton} ${
                        selectedSize === option.value ? styles.sizeButtonActive : ''
                      }`}
                      onClick={() => setSelectedSize(option.value)}
                      type="button"
                    >
                      {option.label} ({option.width}px)
                    </button>
                  ))}
                  <button
                    className={`${styles.sizeButton} ${
                      selectedSize === 'custom' ? styles.sizeButtonActive : ''
                    }`}
                    onClick={() => setSelectedSize('custom')}
                    type="button"
                  >
                    自定义
                  </button>
                </div>
                {selectedSize === 'custom' && (
                  <div className={styles.customSize}>
                    <span>宽度: {customWidth}px</span>
                    <Slider
                      min={100}
                      max={1200}
                      value={customWidth}
                      onChange={setCustomWidth}
                      className={styles.widthSlider}
                    />
                  </div>
                )}
              </div>
            )}

            {status === 'uploading' && (
              <div className={styles.progressSection}>
                <Progress percent={progress} status="active" />
                <p className={styles.progressText}>正在上传...</p>
              </div>
            )}

            {status === 'success' && (
              <div className={styles.successSection}>
                <CheckOutlined className={styles.successIcon} />
                <p>上传成功!</p>
              </div>
            )}

            {status === 'error' && (
              <div className={styles.errorSection}>
                <p className={styles.errorText}>{error}</p>
              </div>
            )}

            <div className={styles.actions}>
              {status === 'idle' && (
                <>
                  <Button onClick={handleRemove}>取消</Button>
                  <Button type="primary" onClick={handleUpload}>
                    上传
                  </Button>
                </>
              )}
              {status === 'uploading' && (
                <Button danger onClick={handleCancel}>
                  取消上传
                </Button>
              )}
              {status === 'success' && (
                <>
                  <Button onClick={handleRemove}>重新选择</Button>
                  <Button type="primary" onClick={handleInsert}>
                    插入笔记
                  </Button>
                </>
              )}
              {status === 'error' && (
                <>
                  <Button onClick={handleRemove}>重新选择</Button>
                  <Button type="primary" onClick={handleUpload}>
                    重试
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
