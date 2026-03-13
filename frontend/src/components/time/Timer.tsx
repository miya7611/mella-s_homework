import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { soundService } from '../../services/soundService';
import { useSoundSettingsStore } from '../../stores/soundSettingsStore';

interface TimerProps {
  isRunning: boolean;
  startTime: string | null;
  suggestedDuration?: number;
  onStart: () => void;
  onStop: () => void;
}

export function Timer({
  isRunning,
  startTime,
  suggestedDuration,
  onStart,
  onStop,
}: TimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { settings } = useSoundSettingsStore();
  const hasPlayedCompleteSound = useRef(false);
  const hasPlayedTimeoutSound = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const start = new Date(startTime).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
      hasPlayedCompleteSound.current = false;
      hasPlayedTimeoutSound.current = false;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const suggestedSeconds = (suggestedDuration || 0) * 60;
  const isOvertime = suggestedSeconds > 0 && elapsedSeconds > suggestedSeconds;

  // Play sounds at appropriate times
  useEffect(() => {
    if (!isRunning || !settings.enabled) return;

    // Play complete sound when reaching suggested duration
    if (suggestedSeconds > 0 && elapsedSeconds >= suggestedSeconds && elapsedSeconds < suggestedSeconds + 5) {
      if (!hasPlayedCompleteSound.current && settings.completeSound) {
        soundService.play('complete');
        hasPlayedCompleteSound.current = true;
      }
    }

    // Play timeout sound when going overtime (first 5 seconds of overtime)
    if (isOvertime && elapsedSeconds >= suggestedSeconds + 5 && elapsedSeconds < suggestedSeconds + 10) {
      if (!hasPlayedTimeoutSound.current && settings.timeoutSound) {
        soundService.play('timeout');
        hasPlayedTimeoutSound.current = true;
      }
    }

    // Play tick sound every second if enabled
    if (settings.tickSound && elapsedSeconds > 0) {
      soundService.play('tick');
    }
  }, [isRunning, elapsedSeconds, suggestedSeconds, isOvertime, settings]);

  const handleStart = () => {
    soundService.resume();
    if (settings.enabled && settings.startSound) {
      soundService.play('start');
    }
    onStart();
  };

  const handleStop = () => {
    if (settings.enabled && settings.completeSound) {
      soundService.play('complete');
    }
    onStop();
  };

  return (
    <Card className={isOvertime ? 'border-destructive' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isOvertime
                  ? 'bg-destructive/10'
                  : isRunning
                    ? 'bg-green-100'
                    : 'bg-muted'
              }`}
            >
              <Clock
                className={`h-5 w-5 ${
                  isOvertime ? 'text-destructive' : isRunning ? 'text-green-600' : 'text-muted-foreground'
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRunning ? '计时中...' : '未开始'}
              </p>
              <p
                className={`text-2xl font-mono font-semibold ${
                  isOvertime ? 'text-destructive' : ''
                }`}
              >
                {formatTime(elapsedSeconds)}
              </p>
              {suggestedDuration && (
                <p className="text-xs text-muted-foreground">
                  建议时长: {suggestedDuration} 分钟
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={isRunning ? handleStop : handleStart}
            variant={isRunning ? 'destructive' : 'default'}
            size="sm"
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                停止
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                开始
              </>
            )}
          </Button>
        </div>

        {isOvertime && (
          <div className="mt-3 text-sm text-destructive">
            已超时 {formatTime(elapsedSeconds - suggestedSeconds)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
