import { Layout, Header } from '../../components';
import { useNoteStore, useSettingStore, useTagStore, useFolderStore } from '../../store';
import { Select, InputNumber, Switch, Button, Upload, message, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { exportImportService, storageService } from '../../services';
import { generateId } from '../../utils';
import type { UploadProps } from 'antd';
import styles from './styles.module.css';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingStore();
  const { notes, setNotes } = useNoteStore();
  const { tags, setTags } = useTagStore();
  const { folders, setFolders } = useFolderStore();

  const handleExportAll = () => {
    if (notes.length === 0) {
      message.warning('没有可导出的笔记');
      return;
    }
    exportImportService.exportAllNotes(notes, tags, folders);
    message.success(`已导出 ${notes.length} 篇笔记`);
  };

  const handleImportBackup: UploadProps['customRequest'] = async (options) => {
    const { file } = options;
    try {
      const data = await exportImportService.importBackupFile(file as File);
      const importedNotes = data.notes.map((note) => ({
        ...note,
        id: generateId(),
        createdAt: note.createdAt || Date.now(),
        updatedAt: note.updatedAt || Date.now(),
      }));
      const mergedNotes = [...importedNotes, ...notes];
      setNotes(mergedNotes);
      await storageService.saveNotes(mergedNotes);

      if (data.tags && data.tags.length > 0) {
        const importedTags = data.tags.map((tag) => ({
          ...tag,
          id: generateId(),
        }));
        const mergedTags = [...importedTags, ...tags];
        setTags(mergedTags);
        await storageService.saveTags(mergedTags);
      }

      if (data.folders && data.folders.length > 0) {
        const importedFolders = data.folders.map((folder) => ({
          ...folder,
          id: generateId(),
        }));
        const mergedFolders = [...importedFolders, ...folders];
        setFolders(mergedFolders);
        await storageService.saveFolders(mergedFolders);
      }

      message.success(`已导入 ${importedNotes.length} 篇笔记`);
    } catch {
      message.error('导入失败，请检查文件格式');
    }
  };

  const handleImportMarkdown: UploadProps['customRequest'] = async (options) => {
    const { file } = options;
    try {
      const noteData = await exportImportService.importMarkdownFile(file as File);
      const newNote = {
        id: generateId(),
        title: noteData.title || '',
        content: noteData.content || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const mergedNotes = [newNote, ...notes];
      setNotes(mergedNotes);
      await storageService.saveNotes(mergedNotes);
      message.success('已导入 Markdown 文件');
    } catch {
      message.error('导入失败，请检查文件格式');
    }
  };

  const handleClearAll = async () => {
    setNotes([]);
    await storageService.clearAll();
    message.success('已清除所有数据');
  };

  return (
    <Layout>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>设置</h1>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
        <div className={styles.section}>
          <h2>外观</h2>
          <div className={styles.item}>
            <label>主题</label>
            <Select
              value={settings.theme}
              onChange={(value) => updateSettings({ theme: value })}
              options={[
                { value: 'light', label: '浅色' },
                { value: 'dark', label: '深色' },
                { value: 'system', label: '跟随系统' },
              ]}
              style={{ width: 200 }}
            />
          </div>
        </div>
        <div className={styles.section}>
          <h2>编辑器</h2>
          <div className={styles.item}>
            <label>字号</label>
            <InputNumber
              value={settings.editorFontSize}
              onChange={(value) => updateSettings({ editorFontSize: value || 14 })}
              min={12}
              max={24}
            />
          </div>
          <div className={styles.item}>
            <label>显示行号</label>
            <Switch
              checked={settings.showLineNumbers}
              onChange={(checked) => updateSettings({ showLineNumbers: checked })}
            />
          </div>
        </div>
        <div className={styles.section}>
          <h2>预览</h2>
          <div className={styles.item}>
            <label>字号</label>
            <InputNumber
              value={settings.previewFontSize}
              onChange={(value) => updateSettings({ previewFontSize: value || 16 })}
              min={12}
              max={24}
            />
          </div>
          <div className={styles.item}>
            <label>同步滚动</label>
            <Switch
              checked={settings.syncScroll}
              onChange={(checked) => updateSettings({ syncScroll: checked })}
            />
          </div>
        </div>
        <div className={styles.section}>
          <h2>数据管理</h2>
          <div className={styles.item}>
            <label>导出所有笔记</label>
            <Button onClick={handleExportAll}>导出备份</Button>
          </div>
          <div className={styles.item}>
            <label>导入备份文件</label>
            <Upload
              accept=".json"
              showUploadList={false}
              customRequest={handleImportBackup}
            >
              <Button>导入备份</Button>
            </Upload>
          </div>
          <div className={styles.item}>
            <label>导入 Markdown 文件</label>
            <Upload
              accept=".md,.markdown"
              showUploadList={false}
              customRequest={handleImportMarkdown}
            >
              <Button>导入 Markdown</Button>
            </Upload>
          </div>
          <div className={styles.item}>
            <label>清除所有数据</label>
            <Popconfirm
              title="确认清除"
              description="确定要清除所有数据吗？此操作不可恢复！"
              onConfirm={handleClearAll}
              okText="清除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button danger>清除数据</Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </Layout>
  );
};
