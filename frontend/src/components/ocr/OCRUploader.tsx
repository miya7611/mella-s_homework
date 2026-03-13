import { useState, useRef } from 'react';
import { Upload, Camera, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ocrService, type ParsedHomework } from '../../services/ocrService';

interface OCRUploaderProps {
  onOCRResult: (result: ParsedHomework) => void;
}

export function OCRUploader({ onOCRResult }: OCRUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ParsedHomework | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    await processImage(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          await processImage(file);
          return;
        }
      }
    }

    setError('剪贴板中没有找到图片');
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const result = await ocrService.processHomeworkImage(
        file,
        (p) => setProgress(Math.round(p))
      );

      setLastResult(result);
      onOCRResult(result);
    } catch (err) {
      console.error('OCR failed:', err);
      setError('识别失败，请重试或手动输入');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="space-y-3"
      onPaste={handlePaste}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area */}
      <Card className={isProcessing ? 'opacity-50' : ''}>
        <CardContent className="p-4">
          {isProcessing ? (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                正在识别中... {progress}%
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center gap-3 mb-3">
                <Button
                  variant="outline"
                  onClick={handleButtonClick}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  上传截图
                </Button>
                <Button
                  variant="outline"
                  onClick={handleButtonClick}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  拍照
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                或直接粘贴截图 (Ctrl+V)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Result preview */}
      {lastResult && !isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">识别完成</span>
              {lastResult.subject && (
                <span className="text-sm text-muted-foreground ml-2">
                  科目: {lastResult.subject}
                </span>
              )}
            </div>

            {lastResult.tasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">识别到的任务:</p>
                <ul className="text-sm space-y-1">
                  {lastResult.tasks.slice(0, 5).map((task, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                  {lastResult.tasks.length > 5 && (
                    <li className="text-muted-foreground text-xs">
                    还有 {lastResult.tasks.length - 5} 个任务...
                  </li>
                  )}
                </ul>
              </div>
            )}

            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                查看原始文本
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {lastResult.rawText}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>提示：</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>支持钉钉作业截图识别</li>
          <li>确保图片清晰、文字清楚</li>
          <li>首次使用需下载中文语言包（约10MB）</li>
          <li>识别结果可能需要手动修正</li>
        </ul>
      </div>
    </div>
  );
}
