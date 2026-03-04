import { Empty, Select, Button, Tag as AntTag } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, TagsOutlined } from '@ant-design/icons';
import { useNoteStore, useUIStore, useSettingStore, useTagStore, useFolderStore } from '../../../store';
import { storageService } from '../../../services';
import { NoteCard } from '../../business/NoteCard';
import { AdvancedSearch } from '../../business/AdvancedSearch';
import { FolderList } from '../../business/FolderList';
import { sortNotes, sortOptionLabels, type SortDirection } from '../../../utils';
import type { SortOption } from '../../../types';
import { DEFAULT_FOLDER_ID } from '../../../types';
import styles from './styles.module.css';

export const Sidebar = () => {
  const { notes, currentNoteId, setCurrentNote, deleteNote } = useNoteStore();
  const { appState, setSelectedTag } = useUIStore();
  const { settings, updateSettings } = useSettingStore();
  const { tags } = useTagStore();
  const { selectedFolderId } = useFolderStore();

  const filteredNotes = notes.filter((note) => {
    const query = appState.searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query);

    const selectedTags = appState.selectedTags.length > 0 ? appState.selectedTags : 
      (appState.selectedTag ? [appState.selectedTag] : []);
    
    const matchesTags =
      selectedTags.length === 0 ||
      (note.tags && selectedTags.some((tag) => note.tags!.includes(tag)));

    const matchesDateRange =
      (!appState.dateRange.start || note.updatedAt >= appState.dateRange.start) &&
      (!appState.dateRange.end || note.updatedAt <= appState.dateRange.end);

    const matchesFolder =
      !selectedFolderId ||
      selectedFolderId === DEFAULT_FOLDER_ID ||
      note.folderId === selectedFolderId;

    return matchesQuery && matchesTags && matchesDateRange && matchesFolder;
  });

  const sortedNotes = sortNotes(filteredNotes, {
    option: settings.defaultSort,
    direction: settings.sortDirection,
  });

  const handleDelete = async (noteId: string) => {
    deleteNote(noteId);
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    await storageService.saveNotes(updatedNotes);
  };

  const handleSortChange = (value: SortOption) => {
    updateSettings({ defaultSort: value });
  };

  const handleSortDirectionChange = () => {
    const newDirection: SortDirection = settings.sortDirection === 'asc' ? 'desc' : 'asc';
    updateSettings({ sortDirection: newDirection });
  };

  const handleTagClick = (tagName: string) => {
    if (appState.selectedTag === tagName) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tagName);
    }
  };

  const sortOptions = Object.entries(sortOptionLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const getTagColor = (tagName: string): string => {
    const tag = tags.find((t) => t.name === tagName);
    return tag?.color || '#f50';
  };

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  return (
    <aside className={styles.sidebar}>
      <FolderList />
      <AdvancedSearch />
      {allTags.length > 0 && (
        <div className={styles.tagsSection}>
          <div className={styles.tagsHeader}>
            <TagsOutlined className={styles.tagsIcon} />
            <span>标签筛选</span>
            {appState.selectedTag && (
              <Button
                type="link"
                size="small"
                onClick={() => setSelectedTag(null)}
                className={styles.clearTagBtn}
              >
                清除
              </Button>
            )}
          </div>
          <div className={styles.tagsList}>
            {allTags.map((tagName) => (
              <AntTag
                key={tagName}
                color={getTagColor(tagName)}
                className={`${styles.filterTag} ${appState.selectedTag === tagName ? styles.activeTag : ''}`}
                onClick={() => handleTagClick(tagName)}
              >
                {tagName}
              </AntTag>
            ))}
          </div>
        </div>
      )}
      <div className={styles.toolbar}>
        <Select
          value={settings.defaultSort}
          onChange={handleSortChange}
          options={sortOptions}
          className={styles.sortSelect}
          size="small"
        />
        <Button
          type="text"
          size="small"
          icon={settings.sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
          onClick={handleSortDirectionChange}
          className={styles.sortDirectionBtn}
          title={settings.sortDirection === 'asc' ? '升序' : '降序'}
        />
      </div>
      <div className={styles.list}>
        {sortedNotes.length === 0 ? (
          <Empty description="暂无笔记" className={styles.empty} />
        ) : (
          sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={currentNoteId === note.id}
              onClick={() => setCurrentNote(note.id)}
              onDelete={() => handleDelete(note.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
};
