/**
 * DailySummaryService
 * 
 * Service for generating daily summaries of email inquiries.
 * Collects emails from a specific date, analyzes patterns, and creates
 * comprehensive summary reports.
 */

import { VaultAdapter } from './EmailCaptureService';
import { EmailStatus, EmailCategory, Priority } from '../types/enums';

export interface EmailSummaryData {
  id: string;
  sender: string;
  senderName?: string;
  subject: string;
  category?: EmailCategory;
  priority?: Priority;
  status: EmailStatus;
  receivedDate: Date;
  tags: string[];
}

export interface DailySummaryStats {
  totalEmails: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  topSenders: Array<{ email: string; name?: string; count: number }>;
  commonTags: Array<{ tag: string; count: number }>;
}

export interface DailySummaryRequest {
  date: string; // YYYY-MM-DD format
  includePreviousDays?: number; // Include emails from previous N days
}

export interface DailySummaryResponse {
  date: string;
  filePath: string;
  stats: DailySummaryStats;
  message: string;
}

export interface DailySummarySettings {
  summariesFolder: string;
  emailsFolder: string;
  language: string;
}

export class DailySummaryService {
  private vault: VaultAdapter;
  private settings: DailySummarySettings;

  constructor(vault: VaultAdapter, settings: DailySummarySettings) {
    this.vault = vault;
    this.settings = settings;
  }

