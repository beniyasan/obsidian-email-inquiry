/**
 * KnowledgeExtractionService
 *
 * Service for automatically extracting knowledge from resolved emails
 * and creating entries in the knowledge base folder.
 */

import { EmailInquiryModel } from '../models/EmailInquiry';
import { VaultAdapter } from './EmailCaptureService';
import { EmailStatus } from '../types/enums';

export interface KnowledgeEntry {
  id: string;
  title: string;
  problem: string;
  solution: string;
  category?: string;
  keywords: string[];
  sourceEmailId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeEntryModel {
  constructor(private data: KnowledgeEntry) {}

  static create(params: {
    title: string;
    problem: string;
    solution: string;
    category?: string;
    keywords: string[];
    sourceEmailId: string;
    tags: string[];
  }): KnowledgeEntryModel {
    const now = new Date();
    const id = crypto.randomUUID();

    return new KnowledgeEntryModel({
      id,
      title: params.title,
      problem: params.problem,
      solution: params.solution,
      category: params.category,
      keywords: params.keywords,
      sourceEmailId: params.sourceEmailId,
      tags: params.tags,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id(): string { return this.data.id; }
  get title(): string { return this.data.title; }
  get problem(): string { return this.data.problem; }
  get solution(): string { return this.data.solution; }
  get category(): string | undefined { return this.data.category; }
  get keywords(): string[] { return this.data.keywords; }
  get sourceEmailId(): string { return this.data.sourceEmailId; }
  get tags(): string[] { return this.data.tags; }
  get createdAt(): Date { return this.data.createdAt; }

  toFrontmatter(): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      id: this.data.id,
      title: this.data.title,
      category: this.data.category,
      keywords: this.data.keywords,
      sourceEmailId: this.data.sourceEmailId,
      tags: this.data.tags,
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
    };
  }
}

export interface KnowledgeExtractionSettings {
  knowledgeFolder: string;
  autoExtractKnowledge: boolean;
  enableNotifications: boolean;
}

export class KnowledgeExtractionService {
  private vault: VaultAdapter;
  private settings: KnowledgeExtractionSettings;

  constructor(vault: VaultAdapter, settings: KnowledgeExtractionSettings) {
    this.vault = vault;
    this.settings = settings;
  }

  /**
   * Automatically extract knowledge from a resolved email
   */
  async extractKnowledgeFromEmail(email: EmailInquiryModel): Promise<string | null> {
    // Only extract knowledge from resolved emails
    if (email.status !== EmailStatus.RESOLVED) {
      console.log(`[KnowledgeExtraction] Skipping knowledge extraction - email not resolved (status: ${email.status})`);
      return null;
    }

    // Check if auto-extraction is enabled
    if (!this.settings.autoExtractKnowledge) {
      console.log('[KnowledgeExtraction] Auto-extraction is disabled');
      return null;
    }

    try {
      console.log(`[KnowledgeExtraction] Extracting knowledge from email: ${email.id}`);

      // Create knowledge entry
      const knowledgeEntry = await this.createKnowledgeEntry(email);

      // Generate file path
      const filePath = await this.generateKnowledgeFilePath(knowledgeEntry);

      // Generate knowledge content
      const content = this.generateKnowledgeContent(knowledgeEntry, email);

      // Create the knowledge file
      await this.vault.create(filePath, content);

      console.log(`[KnowledgeExtraction] Knowledge extracted successfully: ${filePath}`);
      return filePath;

    } catch (error) {
      console.error(`[KnowledgeExtraction] Failed to extract knowledge from email ${email.id}:`, error);
      throw new Error(`Failed to extract knowledge: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if an email is eligible for knowledge extraction
   */
  isEligibleForExtraction(email: EmailInquiryModel): boolean {
    return (
      this.settings.autoExtractKnowledge &&
      email.status === EmailStatus.RESOLVED &&
      email.body.length > 50 // Only extract from substantial emails
    );
  }

  /**
   * Create a knowledge entry from an email
   */
  private async createKnowledgeEntry(email: EmailInquiryModel): Promise<KnowledgeEntryModel> {
    // Extract key information from email
    const problem = this.extractProblemStatement(email.body);
    // Get resolution notes - for now we'll use a simple approach since resolutionNotes doesn't exist
    const resolutionNotes = ''; // TODO: Implement proper resolution notes retrieval
    const solution = this.extractSolution(email.body, resolutionNotes);
    const keywords = this.extractKeywords(email);

    return KnowledgeEntryModel.create({
      title: this.generateKnowledgeTitle(email.subject),
      problem: problem,
      solution: solution,
      category: email.category,
      keywords: keywords,
      sourceEmailId: email.id,
      tags: [...email.tags, 'auto-extracted'],
    });
  }

  /**
   * Extract problem statement from email body
   */
  private extractProblemStatement(body: string): string {
    // Simple extraction logic - take first few sentences that contain question words
    const sentences = body.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const problemSentences = sentences
      .filter(sentence =>
        /\b(how|what|why|when|where|どう|何|なぜ|いつ|どこ|問題|エラー|できない|わからない)/i.test(sentence)
      )
      .slice(0, 3);

    if (problemSentences.length > 0) {
      return problemSentences.join('. ') + '.';
    }

    // Fallback: take first paragraph
    const firstParagraph = body.split('\n\n')[0];
    return firstParagraph.length > 200 ? firstParagraph.substring(0, 200) + '...' : firstParagraph;
  }

  /**
   * Extract solution from email body and resolution notes
   */
  private extractSolution(body: string, resolutionNotes: string): string {
    if (resolutionNotes && resolutionNotes.trim().length > 10) {
      return resolutionNotes;
    }

    // Extract sentences that contain solution indicators
    const sentences = body.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const solutionSentences = sentences
      .filter(sentence =>
        /\b(解決|修正|対応|fix|resolve|solve|solution|答え|回答|方法)/i.test(sentence)
      )
      .slice(0, 3);

    if (solutionSentences.length > 0) {
      return solutionSentences.join('. ') + '.';
    }

    return '解決方法については詳細な調査が必要です。';
  }

  /**
   * Extract keywords from email
   */
  private extractKeywords(email: EmailInquiryModel): string[] {
    const text = `${email.subject} ${email.body}`.toLowerCase();
    const keywords: string[] = [];

    // Technical keywords
    const technicalTerms = [
      'api', 'database', 'server', 'client', 'network', 'security', 'auth',
      'login', 'password', 'error', 'bug', 'performance', 'timeout',
      'データベース', 'サーバー', 'ネットワーク', 'エラー', 'バグ', 'パフォーマンス'
    ];

    technicalTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.push(term);
      }
    });

    // Add category as keyword
    if (email.category) {
      keywords.push(email.category);
    }

    // Add existing tags
    keywords.push(...email.tags);

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Generate knowledge title from email subject
   */
  private generateKnowledgeTitle(subject: string): string {
    // Clean up subject line
    let title = subject
      .replace(/^(re:|fwd?:|fw:)\s*/i, '') // Remove reply/forward prefixes
      .replace(/\[.*?\]/g, '') // Remove bracketed text
      .trim();

    // Add "解決方法: " prefix if not already solution-oriented
    if (!/\b(解決|方法|how\s+to|solution|fix)/i.test(title)) {
      title = `解決方法: ${title}`;
    }

    return title;
  }

  /**
   * Generate file path for knowledge entry
   */
  private async generateKnowledgeFilePath(knowledgeEntry: KnowledgeEntryModel): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Create folder structure: [knowledgeFolder]/YYYY/MM/
    const folderPath = `${this.settings.knowledgeFolder}/${year}/${month}`;

    // Ensure folder exists
    if (!(await this.vault.exists(folderPath))) {
      await this.vault.createFolder(folderPath);
    }

    // Generate safe filename from title
    const safeTitle = this.sanitizeFilename(knowledgeEntry.title);
    let filename = `${safeTitle}.md`;
    let filePath = `${folderPath}/${filename}`;

    // Ensure unique filename
    let counter = 1;
    while (await this.vault.exists(filePath)) {
      filename = `${safeTitle}-${counter}.md`;
      filePath = `${folderPath}/${filename}`;
      counter++;
    }

    return filePath;
  }

  /**
   * Generate knowledge content
   */
  private generateKnowledgeContent(knowledgeEntry: KnowledgeEntryModel, sourceEmail: EmailInquiryModel): string {
    const frontmatter = knowledgeEntry.toFrontmatter();
    const yamlLines: string[] = [];

    for (const [key, value] of Object.entries(frontmatter)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            yamlLines.push(`${key}:`);
            value.forEach(item => yamlLines.push(`  - "${item}"`));
          }
        } else if (typeof value === 'string') {
          yamlLines.push(`${key}: "${value}"`);
        } else {
          yamlLines.push(`${key}: ${value}`);
        }
      }
    }

    const content = [
      '---',
      yamlLines.join('\n'),
      '---',
      '',
      `# ${knowledgeEntry.title}`,
      '',
      '## 問題・質問',
      '',
      knowledgeEntry.problem,
      '',
      '## 解決方法・回答',
      '',
      knowledgeEntry.solution,
      '',
      '## 関連情報',
      '',
      `**カテゴリ:** ${knowledgeEntry.category || 'その他'}`,
      `**キーワード:** ${knowledgeEntry.keywords.join(', ')}`,
      `**元のメール:** [[${sourceEmail.subject}]]`,
      `**作成日:** ${knowledgeEntry.createdAt.toISOString().split('T')[0]}`,
      '',
      '## メモ',
      '',
      '<!-- 追加の情報や関連事項があれば記録してください -->',
      ''
    ];

    return content.join('\n');
  }

  /**
   * Sanitize filename for safe file creation
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 50) // Limit length
      .toLowerCase();
  }

  /**
   * Update settings
   */
  updateSettings(settings: KnowledgeExtractionSettings): void {
    this.settings = settings;
  }
}
