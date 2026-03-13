import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Clock, Check, X } from 'lucide-react';
import { useNotificationSettingsStore } from '../stores/notificationSettingsStore';
import { browserNotificationService } from '../services/browserNotificationService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const REMINDER_OPTIONS = [
  { value: 5, label: '5分钟前' },
  { value: 15, label: '15分钟前' },
  { value: 30, label: '30分钟前' },
  { value: 60, label: '1小时前' },
  { value: 120, label: '2小时前' },
  { value: 1440, label: '1天前' },
];

export function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { settings, permissionGranted, updateSettings, setPermissionGranted } = useNotificationSettingsStore();
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check permission status on mount
    const status = browserNotificationService.getPermissionStatus();
    setPermissionGranted(status === 'granted');
  }, [setPermissionGranted]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await browserNotificationService.requestPermission();
      setPermissionGranted(granted);

      if (granted) {
        // Show test notification
        browserNotificationService.show('通知已启用', {
          body: '您将收到任务提醒通知',
        });
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const isSupported = browserNotificationService.isSupported();

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">通知设置</h2>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {!isSupported ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">您的浏览器不支持通知功能</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Permission Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {permissionGranted ? (
                    <Bell className="h-5 w-5 text-green-500" />
                  ) : (
                    <BellOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">浏览器通知</p>
                    <p className="text-sm text-muted-foreground">
                      {permissionGranted ? '已启用' : '未启用'}
                    </p>
                  </div>
                </div>
                {!permissionGranted && (
                  <Button
                    onClick={handleRequestPermission}
                    disabled={isRequesting}
                    size="sm"
                  >
                    {isRequesting ? '请求中...' : '启用通知'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">启用通知</p>
                  <p className="text-sm text-muted-foreground">总开关</p>
                </div>
                <button
                  onClick={() => handleToggle('enabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Reminder Time Setting */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <p className="font-medium">任务到期提醒时间</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {REMINDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ taskDueReminderMinutes: option.value })}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      settings.taskDueReminderMinutes === option.value
                        ? 'bg-primary text-white'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="font-medium">通知类型</p>

              <div className="space-y-3">
                <NotificationToggle
                  label="任务到期提醒"
                  description="任务即将到期时提醒"
                  checked={settings.taskDueReminder}
                  onChange={() => handleToggle('taskDueReminder')}
                  icon={<Clock className="h-4 w-4 text-orange-500" />}
                />

                <NotificationToggle
                  label="任务超时提醒"
                  description="任务已超过截止时间"
                  checked={settings.taskOverdue}
                  onChange={() => handleToggle('taskOverdue')}
                  icon={<X className="h-4 w-4 text-red-500" />}
                />

                <NotificationToggle
                  label="新任务分配"
                  description="有新任务分配给您"
                  checked={settings.taskAssigned}
                  onChange={() => handleToggle('taskAssigned')}
                  icon={<Bell className="h-4 w-4 text-purple-500" />}
                />

                <NotificationToggle
                  label="任务审核通过"
                  description="任务审核通过时通知"
                  checked={settings.taskCompleted}
                  onChange={() => handleToggle('taskCompleted')}
                  icon={<Check className="h-4 w-4 text-green-500" />}
                />

                <NotificationToggle
                  label="积分获得"
                  description="获得积分时通知"
                  checked={settings.pointsEarned}
                  onChange={() => handleToggle('pointsEarned')}
                  icon={<span className="text-yellow-500">⭐</span>}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Notification */}
          {permissionGranted && settings.enabled && (
            <Card>
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    browserNotificationService.show('测试通知', {
                      body: '这是一条测试通知消息',
                    });
                  }}
                >
                  发送测试通知
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
}

function NotificationToggle({ label, description, checked, onChange, icon }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
