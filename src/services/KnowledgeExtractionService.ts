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
   * Generate knowledge content with proper source file path link
   */
  private generateKnowledgeContentWithSourcePath(knowledgeEntry: KnowledgeEntryModel, sourceEmail: EmailInquiryModel, sourceFilePath: string): string {
    const frontmatter = knowledgeEntry.toFrontmatter();
    const frontmatterLines: string[] = [];
    
    for (const [key, value] of Object.entries(frontmatter)) {
      if (value != null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            frontmatterLines.push(`${key}:`);
            value.forEach((item) => frontmatterLines.push(`  - "${item}"`));
          }
        } else if (typeof value === 'string') {
          frontmatterLines.push(`${key}: "${value}"`);
        } else {
          frontmatterLines.push(`${key}: ${value}`);
        }
      }
    }

    // Create a relative link to the source email file
    // Handle both Windows and Unix paths, normalize to forward slashes for Obsidian
    let sourceFileLink = sourceFilePath
      .replace(/^\/mnt\/c\/obsidian\//, '') // Remove Unix-style obsidian path
      .replace(/^C:\\Obsidian\\/, '') // Remove Windows-style obsidian path
      .replace(/\\/g, '/') // Convert backslashes to forward slashes
      .replace(/\.md$/, ''); // Remove .md extension for Obsidian
    
    const content = [
      '---',
      frontmatterLines.join('\n'),
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
      `**元のメール:** [[${sourceFileLink}|${sourceEmail.subject}]]`,
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

  /**
   * Extract knowledge from email with source file path for proper linking
   */
  private async extractKnowledgeFromEmailWithPath(email: EmailInquiryModel, sourceFilePath: string): Promise<string | null> {
    try {
      console.log(`[KnowledgeExtraction] Extracting knowledge from email: ${email.id}`);
      
      const knowledgeEntry = await this.createKnowledgeEntry(email);
      const knowledgeFilePath = await this.generateKnowledgeFilePath(knowledgeEntry);
      const knowledgeContent = this.generateKnowledgeContentWithSourcePath(knowledgeEntry, email, sourceFilePath);
      
      await this.vault.create(knowledgeFilePath, knowledgeContent);
      console.log(`[KnowledgeExtraction] Knowledge extracted successfully: ${knowledgeFilePath}`);
      
      return knowledgeFilePath;
    } catch (error) {
      console.error(`[KnowledgeExtraction] Failed to extract knowledge from email ${email.id}:`, error);
      throw new Error(`Failed to extract knowledge: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract knowledge from existing email file by reading its content
   */
  async extractKnowledgeFromFile(filePath: string): Promise<string | null> {
    try {
      console.log(`[KnowledgeExtraction] Extracting knowledge from file: ${filePath}`);

      // Read the email file content
      const content = await this.vault.read(filePath);
      const emailData = this.parseEmailFile(content, filePath);
      
      if (!emailData) {
        console.log(`[KnowledgeExtraction] Failed to parse email file: ${filePath}`);
        return null;
      }

      // Debug: Log parsed email data
      console.log(`[KnowledgeExtraction] Parsed email data:`, JSON.stringify(emailData, null, 2));
      
      // Check if email is eligible for extraction
      if (emailData.status !== 'resolved') {
        console.log(`[KnowledgeExtraction] Email not resolved (status: "${emailData.status}", type: ${typeof emailData.status})`);
        return null;
      }

      // For manual extraction, skip the autoExtractKnowledge setting check
      console.log(`[KnowledgeExtraction] Processing resolved email for manual knowledge extraction`);

      // Create EmailInquiryModel from parsed data
      const email = this.createEmailModelFromData(emailData);
      
      // Extract knowledge using the existing method with source file path
      return await this.extractKnowledgeFromEmailWithPath(email, filePath);
      
    } catch (error) {
      console.error(`[KnowledgeExtraction] Failed to extract knowledge from file ${filePath}:`, error);
      throw new Error(`Failed to extract knowledge from file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse email file frontmatter (similar to DailySummaryService)
   */
  private parseEmailFile(content: string, filePath: string): any | null {
    try {
      // Extract frontmatter (between --- and ---)
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        console.log(`[KnowledgeExtraction] No frontmatter found in ${filePath}`);
        return null;
      }

      const frontmatterText = frontmatterMatch[1];
      const frontmatter: any = {};

      // Simple YAML parsing for frontmatter
      const lines = frontmatterText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':');
          const key = trimmed.substring(0, colonIndex).trim();
          let value = trimmed.substring(colonIndex + 1).trim();

          // Debug specific status parsing
          if (key === 'status') {
            console.log(`[KnowledgeExtraction] Parsing status - raw value: "${value}"`);
          }

          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
            if (key === 'status') {
              console.log(`[KnowledgeExtraction] Status after quote removal: "${value}"`);
            }
          }

          // Handle arrays (tags)
          if (key === 'tags' && value === '') {
            frontmatter[key] = [];
            continue;
          }

          frontmatter[key] = value;
          
          // Debug specific status assignment
          if (key === 'status') {
            console.log(`[KnowledgeExtraction] Final status value assigned: "${value}"`);
          }
        } else if (trimmed.startsWith('- ')) {
          // Array item
          const lastKey = Object.keys(frontmatter).pop();
          if (lastKey && Array.isArray(frontmatter[lastKey])) {
            frontmatter[lastKey].push(trimmed.substring(2).trim());
          } else if (lastKey) {
            frontmatter[lastKey] = [trimmed.substring(2).trim()];
          }
        }
      }

      // Extract body content
      const bodyMatch = content.match(/---[\s\S]*?---\n\n([\s\S]*)/);
      const bodyContent = bodyMatch ? bodyMatch[1] : '';

      return {
        ...frontmatter,
        body: bodyContent,
        receivedDate: frontmatter.receivedDate ? new Date(frontmatter.receivedDate) : new Date(),
        tags: frontmatter.tags || []
      };

    } catch (error) {
      console.error(`[KnowledgeExtraction] Error parsing email file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Create EmailInquiryModel from parsed data
   */
  private createEmailModelFromData(data: any): EmailInquiryModel {
    const email = EmailInquiryModel.create({
      sender: data.sender,
      senderName: data.senderName,
      subject: data.subject,
      body: data.body,
      receivedDate: data.receivedDate,
      category: data.category,
      priority: data.priority || 'medium',
      tags: data.tags || []
    });
    
    // Update status to preserve the parsed status from frontmatter
    if (data.status) {
      email.updateStatus(data.status);
    }
    
    return email;
  }
}
