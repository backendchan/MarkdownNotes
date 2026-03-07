import { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, Space, message, Popconfirm, Typography, Card, Empty } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { imageService } from '../../services';
import { Layout } from '../../components';
import type { ImageInfo } from '../../types';
import styles from './styles.module.css';

const { Text } = Typography;

const ImageThumbnail = ({ imageId, onClick }: { imageId: string; onClick: () => void }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const loadThumbnail = async () => {
      const blob = await imageService.getImageData(imageId);
      if (blob && mounted) {
        const url = URL.createObjectURL(blob);
        setThumbnailUrl(url);
      }
    };
    loadThumbnail();
    return () => {
      mounted = false;
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [imageId]);

  if (!thumbnailUrl) {
    return <div className={styles.previewThumb} />;
  }

  return (
    <img
      src={thumbnailUrl}
      alt="thumbnail"
      className={styles.previewThumb}
      onClick={onClick}
    />
  );
};

export const ImageManagerPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const imageList = await imageService.getAllImages();
      setImages(imageList);
    } catch (error) {
      console.error('Failed to load images:', error);
      message.error('加载图片失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await imageService.deleteImage(id);
      message.success('图片已删除');
      loadImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      message.error('删除失败');
    }
  }, [loadImages]);

  const handleBatchDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的图片');
      return;
    }

    try {
      for (const key of selectedRowKeys) {
        await imageService.deleteImage(key as string);
      }
      message.success(`已删除 ${selectedRowKeys.length} 张图片`);
      setSelectedRowKeys([]);
      loadImages();
    } catch (error) {
      console.error('Failed to delete images:', error);
      message.error('批量删除失败');
    }
  }, [selectedRowKeys, loadImages]);

  const handleClearAll = useCallback(async () => {
    try {
      await imageService.clearAllImages();
      message.success('已清空所有图片');
      loadImages();
    } catch (error) {
      console.error('Failed to clear images:', error);
      message.error('清空失败');
    }
  }, [loadImages]);

  const handlePreview = useCallback(async (image: ImageInfo) => {
    const blob = await imageService.getImageData(image.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPreviewImage(url);
      setPreviewVisible(true);
    }
  }, []);

  const handleCopyMarkdown = useCallback((image: ImageInfo) => {
    const markdown = `![${image.filename}](imgstore://${image.id})`;
    navigator.clipboard.writeText(markdown);
    message.success('已复制到剪贴板');
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const columns = [
    {
      title: '预览',
      dataIndex: 'id',
      key: 'preview',
      width: 80,
      render: (id: string, record: ImageInfo) => (
        <ImageThumbnail
          imageId={id}
          onClick={() => handlePreview(record)}
        />
      ),
    },
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
      render: (filename: string) => <Text ellipsis title={filename}>{filename}</Text>,
    },
    {
      title: '尺寸',
      key: 'dimensions',
      width: 120,
      render: (_: unknown, record: ImageInfo) => 
        record.width && record.height ? `${record.width} × ${record.height}` : '-',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: number) => formatDate(createdAt),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: ImageInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyMarkdown(record)}
          >
            复制
          </Button>
          <Popconfirm
            title="确定删除此图片？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const totalSize = images.reduce((sum, img) => sum + img.size, 0);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回
          </Button>
          <h2 className={styles.title}>图片管理</h2>
          <div className={styles.stats}>
            <span>共 {images.length} 张图片</span>
            <span>占用空间: {formatFileSize(totalSize)}</span>
          </div>
        </div>

        <Card className={styles.content}>
          <div className={styles.toolbar}>
            <Space>
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 张图片？`}
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
                disabled={selectedRowKeys.length === 0}
              >
                <Button
                  danger
                  disabled={selectedRowKeys.length === 0}
                >
                  删除选中 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定清空所有图片？此操作不可恢复！"
                onConfirm={handleClearAll}
                okText="确定"
                cancelText="取消"
                disabled={images.length === 0}
              >
                <Button danger disabled={images.length === 0}>
                  清空全部
                </Button>
              </Popconfirm>
            </Space>
            <Button onClick={loadImages}>刷新</Button>
          </div>

          {images.length === 0 && !loading ? (
            <Empty
              description="暂无图片"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={images}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 张`,
              }}
            />
          )}
        </Card>

        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => {
            setPreviewVisible(false);
            if (previewImage) {
              URL.revokeObjectURL(previewImage);
            }
            setPreviewImage('');
          }}
          width="auto"
          centered
        >
          <img src={previewImage} alt="preview" style={{ maxWidth: '90vw', maxHeight: '80vh' }} />
        </Modal>
      </div>
    </Layout>
  );
};
