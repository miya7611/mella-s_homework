import { useEffect, useState, useMemo } from 'react';
import { useTaskStore, useAuthStore } from '../stores';
import { TaskList } from '../components/task';
import { SearchBar } from '../components/task/SearchBar';
import type { SearchParams } from '../components/task/SearchBar';
import type { TaskStatus, Task } from '../types/task';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../api/task.api';

type FilterTab = 'all' | 'pending' | 'in_progress' | 'completed';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待完成' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

export function TasksPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, isLoading, fetchTasks, updateTaskStatus } = useTaskStore();

  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Task[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user && !searchResults) {
      fetchTasks({ userId: user.id, date: dateFilter });
    }
  }, [user, dateFilter, fetchTasks, searchResults]);

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
    // Refresh search results if in search mode
    if (searchResults) {
      // Re-trigger search
    }
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleSearch = async (params: SearchParams) => {
    if (!user) return;

    // If no search criteria, exit search mode
    if (!params.q && params.status.length === 0 && params.priority.length === 0 &&
        params.category.length === 0 && !params.dateFrom && !params.dateTo) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const result = await taskApi.searchTasks({
        q: params.q || undefined,
        status: params.status.length > 0 ? params.status : undefined,
        priority: params.priority.length > 0 ? params.priority : undefined,
        category: params.category.length > 0 ? params.category : undefined,
        dateFrom: params.dateFrom || undefined,
        dateTo: params.dateTo || undefined,
        userId: user.id,
      });
      setSearchResults(result.tasks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setShowSearch(false);
  };

  const isParent = user?.role === 'parent';

  // Use search results if available, otherwise use regular tasks
  const displayTasks = searchResults !== null ? searchResults : tasks;

  // Filter tasks by status tab
  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') {
      return displayTasks;
    }
    if (activeTab === 'pending') {
      return displayTasks.filter((t) => t.status === 'pending' || t.status === 'planned');
    }
    return displayTasks.filter((t) => t.status === activeTab);
  }, [displayTasks, activeTab]);

  // Count tasks by status
  const taskCounts = useMemo(() => {
    const counts = {
      all: displayTasks.length,
      pending: displayTasks.filter((t) => t.status === 'pending' || t.status === 'planned').length,
      in_progress: displayTasks.filter((t) => t.status === 'in_progress').length,
      completed: displayTasks.filter((t) => t.status === 'completed').length,
    };
    return counts;
  }, [displayTasks]);

  return (
    <div className="p-4 pb-20">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {searchResults !== null ? '搜索结果' : '我的任务'}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? '隐藏搜索' : '搜索'}
          </Button>
          {isParent && (
            <Button onClick={() => navigate('/tasks/create')} size="sm">
              创建任务
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-4">
          <SearchBar onSearch={handleSearch} />
          {searchResults !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="mt-2"
            >
              清除搜索，返回任务列表
            </Button>
          )}
        </div>
      )}

      {/* Date Filter (only when not in search mode) */}
      {searchResults === null && (
        <div className="mb-4">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
          />
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs ${
                activeTab === tab.value
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground/70'
              }`}
            >
              ({taskCounts[tab.value]})
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 && !isLoading && !isSearching ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            {searchResults !== null
              ? '没有找到匹配的任务'
              : activeTab === 'all'
                ? '今天没有任务'
                : activeTab === 'pending'
                  ? '没有待完成的任务'
                  : activeTab === 'in_progress'
                    ? '没有进行中的任务'
                    : '没有已完成的任务'}
          </p>
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading || isSearching}
          onTaskClick={handleTaskClick}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
