/**
 * EmailInquiry Model
 *
 * Core data model representing a single email inquiry in the system.
 * Based on data-model.md specifications.
 */

import { EmailStatus, EmailCategory, Priority } from '../types/enums';

export interface AttachmentRef {
  filename: string;
  path: string;
  mimeType: string;
  size: number;
}

export interface EmailInquiry {
  // Metadata (stored in frontmatter)
  id: string;                    // Unique identifier (UUID v4)
  sender: string;                // Email address of sender
  senderName?: string;           // Display name of sender
  subject: string;               // Email subject line
  receivedDate: Date;            // ISO 8601 timestamp
  status: EmailStatus;           // Current status
  tags: string[];                // User-defined tags
  category?: EmailCategory;      // Classification
  threadId?: string;             // Thread grouping identifier
  priority?: Priority;           // Urgency level
  attachments?: AttachmentRef[]; // References to attachment files

  // Relationships
  relatedEmails?: string[];      // IDs of related emails
  knowledgeEntries?: string[];   // IDs of linked knowledge entries
  resolutionNoteId?: string;     // ID of resolution note

  // Content (stored in note body)
  body: string;                  // Email content in markdown
  rawContent?: string;           // Original email format preserved

  // Metadata timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class EmailInquiryModel {
  constructor(private data: EmailInquiry) {}

  static create(params: {
    sender: string;
    senderName?: string;
    subject: string;
    body: string;
    receivedDate: Date;
    category?: EmailCategory;
    priority?: Priority;
    tags?: string[];
    attachments?: AttachmentRef[];
    rawContent?: string;
  }): EmailInquiryModel {
    const id = this.generateId();
    const now = new Date();

    const emailInquiry: EmailInquiry = {
      id,
      sender: params.sender,
      senderName: params.senderName,
      subject: params.subject,
      body: params.body,
      receivedDate: params.receivedDate,
      status: EmailStatus.PENDING,
      tags: params.tags || [],
      category: params.category,
      priority: params.priority,
      attachments: params.attachments,
      rawContent: params.rawContent,
      createdAt: now,
      updatedAt: now,
    };

    return new EmailInquiryModel(emailInquiry);
  }

  // Getters
  get id(): string { return this.data.id; }
  get sender(): string { return this.data.sender; }
  get senderName(): string | undefined { return this.data.senderName; }
  get subject(): string { return this.data.subject; }
  get body(): string { return this.data.body; }
  get receivedDate(): Date { return this.data.receivedDate; }
  get status(): EmailStatus { return this.data.status; }
  get tags(): string[] { return this.data.tags; }
  get category(): EmailCategory | undefined { return this.data.category; }
  get priority(): Priority | undefined { return this.data.priority; }
  get attachments(): AttachmentRef[] | undefined { return this.data.attachments; }
  get relatedEmails(): string[] | undefined { return this.data.relatedEmails; }
  get knowledgeEntries(): string[] | undefined { return this.data.knowledgeEntries; }
  get resolutionNoteId(): string | undefined { return this.data.resolutionNoteId; }
  get rawContent(): string | undefined { return this.data.rawContent; }
  get createdAt(): Date { return this.data.createdAt; }
  get updatedAt(): Date { return this.data.updatedAt; }

  // Methods
  updateStatus(status: EmailStatus): void {
    this.data.status = status;
    this.data.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this.data.tags.includes(tag)) {
      this.data.tags.push(tag);
      this.data.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    const index = this.data.tags.indexOf(tag);
    if (index > -1) {
      this.data.tags.splice(index, 1);
      this.data.updatedAt = new Date();
    }
  }

  setCategory(category: EmailCategory): void {
    this.data.category = category;
    this.data.updatedAt = new Date();
  }

  setPriority(priority: Priority): void {
    this.data.priority = priority;
    this.data.updatedAt = new Date();
  }

  linkToKnowledgeEntry(knowledgeEntryId: string): void {
    if (!this.data.knowledgeEntries) {
      this.data.knowledgeEntries = [];
    }
    if (!this.data.knowledgeEntries.includes(knowledgeEntryId)) {
      this.data.knowledgeEntries.push(knowledgeEntryId);
      this.data.updatedAt = new Date();
    }
  }

  setResolution(resolutionNoteId: string): void {
    this.data.resolutionNoteId = resolutionNoteId;
    this.data.status = EmailStatus.RESOLVED;
    this.data.updatedAt = new Date();
  }

  linkRelatedEmail(emailId: string): void {
    if (!this.data.relatedEmails) {
      this.data.relatedEmails = [];
    }
    if (!this.data.relatedEmails.includes(emailId)) {
      this.data.relatedEmails.push(emailId);
      this.data.updatedAt = new Date();
    }
  }

  setThreadId(threadId: string): void {
    this.data.threadId = threadId;
    this.data.updatedAt = new Date();
  }

  // Validation
  validate(): string[] {
    const errors: string[] = [];

    if (!this.data.id) errors.push('ID is required');
    if (!this.data.sender) errors.push('Sender is required');
    if (!this.data.subject) errors.push('Subject is required');
    if (!this.data.body) errors.push('Body is required');
    if (!this.data.receivedDate) errors.push('Received date is required');

    if (this.data.sender && !this.isValidEmail(this.data.sender)) {
      errors.push('Sender must be a valid email address');
    }

    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }

  // Serialization
  toJSON(): EmailInquiry {
    return { ...this.data };
  }

  toFrontmatter(): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      id: this.data.id,
      sender: this.data.sender,
      senderName: this.data.senderName,
      subject: this.data.subject,
      receivedDate: this.data.receivedDate.toISOString(),
      status: this.data.status,
      tags: this.data.tags,
      category: this.data.category,
      threadId: this.data.threadId,
      priority: this.data.priority,
      attachments: this.data.attachments,
      relatedEmails: this.data.relatedEmails,
      knowledgeEntries: this.data.knowledgeEntries,
      resolutionNoteId: this.data.resolutionNoteId,
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
    };
  }

  static fromJSON(data: any): EmailInquiryModel { // eslint-disable-line @typescript-eslint/no-explicit-any
    const emailInquiry: EmailInquiry = {
      ...data,
      receivedDate: new Date(data.receivedDate),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
    return new EmailInquiryModel(emailInquiry);
  }

  // Private helpers
  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
