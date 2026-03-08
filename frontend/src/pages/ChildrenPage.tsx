import { useEffect, useState } from 'react';
import { useChildrenStore } from '../stores';
import { ChildForm, ChildCard } from '../components/child';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export function ChildrenPage() {
  const { children, isLoading, fetchChildren } = useChildrenStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleCreateSuccess = () => {
    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">孩子管理</h2>
          <p className="text-sm text-muted-foreground">
            管理孩子的账号，为他们创建任务
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            添加孩子
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">创建孩子账号</CardTitle>
          </CardHeader>
          <CardContent>
            <ChildForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          我的孩子 ({children.length})
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                还没有添加孩子账号
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                点击上方"添加孩子"按钮创建
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
