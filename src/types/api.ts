/**
 * API Type Definitions
 * Based on contracts/plugin-api.yaml
 */

import { EmailStatus, EmailCategory, Priority, ResolutionOutcome } from './enums';

// Email Capture Types
export interface EmailCaptureRequest {
  sender: string;
  senderName?: string;
  subject: string;
  body: string;
  receivedDate: string;
  tags?: string[];
  category?: EmailCategory;
  priority?: Priority;
  attachments?: AttachmentInfo[];
}

export interface EmailCaptureResponse {
  id: string;
  path: string;
  message: string;
}

// Daily Summary Types
export interface SummaryRequest {
  date: string;
  includeResolved?: boolean;
  includeArchived?: boolean;
}

export interface DailySummary {
  date: string;
  emailCount: number;
  statusBreakdown: {
    pending: number;
    inProgress: number;
    resolved: number;
    archived: number;
  };
  categoryBreakdown: Record<string, number>;
  emails: EmailSummaryItem[];
}

export interface EmailSummaryItem {
  id: string;
  sender: string;
  subject: string;
  time: string;
  status: EmailStatus;
  priority?: Priority;
}

// Knowledge Search Types
export interface SearchRequest {
  query: string;
  tags?: string[];
  category?: EmailCategory;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
}

export interface SearchResult {
  type: 'email' | 'knowledge';
  id: string;
  title: string;
  excerpt: string;
  score: number;
  path: string;
}

// Bulk Import Types
export interface BulkImportRequest {
  format: 'eml' | 'mbox' | 'csv';
  content: string;
  tagAll?: string[];
  category?: EmailCategory;
}

export interface BulkImportResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalEmails: number;
}

// Resolution Types
export interface ResolutionRequest {
  emailId: string;
  summary: string;
  details?: string;
  outcome: ResolutionOutcome;
  followUpRequired?: boolean;
  followUpDate?: string;
  extractToKnowledge?: boolean;
}

export interface ResolutionResponse {
  resolutionId: string;
  emailStatus: EmailStatus;
  knowledgeEntryId?: string;
}

// Attachment Type
export interface AttachmentInfo {
  filename: string;
  mimeType: string;
  size: number;
  content?: string; // base64 encoded
}

// Error Type
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
