import { useCallback } from 'react';
import { Input, Select, DatePicker, Button, Tag, Collapse } from 'antd';
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';
import { useUIStore, useTagStore } from '../../../store';
import type { DateRange } from '../../../types';
import dayjs from 'dayjs';
import styles from './styles.module.css';

const { RangePicker } = DatePicker;

export const AdvancedSearch = () => {
  const {
    appState,
    setSearchQuery,
    setSelectedTags,
    setDateRange,
    clearSearchFilters,
  } = useUIStore();
  const { tags } = useTagStore();

  const handleTagsChange = useCallback(
    (selectedTags: string[]) => {
      setSelectedTags(selectedTags);
    },
    [setSelectedTags]
  );

  const handleDateChange = useCallback(
    (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        const range: DateRange = {
          start: dates[0].startOf('day').valueOf(),
          end: dates[1].endOf('day').valueOf(),
        };
        setDateRange(range);
      } else {
        setDateRange({ start: null, end: null });
      }
    },
    [setDateRange]
  );

  const handleClear = useCallback(() => {
    clearSearchFilters();
  }, [clearSearchFilters]);

  const tagOptions = tags.map((tag) => ({
    value: tag.name,
    label: (
      <span>
        <Tag color={tag.color} style={{ marginRight: 4 }}>
          {tag.name}
        </Tag>
      </span>
    ),
  }));

  const hasActiveFilters =
    appState.searchQuery ||
    appState.selectedTags.length > 0 ||
    appState.dateRange.start ||
    appState.dateRange.end;

  const dateValue: [dayjs.Dayjs, dayjs.Dayjs] | null =
    appState.dateRange.start && appState.dateRange.end
      ? [
          dayjs(appState.dateRange.start),
          dayjs(appState.dateRange.end),
        ]
      : null;

  const collapseItems = [
    {
      key: 'filters',
      label: (
        <div className={styles.collapseHeader}>
          <FilterOutlined />
          <span>高级筛选</span>
          {hasActiveFilters && (
            <span className={styles.filterCount}>
              {[
                appState.searchQuery && 1,
                appState.selectedTags.length > 0 && appState.selectedTags.length,
                (appState.dateRange.start || appState.dateRange.end) && 1,
              ].filter(Boolean).length}
            </span>
          )}
        </div>
      ),
      children: (
        <div className={styles.filtersContent}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>关键词</label>
            <Input
              placeholder="搜索标题或内容..."
              prefix={<SearchOutlined />}
              value={appState.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>标签</label>
            <Select
              mode="multiple"
              placeholder="选择标签..."
              value={appState.selectedTags}
              onChange={handleTagsChange}
              options={tagOptions}
              allowClear
              className={styles.tagSelect}
              maxTagCount="responsive"
            />
          </div>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>时间范围</label>
            <RangePicker
              value={dateValue}
              onChange={handleDateChange}
              className={styles.datePicker}
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
            />
          </div>
          {hasActiveFilters && (
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={handleClear}
              className={styles.clearBtn}
            >
              清除所有筛选
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Collapse
        items={collapseItems}
        defaultActiveKey={appState.isAdvancedSearch ? ['filters'] : []}
        ghost
        className={styles.collapse}
      />
    </div>
  );
};
