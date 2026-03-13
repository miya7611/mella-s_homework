import Tesseract from 'tesseract.js';

// OCR result type
export interface OCRResult {
  text: string;
  confidence: number;
  lines: OCRLine[];
}

export interface OCRLine {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

// Parsed homework task from OCR
export interface ParsedHomework {
  subject?: string;
  tasks: string[];
  rawText: string;
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  // Initialize Tesseract worker with Chinese language
  async initialize(onProgress?: (progress: number) => void): Promise<void> {
    if (this.worker) return;
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        this.worker = await Tesseract.createWorker('chi_sim+eng', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
              onProgress(m.progress * 100);
            }
          },
        });
      } catch (error) {
        console.error('Failed to initialize OCR worker:', error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  // Terminate worker to free resources
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  // Recognize text from image
  async recognizeImage(image: string | File | Blob): Promise<OCRResult> {
    // Ensure worker is initialized
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const result = await this.worker.recognize(image);

      // Extract lines from the result
      const lines: OCRLine[] = [];
      const text = result.data.text;

      // Split text into lines and create OCRLine objects
      const textLines = text.split('\n').filter((line) => line.trim());
      textLines.forEach((lineText, index) => {
        lines.push({
          text: lineText.trim(),
          confidence: result.data.confidence,
          bbox: { x0: 0, y0: index * 20, x1: 100, y1: index * 20 + 20 },
        });
      });

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        lines,
      };
    } catch (error) {
      console.error('OCR recognition failed:', error);
      throw new Error('图片识别失败，请重试');
    }
  }

  // Parse homework text from DingTalk screenshots
  parseHomeworkText(text: string): ParsedHomework {
    const lines = text.split('\n').filter((line) => line.trim());
    const tasks: string[] = [];
    let subject: string | undefined;

    // Common subject patterns
    const subjectPatterns = [
      /语文/,
      /数学/,
      /英语/,
      /科学/,
      /音乐/,
      /美术/,
      /体育/,
      /道[德法]/,
      /综合/,
    ];

    // Task patterns (common in homework screenshots)
    const taskPatterns = [
      /^[一二三四五六七八九十\d]+[、.．]\s*(.+)$/,  // 1. task or 一、task
      /^[①②③④⑤⑥⑦⑧⑨⑩]\s*(.+)$/,  // ① task
      /^[\d]+\s*(.+)$/,  // 1 task
      /^[·•]\s*(.+)$/,  // • task
    ];

    // Clean and process lines
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.length < 2) continue;

      // Check for subject
      for (const pattern of subjectPatterns) {
        if (pattern.test(cleanLine)) {
          subject = cleanLine.match(pattern)?.[0];
          break;
        }
      }

      // Check for task items
      let isTask = false;
      for (const pattern of taskPatterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          tasks.push(match[1].trim());
          isTask = true;
          break;
        }
      }

      // If not matched as task but looks like homework item
      if (!isTask && cleanLine.length > 3 && cleanLine.length < 100) {
        // Check if it contains common homework keywords
        const homeworkKeywords = [
          '完成', '背诵', '朗读', '抄写', '练习', '预习', '复习',
          '作业', '第', '页', '题', '写', '读', '背',
        ];

        if (homeworkKeywords.some((keyword) => cleanLine.includes(keyword))) {
          tasks.push(cleanLine);
        }
      }
    }

    // If no tasks found, use all non-empty lines as potential tasks
    if (tasks.length === 0 && lines.length > 0) {
      tasks.push(...lines.filter((line) => line.length > 3 && line.length < 100));
    }

    return {
      subject,
      tasks: [...new Set(tasks)], // Remove duplicates
      rawText: text,
    };
  }

  // Process image and extract homework tasks
  async processHomeworkImage(
    image: string | File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<ParsedHomework> {
    // Initialize with progress callback
    await this.initialize(onProgress);

    // Recognize text
    const result = await this.recognizeImage(image);

    // Parse homework
    return this.parseHomeworkText(result.text);
  }

  // Check if OCR is supported
  isSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof Blob !== 'undefined';
  }
}

export const ocrService = new OCRService();
