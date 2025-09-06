/**
 * EmailCaptureService
 * 
 * Service for capturing email inquiries and creating Obsidian notes
 * with proper metadata and file organization.
 */

import { EmailInquiryModel } from '../models/EmailInquiry';
import { EmailCaptureRequest, EmailCaptureResponse, AttachmentInfo } from '../types/api';
import { EmailStatus, EmailCategory, Priority } from '../types/enums';
import { KnowledgeExtractionService, KnowledgeExtractionSettings } from './KnowledgeExtractionService';

export interface VaultAdapter {
  create(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  createFolder(path: string): Promise<void>;
  writeFile(path: string, content: ArrayBuffer | Buffer): Promise<void>;
}

export interface SearchIndexer {
  addEmail(email: EmailInquiryModel): Promise<void>;
  removeEmail(emailId: string): Promise<void>;
  updateEmail(email: EmailInquiryModel): Promise<void>;
}

export class EmailCaptureService {
  private vault: VaultAdapter;
  private searchIndexer?: SearchIndexer;
  private emailsFolder: string;
  private knowledgeExtractionService?: KnowledgeExtractionService;

  constructor(
    vault: VaultAdapter, 
    emailsFolder: string = 'Emails', 
    searchIndexer?: SearchIndexer,
    knowledgeExtractionService?: KnowledgeExtractionService
  ) {
    this.vault = vault;
    this.emailsFolder = emailsFolder;
    this.searchIndexer = searchIndexer;
    this.knowledgeExtractionService = knowledgeExtractionService;
  }

  async captureEmail(request: EmailCaptureRequest): Promise<EmailCaptureResponse> {
    try {
      // Validate request
      this.validateRequest(request);

      // Create Email model
      const email = this.createEmailFromRequest(request);

      // Generate file path
      const filePath = await this.generateFilePath(email);
      
      // Process attachments if any
      if (request.attachments && request.attachments.length > 0) {
        await this.processAttachments(request.attachments, email.id);
      }

      // Generate note content
      const noteContent = this.generateNoteContent(email);

      // Create the note file
      await this.vault.create(filePath, noteContent);

      // Index for search if indexer is available
      if (this.searchIndexer) {
        await this.searchIndexer.addEmail(email);
      }

      // Extract knowledge if email is resolved and auto-extraction is enabled
      let knowledgePath: string | null = null;
      if (this.knowledgeExtractionService && this.knowledgeExtractionService.isEligibleForExtraction(email)) {
        try {
          knowledgePath = await this.knowledgeExtractionService.extractKnowledgeFromEmail(email);
          console.log('[EmailCapture] Knowledge extracted:', knowledgePath);
        } catch (error) {
          console.error('[EmailCapture] Knowledge extraction failed:', error);
          // Don't fail the entire capture process if knowledge extraction fails
        }
      }

      return {
        id: email.id,
        path: filePath,
        message: knowledgePath ? 
          `Email captured successfully. Knowledge extracted to: ${knowledgePath}` :
          'Email captured successfully'
      };

    } catch (error) {
      throw new Error(`Failed to capture email: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateRequest(request: EmailCaptureRequest): void {
    if (!request.sender) {
      throw new Error('Sender is required');
    }
    
    if (!request.subject) {
      throw new Error('Subject is required');
    }
    
    if (!request.body) {
      throw new Error('Body is required');
    }

    if (!request.receivedDate) {
      throw new Error('Received date is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.sender)) {
      throw new Error('Invalid sender email format');
    }
  }

  private createEmailFromRequest(request: EmailCaptureRequest): EmailInquiryModel {
    return EmailInquiryModel.create({
      sender: request.sender,
      senderName: request.senderName,
      subject: request.subject,
      body: request.body,
      receivedDate: new Date(request.receivedDate),
      category: request.category,
      priority: request.priority || Priority.MEDIUM,
      tags: request.tags || [],
    });
  }

  private async generateFilePath(email: EmailInquiryModel): Promise<string> {
    const date = email.receivedDate;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Create folder structure: [emailsFolder]/YYYY/MM/
    const folderPath = `${this.emailsFolder}/${year}/${month}`;
    
    // Ensure folder exists
    if (!(await this.vault.exists(folderPath))) {
      await this.vault.createFolder(folderPath);
    }

    // Generate safe filename from subject
    const safeSubject = this.sanitizeFilename(email.subject);
    const timestamp = date.toTimeString().substring(0, 5).replace(':', '-');
    
    let filename = `${day}-${timestamp}-${safeSubject}.md`;
    let filePath = `${folderPath}/${filename}`;
    
    // Ensure unique filename
    let counter = 1;
    while (await this.vault.exists(filePath)) {
      filename = `${day}-${timestamp}-${safeSubject}-${counter}.md`;
      filePath = `${folderPath}/${filename}`;
      counter++;
    }

    return filePath;
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 50) // Limit length
      .toLowerCase();
  }

  private async processAttachments(attachments: AttachmentInfo[], emailId: string): Promise<void> {
    const attachmentFolder = `${this.emailsFolder}/Attachments/${emailId}`;
    
    if (!(await this.vault.exists(attachmentFolder))) {
      await this.vault.createFolder(attachmentFolder);
    }

    for (const attachment of attachments) {
      if (attachment.content) {
        const buffer = Buffer.from(attachment.content, 'base64');
        const attachmentPath = `${attachmentFolder}/${attachment.filename}`;
        await this.vault.writeFile(attachmentPath, buffer);
      }
    }
  }

  private generateNoteContent(email: EmailInquiryModel): string {
    const frontmatter = this.generateFrontmatter(email);
    const content = [
      '---',
      frontmatter,
      '---',
      '',
      `# ${email.subject}`,
      '',
      `**From:** ${email.senderName || email.sender} <${email.sender}>`,
      `**Date:** ${email.receivedDate.toISOString()}`,
      `**Status:** ${email.status}`,
      ...(email.category ? [`**Category:** ${email.category}`] : []),
      ...(email.priority ? [`**Priority:** ${email.priority}`] : []),
      ...(email.tags.length > 0 ? [`**Tags:** ${email.tags.join(', ')}`] : []),
      '',
      '## Content',
      '',
      email.body,
      '',
      '## Notes',
      '',
      '<!-- Add your notes and resolution details here -->',
      ''
    ];

    return content.join('\n');
  }

  private generateFrontmatter(email: EmailInquiryModel): string {
    const frontmatter = email.toFrontmatter();
    const yamlLines: string[] = [];
    
    for (const [key, value] of Object.entries(frontmatter)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            yamlLines.push(`${key}:`);
            value.forEach(item => yamlLines.push(`  - ${item}`));
          }
        } else if (typeof value === 'string') {
          yamlLines.push(`${key}: "${value}"`);
        } else {
          yamlLines.push(`${key}: ${value}`);
        }
      }
    }
    
    return yamlLines.join('\n');
  }
}