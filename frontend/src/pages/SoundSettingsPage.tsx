import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Play } from 'lucide-react';
import { useSoundSettingsStore } from '../stores/soundSettingsStore';
import { soundService } from '../services/soundService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function SoundSettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSoundSettingsStore();

  // Sync sound service with store
  useEffect(() => {
    soundService.setEnabled(settings.enabled);
    soundService.setVolume(settings.volume);
    // Resume audio context on user interaction
    soundService.resume();
  }, [settings.enabled, settings.volume]);

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ volume: parseFloat(e.target.value) });
  };

  const playTestSound = (type: 'start' | 'complete' | 'timeout' | 'levelUp') => {
    soundService.resume();
    soundService.play(type);
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">声音设置</h2>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Main Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">声音提醒</p>
                <p className="text-sm text-muted-foreground">
                  {settings.enabled ? '已开启' : '已关闭'}
                </p>
              </div>
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

      {/* Volume Control */}
      {settings.enabled && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <p className="font-medium">音量</p>
              <span className="text-sm text-muted-foreground ml-auto">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </CardContent>
        </Card>
      )}

      {/* Sound Types */}
      {settings.enabled && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="font-medium">声音类型</p>

            <SoundToggle
              label="计时开始"
              description="开始计时时播放"
              checked={settings.startSound}
              onChange={() => handleToggle('startSound')}
              onTest={() => playTestSound('start')}
            />

            <SoundToggle
              label="计时完成"
              description="时间到时播放"
              checked={settings.completeSound}
              onChange={() => handleToggle('completeSound')}
              onTest={() => playTestSound('complete')}
            />

            <SoundToggle
              label="超时提醒"
              description="超时时播放"
              checked={settings.timeoutSound}
              onChange={() => handleToggle('timeoutSound')}
              onTest={() => playTestSound('timeout')}
            />

            <SoundToggle
              label="等级提升"
              description="升级时播放"
              checked={settings.levelUpSound}
              onChange={() => handleToggle('levelUpSound')}
              onTest={() => playTestSound('levelUp')}
            />

            <SoundToggle
              label="计时滴答"
              description="每秒滴答声"
              checked={settings.tickSound}
              onChange={() => handleToggle('tickSound')}
              onTest={() => soundService.play('tick')}
            />
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      {settings.enabled && (
        <Button
          variant="outline"
          className="w-full"
          onClick={resetSettings}
        >
          重置为默认设置
        </Button>
      )}
    </div>
  );
}

interface SoundToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  onTest: () => void;
}

function SoundToggle({ label, description, checked, onChange, onTest }: SoundToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onTest}
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent"
        >
          <Play className="h-4 w-4" />
        </button>
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