  /**
   * Generate daily summary for the specified date
   */
  async generateSummary(request: DailySummaryRequest): Promise<DailySummaryResponse> {
    try {
      console.log(`[DailySummary] Generating summary for date: ${request.date}`);

      // Collect emails for the specified date
      const emails = await this.collectEmailsForDate(request.date, request.includePreviousDays || 0);
      
      if (emails.length === 0) {
        console.log('[DailySummary] No emails found for the specified date');
        throw new Error('指定された日付にメールが見つかりません');
      }

      // Generate statistics
      const stats = this.generateStatistics(emails);

      // Create summary content
      const content = this.generateSummaryContent(request.date, emails, stats);

      // Generate file path
      const filePath = await this.generateSummaryFilePath(request.date);

      // Create the summary file
      await this.vault.create(filePath, content);

      console.log(`[DailySummary] Summary generated successfully: ${filePath}`);

      return {
        date: request.date,
        filePath,
        stats,
        message: `日次サマリーを生成しました: ${filePath}`
      };

    } catch (error) {
      console.error(`[DailySummary] Failed to generate summary:`, error);
      throw new Error(`サマリー生成に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Collect emails for the specified date range
   */
  private async collectEmailsForDate(targetDate: string, includePreviousDays: number = 0): Promise<EmailSummaryData[]> {
    const emails: EmailSummaryData[] = [];
    const targetDateObj = new Date(targetDate);
    
    // Calculate date range
    const startDate = new Date(targetDateObj);
    startDate.setDate(startDate.getDate() - includePreviousDays);
    
    console.log(`[DailySummary] Collecting emails from ${startDate.toISOString().split('T')[0]} to ${targetDate}`);

    try {
      // Search through email folder structure: emailsFolder/YYYY/MM/
      const currentDate = new Date(startDate);
      while (currentDate <= targetDateObj) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const folderPath = `${this.settings.emailsFolder}/${year}/${month}`;

        if (await this.vault.exists(folderPath)) {
          const dayEmails = await this.collectEmailsFromFolder(folderPath, currentDate);
          emails.push(...dayEmails);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      console.error('[DailySummary] Error collecting emails:', error);
    }

    console.log(`[DailySummary] Collected ${emails.length} emails`);
    return emails;
  }

  /**
   * Collect emails from a specific folder for a specific date
   */
  private async collectEmailsFromFolder(folderPath: string, targetDate: Date): Promise<EmailSummaryData[]> {
    const emails: EmailSummaryData[] = [];
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const day = String(targetDate.getDate()).padStart(2, '0');

    try {
      // This is a simplified approach - in a real implementation, you would:
      // 1. List files in the folder
      // 2. Filter files that match the target date pattern (DD-*)
      // 3. Parse frontmatter to extract email data
      
      // For now, we'll create mock data based on the expected file naming pattern
      // In a complete implementation, you would use the vault adapter to read files
      console.log(`[DailySummary] Scanning folder: ${folderPath} for date: ${targetDateStr}`);
      
      // Mock implementation - replace with actual file reading
      // This would normally read .md files and parse their frontmatter
      
    } catch (error) {
      console.error(`[DailySummary] Error reading folder ${folderPath}:`, error);
    }

    return emails;
  }

  /**
   * Generate statistics from collected emails
   */
  private generateStatistics(emails: EmailSummaryData[]): DailySummaryStats {
    const stats: DailySummaryStats = {
      totalEmails: emails.length,
      byCategory: {},
      byPriority: {},
      byStatus: {},
      topSenders: [],
      commonTags: []
    };

    const senderCounts: Record<string, { name?: string; count: number }> = {};
    const tagCounts: Record<string, number> = {};

    emails.forEach(email => {
      // Category stats
      const category = email.category || 'その他';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Priority stats
      const priority = email.priority || 'medium';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

      // Status stats
      stats.byStatus[email.status] = (stats.byStatus[email.status] || 0) + 1;

      // Sender stats
      if (!senderCounts[email.sender]) {
        senderCounts[email.sender] = { name: email.senderName, count: 0 };
      }
      senderCounts[email.sender].count++;

      // Tag stats
      email.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort and limit top senders
    stats.topSenders = Object.entries(senderCounts)
      .map(([email, data]) => ({ email, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Sort and limit common tags
    stats.commonTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return stats;
  }

  /**
   * Generate summary content
   */
  private generateSummaryContent(date: string, emails: EmailSummaryData[], stats: DailySummaryStats): string {
    const dateObj = new Date(date);
    const formattedDate = this.settings.language === 'ja' 
      ? `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`
      : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const frontmatter = {
      date: date,
      type: 'daily-summary',
      totalEmails: stats.totalEmails,
      createdAt: new Date().toISOString(),
      language: this.settings.language
    };

    const yamlLines: string[] = [];
    for (const [key, value] of Object.entries(frontmatter)) {
      if (typeof value === 'string') {
        yamlLines.push(`${key}: "${value}"`);
      } else {
        yamlLines.push(`${key}: ${value}`);
      }
    }

    const content = [
      '---',
      yamlLines.join('\n'),
      '---',
      '',
      `# 📧 ${formattedDate} メール問い合わせサマリー`,
      '',
      '## 📊 概要',
      '',
      `- **総メール数**: ${stats.totalEmails}件`,
      `- **生成日時**: ${new Date().toLocaleString('ja-JP')}`,
      '',
      '## 📈 統計情報',
      '',
      '### カテゴリ別',
      '',
      ...this.generateStatTable(stats.byCategory, this.getCategoryDisplayName.bind(this)),
      '',
      '### 優先度別',
      '',
      ...this.generateStatTable(stats.byPriority, this.getPriorityDisplayName.bind(this)),
      '',
      '### ステータス別', 
      '',
      ...this.generateStatTable(stats.byStatus, this.getStatusDisplayName.bind(this)),
      '',
      '## 👥 送信者分析',
      '',
      ...(stats.topSenders.length > 0 ? [
        '| 送信者 | 件数 |',
        '|--------|------|',
        ...stats.topSenders.map(sender => 
          `| ${sender.name || sender.email} | ${sender.count}件 |`
        )
      ] : ['送信者データがありません。']),
      '',
      '## 🏷️ よく使われたタグ',
      '',
      ...(stats.commonTags.length > 0 ? [
        stats.commonTags.slice(0, 10).map(tag => `- **${tag.tag}** (${tag.count}件)`).join('\n')
      ] : ['タグデータがありません。']),
      '',
      '## 📋 詳細メール一覧',
      '',
      ...(emails.length > 0 ? [
        '| 時刻 | 送信者 | 件名 | カテゴリ | ステータス |',
        '|------|--------|------|----------|------------|',
        ...emails.slice(0, 50).map(email => { // Limit to 50 emails for readability
          const time = email.receivedDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
          const sender = email.senderName || email.sender;
          const subject = email.subject.length > 30 ? email.subject.substring(0, 30) + '...' : email.subject;
          const category = this.getCategoryDisplayName(email.category || '');
          const status = this.getStatusDisplayName(email.status);
          return `| ${time} | ${sender} | ${subject} | ${category} | ${status} |`;
        }),
        ...(emails.length > 50 ? [`\n*...他${emails.length - 50}件*`] : [])
      ] : ['メールデータがありません。']),
      '',
      '## 💡 インサイト',
      '',
      ...this.generateInsights(stats),
      '',
      '---',
      '',
      '> このサマリーは自動生成されました。',
      `> 生成元: Email Inquiry Management Plugin v1.0.0`,
      ''
    ];

    return content.join('\n');
  }

  /**
   * Generate statistics table
   */
  private generateStatTable(stats: Record<string, number>, displayNameFn: (key: string) => string): string[] {
    if (Object.keys(stats).length === 0) {
      return ['データがありません。'];
    }

    const sortedStats = Object.entries(stats).sort(([,a], [,b]) => b - a);
    return [
      '| 項目 | 件数 | 割合 |',
      '|------|------|------|',
      ...sortedStats.map(([key, count]) => {
        const total = Object.values(stats).reduce((sum, c) => sum + c, 0);
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return `| ${displayNameFn(key)} | ${count}件 | ${percentage}% |`;
      })
    ];
  }

  /**
   * Generate insights based on statistics
   */
  private generateInsights(stats: DailySummaryStats): string[] {
    const insights: string[] = [];

    // Email volume insight
    if (stats.totalEmails > 20) {
      insights.push('🔥 **高い問い合わせ量**: 今日は通常より多くの問い合わせがありました。');
    } else if (stats.totalEmails < 5) {
      insights.push('📉 **低い問い合わせ量**: 今日は比較的静かな一日でした。');
    }

    // Category insights
    const topCategory = Object.entries(stats.byCategory).sort(([,a], [,b]) => b - a)[0];
    if (topCategory && topCategory[1] > stats.totalEmails * 0.4) {
      insights.push(`📂 **主要カテゴリ**: ${this.getCategoryDisplayName(topCategory[0])}の問い合わせが多くを占めています (${topCategory[1]}件)。`);
    }

    // Priority insights
    const highPriorityCount = stats.byPriority['high'] || 0;
    const urgentCount = stats.byPriority['urgent'] || 0;
    if (highPriorityCount + urgentCount > stats.totalEmails * 0.3) {
      insights.push('⚠️ **優先度高**: 緊急性の高い問い合わせが多く見つかりました。早急な対応が必要です。');
    }

    // Status insights
    const resolvedCount = stats.byStatus[EmailStatus.RESOLVED] || 0;
    const resolutionRate = stats.totalEmails > 0 ? Math.round((resolvedCount / stats.totalEmails) * 100) : 0;
    if (resolutionRate > 80) {
      insights.push(`✅ **高解決率**: 解決率${resolutionRate}%と高いパフォーマンスを示しています。`);
    } else if (resolutionRate < 30) {
      insights.push(`📋 **要フォローアップ**: 解決率${resolutionRate}%と低く、未解決の問い合わせが多く残っています。`);
    }

    // Sender insights
    if (stats.topSenders.length > 0 && stats.topSenders[0].count > 3) {
      insights.push(`👤 **頻出送信者**: ${stats.topSenders[0].name || stats.topSenders[0].email}から${stats.topSenders[0].count}件の問い合わせがありました。`);
    }

    if (insights.length === 0) {
      insights.push('📝 特に注目すべき傾向は見られませんでした。');
    }

    return insights;
  }

  /**
   * Get display name for category
   */
  private getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      'specification': '仕様',
      'issue': '障害', 
      'migration_vup': '移行/VUP',
      'other': 'その他'
    };
    return categoryMap[category] || category || 'その他';
  }

  /**
   * Get display name for priority
   */
  private getPriorityDisplayName(priority: string): string {
    const priorityMap: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'urgent': '緊急'
    };
    return priorityMap[priority] || priority || '中';
  }

  /**
   * Get display name for status
   */
  private getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      [EmailStatus.PENDING]: '未対応',
      [EmailStatus.IN_PROGRESS]: '対応中',
      [EmailStatus.RESOLVED]: '解決済み',
      [EmailStatus.ARCHIVED]: 'アーカイブ'
    };
    return statusMap[status] || status || '未対応';
  }

  /**
   * Generate file path for summary
   */
  private async generateSummaryFilePath(date: string): Promise<string> {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    
    // Create folder structure: [summariesFolder]/YYYY/
    const folderPath = `${this.settings.summariesFolder}/${year}`;
    
    // Ensure folder exists
    if (!(await this.vault.exists(folderPath))) {
      await this.vault.createFolder(folderPath);
    }

    const filename = `${date}-daily-summary.md`;
    let filePath = `${folderPath}/${filename}`;
    
    // Ensure unique filename
    let counter = 1;
    while (await this.vault.exists(filePath)) {
      const baseFilename = `${date}-daily-summary-${counter}.md`;
      filePath = `${folderPath}/${baseFilename}`;
      counter++;
    }

    return filePath;
  }

  /**
   * Update settings
   */
  updateSettings(settings: DailySummarySettings): void {
    this.settings = settings;
  }
}