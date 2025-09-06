# Data Model: Obsidian Email Inquiry Management System

**Date**: 2025-09-05  
**Feature**: 002-obsidian-email-inquiry

## Overview
This document defines the data structures and relationships for the Obsidian email inquiry management plugin. All entities are stored as markdown files with YAML frontmatter in the Obsidian vault.

## Core Entities

### EmailInquiry
Represents a single email inquiry captured in the system.

```typescript
interface EmailInquiry {
  // Metadata (stored in frontmatter)
  id: string;                    // Unique identifier (UUID v4)
  sender: string;                 // Email address of sender
  senderName?: string;            // Display name of sender
  subject: string;                // Email subject line
  receivedDate: Date;             // ISO 8601 timestamp
  status: EmailStatus;            // Current status
  tags: string[];                 // User-defined tags
  category?: EmailCategory;       // Classification
  threadId?: string;              // Thread grouping identifier
  priority?: Priority;            // Urgency level
  attachments?: AttachmentRef[];  // References to attachment files
  
  // Relationships
  relatedEmails?: string[];       // IDs of related emails
  knowledgeEntries?: string[];    // IDs of linked knowledge entries
  resolutionNoteId?: string;      // ID of resolution note
  
  // Content (stored in note body)
  body: string;                   // Email content in markdown
  rawContent?: string;            // Original email format preserved
}

enum EmailStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress", 
  RESOLVED = "resolved",
  ARCHIVED = "archived"
}

enum EmailCategory {
  SUPPORT = "support",
  SALES = "sales",
  BILLING = "billing",
  TECHNICAL = "technical",
  FEEDBACK = "feedback",
  OTHER = "other"
}

enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}
```

### DailySummary
Aggregated view of emails for a specific date (generated dynamically).

```typescript
interface DailySummary {
  date: Date;                    // Summary date
  emailCount: number;             // Total emails received
  
  // Breakdown by status
  statusBreakdown: {
    pending: number;
    inProgress: number;
    resolved: number;
    archived: number;
  };
  
  // Breakdown by category
  categoryBreakdown: {
    [key in EmailCategory]: number;
  };
  
  // Priority distribution
  priorityBreakdown: {
    [key in Priority]: number;
  };
  
  // Email list
  emails: EmailSummaryItem[];     // Simplified email data
  
  // Insights
  topSenders: SenderStat[];       // Most frequent senders
  commonKeywords: string[];        // Extracted keywords
  averageResponseTime?: number;    // In hours
}

interface EmailSummaryItem {
  id: string;
  sender: string;
  subject: string;
  time: string;                   // HH:MM format
  status: EmailStatus;
  priority?: Priority;
}

interface SenderStat {
  email: string;
  name?: string;
  count: number;
}
```

### KnowledgeEntry
Accumulated knowledge from resolved inquiries.

```typescript
interface KnowledgeEntry {
  // Metadata
  id: string;                    // Unique identifier
  title: string;                 // Knowledge title
  createdDate: Date;             // Creation timestamp
  lastUpdated: Date;             // Last modification
  tags: string[];                // Categorization tags
  category?: EmailCategory;      // Primary category
  
  // Content
  problem: string;               // Problem description
  solution: string;              // Solution provided
  notes?: string;                // Additional notes
  
  // Relationships
  sourceEmails: string[];        // Email IDs this derives from
  relatedEntries?: string[];     // Related knowledge IDs
  
  // Usage tracking
  useCount: number;              // Times referenced
  lastUsed?: Date;               // Last reference date
  effectiveness?: number;        // Success rate (0-100)
}
```

### ResolutionNote
Follow-up information added to resolved inquiries.

```typescript
interface ResolutionNote {
  // Metadata
  id: string;                    // Unique identifier
  emailId: string;               // Associated email ID
  resolvedDate: Date;            // Resolution timestamp
  resolvedBy?: string;           // User who resolved
  
  // Content
  summary: string;               // Brief resolution summary
  details: string;               // Detailed resolution steps
  outcome: ResolutionOutcome;    // Result of resolution
  
  // Follow-up
  followUpRequired: boolean;     // Needs follow-up
  followUpDate?: Date;           // When to follow up
  followUpNotes?: string;        // Follow-up instructions
  
  // Knowledge extraction
  extractedToKnowledge: boolean; // Added to knowledge base
  knowledgeEntryId?: string;     // Linked knowledge entry
}

enum ResolutionOutcome {
  SOLVED = "solved",
  WORKAROUND = "workaround",
  NOT_RESOLVED = "not_resolved",
  DUPLICATE = "duplicate",
  NO_ACTION = "no_action"
}
```

### Tag
User-defined categorization labels.

```typescript
interface Tag {
  name: string;                  // Tag identifier
  displayName: string;           // User-friendly name
  color?: string;                // Hex color for UI
  description?: string;          // Tag purpose
  parent?: string;               // Parent tag for hierarchy
  emailCount: number;            // Number of tagged emails
  createdDate: Date;             // Creation timestamp
}
```

