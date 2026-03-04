import { describe, it, expect, beforeEach } from 'vitest';
import { useTagStore } from './tagStore';
import { TAG_COLORS } from '../types';

describe('tagStore', () => {
  beforeEach(() => {
    useTagStore.setState({ tags: [] });
  });

  describe('addTag', () => {
    it('should add a new tag', () => {
      const { addTag } = useTagStore.getState();
      const tag = addTag('Test Tag');

      expect(tag.name).toBe('Test Tag');
      expect(tag.id).toBeDefined();
      expect(tag.createdAt).toBeDefined();
      expect(useTagStore.getState().tags).toHaveLength(1);
    });

    it('should assign color from TAG_COLORS', () => {
      const { addTag } = useTagStore.getState();
      const tag = addTag('Tag 1');

      expect(TAG_COLORS).toContain(tag.color);
    });

    it('should cycle through colors', () => {
      const { addTag } = useTagStore.getState();

      const tag1 = addTag('Tag 1');
      const tag2 = addTag('Tag 2');

      const colorIndex1 = TAG_COLORS.indexOf(tag1.color as typeof TAG_COLORS[number]);
      const colorIndex2 = TAG_COLORS.indexOf(tag2.color as typeof TAG_COLORS[number]);

      expect(colorIndex2).toBe((colorIndex1 + 1) % TAG_COLORS.length);
    });

    it('should return existing tag if name already exists', () => {
      const { addTag } = useTagStore.getState();
      const tag1 = addTag('Duplicate');
      const tag2 = addTag('Duplicate');

      expect(tag1.id).toBe(tag2.id);
      expect(useTagStore.getState().tags).toHaveLength(1);
    });

    it('should be case-insensitive for duplicate check', () => {
      const { addTag } = useTagStore.getState();
      const tag1 = addTag('Test');
      const tag2 = addTag('TEST');

      expect(tag1.id).toBe(tag2.id);
      expect(useTagStore.getState().tags).toHaveLength(1);
    });

    it('should use provided color', () => {
      const { addTag } = useTagStore.getState();
      const tag = addTag('Custom Color', '#722ed1');

      expect(tag.color).toBe('#722ed1');
    });
  });

  describe('updateTag', () => {
    it('should update tag name', () => {
      const { addTag, updateTag } = useTagStore.getState();
      const tag = addTag('Original');
      updateTag(tag.id, { name: 'Updated' });

      const updatedTag = useTagStore.getState().tags.find((t) => t.id === tag.id);
      expect(updatedTag?.name).toBe('Updated');
    });

    it('should update tag color', () => {
      const { addTag, updateTag } = useTagStore.getState();
      const tag = addTag('Test');
      updateTag(tag.id, { color: '#faad14' });

      const updatedTag = useTagStore.getState().tags.find((t) => t.id === tag.id);
      expect(updatedTag?.color).toBe('#faad14');
    });
  });

  describe('deleteTag', () => {
    it('should delete tag by id', () => {
      const { addTag, deleteTag } = useTagStore.getState();
      const tag = addTag('To Delete');
      expect(useTagStore.getState().tags).toHaveLength(1);

      deleteTag(tag.id);
      expect(useTagStore.getState().tags).toHaveLength(0);
    });

    it('should not affect other tags', () => {
      const { addTag, deleteTag } = useTagStore.getState();
      const tag1 = addTag('Tag 1');
      const tag2 = addTag('Tag 2');

      deleteTag(tag1.id);
      expect(useTagStore.getState().tags).toHaveLength(1);
      expect(useTagStore.getState().tags[0].id).toBe(tag2.id);
    });
  });

  describe('getTagByName', () => {
    it('should find tag by name', () => {
      const { addTag, getTagByName } = useTagStore.getState();
      addTag('Find Me');

      const found = getTagByName('Find Me');
      expect(found?.name).toBe('Find Me');
    });

    it('should return undefined for non-existent tag', () => {
      const { getTagByName } = useTagStore.getState();
      const found = getTagByName('Non Existent');
      expect(found).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const { addTag, getTagByName } = useTagStore.getState();
      addTag('CaseTest');

      const found = getTagByName('casetest');
      expect(found?.name).toBe('CaseTest');
    });
  });

  describe('getTagById', () => {
    it('should find tag by id', () => {
      const { addTag, getTagById } = useTagStore.getState();
      const tag = addTag('Test');

      const found = getTagById(tag.id);
      expect(found?.name).toBe('Test');
    });

    it('should return undefined for non-existent id', () => {
      const { getTagById } = useTagStore.getState();
      const found = getTagById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('setTags', () => {
    it('should replace all tags', () => {
      const { setTags } = useTagStore.getState();
      const newTags = [
        { id: '1', name: 'Tag 1', color: '#f50', createdAt: Date.now() },
        { id: '2', name: 'Tag 2', color: '#2db7f5', createdAt: Date.now() },
      ];

      setTags(newTags);
      expect(useTagStore.getState().tags).toHaveLength(2);
      expect(useTagStore.getState().tags[0].name).toBe('Tag 1');
    });
  });
});
