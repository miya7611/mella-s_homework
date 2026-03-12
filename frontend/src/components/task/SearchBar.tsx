import { useState } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { TASK_STATUS, TASK_CATEGORIES } from '../../lib/constants';
import type { Priority } from '../../types/task';
import { cn } from '../../lib/utils';

export interface SearchParams {
  q: string;
  status: string[];
  priority: string[];
  category: string[];
  dateFrom: string;
  dateTo: string;
}

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  initialValues?: Partial<SearchParams>;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: '低优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'high', label: '高优先级' },
];

export function SearchBar({ onSearch, initialValues }: SearchBarProps) {
  const [query, setQuery] = useState(initialValues?.q || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(initialValues?.status || []);
  const [selectedPriority, setSelectedPriority] = useState<string[]>(initialValues?.priority || []);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(initialValues?.category || []);
  const [dateFrom, setDateFrom] = useState(initialValues?.dateFrom || '');
  const [dateTo, setDateTo] = useState(initialValues?.dateTo || '');

  const handleSearch = () => {
    onSearch({
      q: query,
      status: selectedStatus,
      priority: selectedPriority,
      category: selectedCategory,
      dateFrom,
      dateTo,
    });
  };

  const handleClear = () => {
    setQuery('');
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedCategory([]);
    setDateFrom('');
    setDateTo('');
    onSearch({
      q: '',
      status: [],
      priority: [],
      category: [],
      dateFrom: '',
      dateTo: '',
    });
  };

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const hasActiveFilters = selectedStatus.length > 0 || selectedPriority.length > 0 ||
    selectedCategory.length > 0 || dateFrom || dateTo;

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索任务标题或描述..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} size="default">
          搜索
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && 'border-primary text-primary')}
        >
          <Filter className="h-4 w-4 mr-1" />
          筛选
          {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border rounded-md p-4 bg-muted/30 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">状态</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TASK_STATUS).map(([value, { label }]) => (
                <button
                  key={value}
                  onClick={() => setSelectedStatus(toggleArrayItem(selectedStatus, value))}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs transition-colors',
                    selectedStatus.includes(value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">优先级</label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedPriority(toggleArrayItem(selectedPriority, value))}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs transition-colors',
                    selectedPriority.includes(value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">分类</label>
            <div className="flex flex-wrap gap-2">
              {TASK_CATEGORIES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(toggleArrayItem(selectedCategory, value))}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs transition-colors',
                    selectedCategory.includes(value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">日期范围</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-md bg-background text-sm"
                placeholder="开始日期"
              />
              <span className="self-center text-muted-foreground">至</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-md bg-background text-sm"
                placeholder="结束日期"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClear} className="w-full">
              清除所有筛选条件
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
