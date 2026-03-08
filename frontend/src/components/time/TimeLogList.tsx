import { Clock, Trash2 } from 'lucide-react';
import type { TimeLog } from '../../types/time';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface TimeLogListProps {
  timeLogs: TimeLog[];
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

export function TimeLogList({ timeLogs, onDelete, showDelete = false }: TimeLogListProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} 分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (timeLogs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">暂无时间记录</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {timeLogs.map((log) => (
        <Card key={log.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    log.is_overtime ? 'bg-destructive/10' : 'bg-green-100'
                  }`}
                >
                  <Clock
                    className={`h-4 w-4 ${
                      log.is_overtime ? 'text-destructive' : 'text-green-600'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium">{formatDuration(log.duration)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(log.start_time)}
                    {log.end_time && ` - ${formatDateTime(log.end_time)}`}
                  </p>
                  {log.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {log.is_overtime && (
                  <span className="text-xs text-destructive font-medium">超时</span>
                )}
                {showDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(log.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
