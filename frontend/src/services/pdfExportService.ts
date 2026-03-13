import jsPDF from 'jspdf';
import { taskApi } from '../api/task.api';
import type { Task } from '../types/task';

interface WeekData {
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  earnedPoints: number;
}

class PDFExportService {
  // Get week data for a specific date
  async getWeekData(date: Date, userId: number): Promise<WeekData> {
    // Get the start of the week (Monday)
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get the end of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Fetch tasks for the week
    const tasks = await taskApi.getTasks({ userId });

    // Filter tasks for the week
    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.scheduled_date);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });

    const completedTasks = weekTasks.filter(t => t.status === 'completed');
    const totalPoints = weekTasks.reduce((sum, t) => sum + (t.points || 0), 0);
    const earnedPoints = completedTasks.reduce((sum, t) => sum + (t.points || 0), 0);

    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      tasks: weekTasks,
      totalTasks: weekTasks.length,
      completedTasks: completedTasks.length,
      totalPoints,
      earnedPoints,
    };
  }

  // Format short date
  private formatShortDate(date: Date): string {
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    });
  }

  // Get weekday name
  private getWeekdayName(date: Date): string {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  }

  // Generate weekly task report PDF
  async generateWeeklyReport(userId: number, userName: string): Promise<void> {
    const weekData = await this.getWeekData(new Date(), userId);

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Weekly Task Report', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Subtitle with date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const dateRange = `${this.formatShortDate(weekData.startDate)} - ${this.formatShortDate(weekData.endDate)}`;
    doc.text(dateRange, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // User name
    doc.setFontSize(14);
    doc.text(`Student: ${userName}`, margin, y);
    y += 10;

    // Summary box
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'FD');

    y += 8;
    doc.setFontSize(11);
    const completionRate = weekData.totalTasks > 0
      ? Math.round((weekData.completedTasks / weekData.totalTasks) * 100)
      : 0;

    // Summary stats
    const statsY = y;
    doc.text(`Total Tasks: ${weekData.totalTasks}`, margin + 10, statsY);
    doc.text(`Completed: ${weekData.completedTasks}`, margin + 60, statsY);
    doc.text(`Completion Rate: ${completionRate}%`, margin + 110, statsY);

    y += 8;
    doc.text(`Total Points: ${weekData.totalPoints}`, margin + 10, y);
    doc.text(`Earned Points: ${weekData.earnedPoints}`, margin + 60, y);

    y += 20;

    // Daily tasks breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Tasks', margin, y);
    y += 8;

    // Group tasks by date
    const tasksByDate: Record<string, Task[]> = {};
    weekData.tasks.forEach(task => {
      const dateKey = task.scheduled_date;
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

    // Sort dates
    const sortedDates = Object.keys(tasksByDate).sort();

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    sortedDates.forEach((dateKey) => {
      // Check if we need a new page
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }

      const tasks = tasksByDate[dateKey];
      const date = new Date(dateKey);
      const dayName = this.getWeekdayName(date);

      // Date header
      doc.setFillColor(230, 230, 230);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(`${this.formatShortDate(date)} ${dayName}`, margin + 2, y + 5);
      y += 10;

      // Tasks
      doc.setFont('helvetica', 'normal');
      tasks.forEach((task) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }

        const status = task.status === 'completed' ? '[✓]' : '[ ]';
        const points = task.points ? `(${task.points} pts)` : '';
        const text = `${status} ${task.title} ${points}`;

        // Checkbox style
        if (task.status === 'completed') {
          doc.setTextColor(34, 197, 94); // Green for completed
        } else {
          doc.setTextColor(100, 100, 100); // Gray for pending
        }

        doc.text(text, margin + 5, y);
        doc.setTextColor(0, 0, 0); // Reset to black
        y += 6;
      });

      y += 5;
    });

    // Motivational quote
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }

    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    const quotes = [
      'Keep up the great work!',
      'Every task completed is a step forward!',
      'You are doing amazing!',
      'Success is the sum of small efforts!',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    doc.text(quote, pageWidth / 2, y, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated on ${new Date().toLocaleDateString('zh-CN')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `weekly-report-${this.formatShortDate(weekData.startDate).replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }

  // Generate printable task checklist (HTML based)
  generatePrintableChecklist(tasks: Task[], title: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    const groupedByDate: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const dateKey = task.scheduled_date;
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(task);
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            text-align: center;
            color: #333;
          }
          .date-group {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .date-header {
            background: #f0f0f0;
            padding: 8px 12px;
            font-weight: bold;
            border-radius: 4px;
          }
          .task-item {
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
          }
          .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #333;
            margin-right: 10px;
            flex-shrink: 0;
          }
          .task-title {
            flex: 1;
          }
          .task-points {
            color: #666;
            font-size: 12px;
          }
          .completed .checkbox {
            background: #22c55e;
            border-color: #22c55e;
          }
          .completed .task-title {
            text-decoration: line-through;
            color: #888;
          }
          @media print {
            body { padding: 0; }
            .date-group { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${Object.entries(groupedByDate).map(([date, dateTasks]) => {
          const d = new Date(date);
          const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          return `
            <div class="date-group">
              <div class="date-header">${d.toLocaleDateString('zh-CN')} ${weekdays[d.getDay()]}</div>
              ${dateTasks.map(task => `
                <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
                  <div class="checkbox"></div>
                  <span class="task-title">${task.title}</span>
                  ${task.points ? `<span class="task-points">${task.points} 积分</span>` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export const pdfExportService = new PDFExportService();
