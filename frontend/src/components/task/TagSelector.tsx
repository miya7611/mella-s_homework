import { useState, useEffect } from 'react';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { tagsApi } from '../../api/tags.api';
import type { Tag } from '../../types/tag';
import { cn } from '../../lib/utils';

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await tagsApi.getTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleTagToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const tag = await tagsApi.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      setTags([...tags, tag]);
      onChange([...selectedTagIds, tag.id]);
      setNewTagName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">标签</label>

      {/* Selected tags display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-dashed border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="h-3 w-3" />
          添加标签
        </button>
      </div>

      {/* Tag dropdown */}
      {isOpen && (
        <div className="border rounded-md p-3 bg-background">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all',
                  selectedTagIds.includes(tag.id)
                    ? 'ring-2 ring-offset-1'
                    : 'opacity-70 hover:opacity-100'
                )}
                style={{
                  backgroundColor: tag.color,
                  color: 'white',
                  ['--tw-ring-color' as string]: tag.color,
                }}
              >
                <TagIcon className="h-3 w-3" />
                {tag.name}
              </button>
            ))}
          </div>

          {/* Create new tag */}
          {showCreateForm ? (
            <div className="space-y-2 pt-2 border-t">
              <input
                type="text"
                placeholder="标签名称"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                autoFocus
              />
              <div className="flex gap-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      'w-6 h-6 rounded-full',
                      newTagColor === color && 'ring-2 ring-offset-1'
                    )}
                    style={{ backgroundColor: color, ['--tw-ring-color' as string]: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="flex-1 bg-primary text-primary-foreground rounded-md py-1.5 text-sm hover:bg-primary/90"
                >
                  创建
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTagName('');
                  }}
                  className="flex-1 border rounded-md py-1.5 text-sm hover:bg-accent"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary py-1"
            >
              <Plus className="h-4 w-4" />
              创建新标签
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-2 text-sm text-muted-foreground hover:text-primary"
          >
            完成
          </button>
        </div>
      )}
    </div>
  );
}