### AttachmentRef
Reference to email attachments.

```typescript
interface AttachmentRef {
  filename: string;              // Original filename
  mimeType: string;              // File MIME type
  size: number;                  // File size in bytes
  path: string;                  // Path in vault
  extractedText?: string;        // Text content if applicable
}
```

## File Structure

```
Vault/
├── Emails/
│   ├── YYYY/
│   │   ├── MM/
│   │   │   ├── DD/
│   │   │   │   ├── {id}-{subject-slug}.md     # Individual emails
│   │   │   │   └── attachments/
│   │   │   │       └── {id}/                  # Attachment files
│   └── Threads/
│       └── {thread-id}.md                     # Thread summaries
├── Knowledge/
│   ├── {category}/
│   │   └── {id}-{title-slug}.md               # Knowledge entries
├── Resolutions/
│   └── {email-id}-resolution.md               # Resolution notes
├── Summaries/
│   └── daily/
│       └── YYYY-MM-DD.md                      # Daily summaries (cached)
└── .email-inquiry/
    ├── config.json                             # Plugin configuration
    ├── tags.json                               # Tag definitions
    └── indexes/
        ├── sender.json                         # Sender index
        └── thread.json                         # Thread index
```

## Frontmatter Schema

### Email Note Frontmatter
```yaml
---
type: email-inquiry
email-id: "550e8400-e29b-41d4-a716-446655440000"
sender: "user@example.com"
sender-name: "John Doe"
subject: "Question about feature X"
date: 2025-09-05T10:30:00Z
status: pending
tags: [support, feature-request]
category: support
thread-id: "thread-123"
priority: medium
attachments: 
  - filename: "screenshot.png"
    size: 45678
related-emails: ["id1", "id2"]
knowledge-entries: ["kb-001"]
resolution-note: "resolution-123"
---
```

### Knowledge Entry Frontmatter
```yaml
---
type: knowledge-entry
knowledge-id: "kb-001"
title: "How to resolve feature X issues"
created: 2025-09-01T09:00:00Z
updated: 2025-09-05T11:00:00Z
tags: [feature-x, troubleshooting]
category: technical
source-emails: ["email-001", "email-002"]
use-count: 15
effectiveness: 85
---
```

## Validation Rules

### EmailInquiry Validation
- `id`: Required, must be valid UUID v4
- `sender`: Required, must be valid email format
- `subject`: Required, max 200 characters
- `receivedDate`: Required, must be valid ISO 8601
- `status`: Required, must be valid enum value
- `tags`: Optional, max 10 tags per email
- `body`: Required, non-empty

### DailySummary Validation
- `date`: Required, must be valid date
- `emailCount`: Required, non-negative integer
- Generated dynamically, not stored

### KnowledgeEntry Validation
- `title`: Required, max 100 characters
- `problem`: Required, max 500 characters
- `solution`: Required, non-empty
- `sourceEmails`: Required, at least one email
- `useCount`: Required, non-negative integer

### ResolutionNote Validation
- `emailId`: Required, must reference existing email
- `summary`: Required, max 200 characters
- `outcome`: Required, valid enum value
- `followUpDate`: If provided, must be future date

## State Transitions

### Email Status Flow
```
PENDING → IN_PROGRESS → RESOLVED → ARCHIVED
   ↓          ↓            ↓
ARCHIVED   ARCHIVED    (terminal)
```

### Rules:
1. New emails start as PENDING
2. Can transition to ARCHIVED from any state
3. RESOLVED emails can be reopened to IN_PROGRESS
4. ARCHIVED is terminal unless manually changed

## Indexing Strategy

### Primary Indexes
1. **Date Index**: Emails by received date for daily summaries
2. **Sender Index**: Emails by sender for relationship tracking
3. **Thread Index**: Emails by thread ID for conversation view
4. **Tag Index**: Emails by tags for categorization
5. **Status Index**: Emails by status for workflow

### Search Optimization
- Frontmatter fields indexed by Obsidian
- Full-text search on email body
- Cached aggregations for summaries
- Incremental updates on changes

## Data Migration

### Version 1.0.0 → Future
- Frontmatter schema versioning
- Backward compatibility for 2 major versions
- Migration scripts for structure changes
- Backup before migration

## Performance Considerations

### Limits
- Max 10,000 emails per vault (soft limit)
- Max 100 emails per day recommended
- Max 50 emails per thread
- Summary cache: 5 minutes TTL
- Index rebuild: Incremental on change

### Optimization
- Lazy load email content
- Paginate lists (50 items per page)
- Background indexing for bulk imports
- Compress old emails (>1 year)

## Security & Privacy

### Sensitive Data
- Email addresses: Stored as-is (user responsibility)
- Email content: Not encrypted (vault encryption recommended)
- Attachments: Stored in vault (same security as notes)

### Best Practices
- Regular vault backups
- Sanitize emails before import
- Use vault encryption for sensitive data
- Limit plugin permissions