# CLI Command Contracts

## Email Parser CLI

### Command: email-parser
Parse and structure email content for Obsidian notes.

```bash
email-parser --help
email-parser --version
email-parser parse [options]
```

#### Options:
- `--input, -i <file>`: Input email file (.eml, .msg)
- `--format, -f <format>`: Output format (json|markdown|yaml) [default: json]
- `--extract-attachments`: Extract and save attachments
- `--output, -o <file>`: Output file path
- `--preserve-html`: Keep HTML formatting

#### Input (stdin or file):
```
Raw email content or file path
```

#### Output (stdout):
```json
{
  "sender": "user@example.com",
  "senderName": "John Doe",
  "subject": "Email Subject",
  "date": "2025-09-05T10:30:00Z",
  "body": "Email content in markdown",
  "attachments": [
    {
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 102400
    }
  ]
}
```

#### Exit Codes:
- 0: Success
- 1: Invalid input format
- 2: File not found
- 3: Parse error

## Daily Summary CLI

### Command: daily-summary
Generate daily email summaries for Obsidian.

```bash
daily-summary --help
daily-summary --version
daily-summary generate [options]
```

#### Options:
- `--date, -d <date>`: Date to summarize (YYYY-MM-DD) [default: today]
- `--vault, -v <path>`: Obsidian vault path
- `--format, -f <format>`: Output format (json|markdown|html) [default: markdown]
- `--include-resolved`: Include resolved emails
- `--include-archived`: Include archived emails
- `--output, -o <file>`: Output file path

#### Input:
Reads from Obsidian vault at specified path

#### Output (stdout):
```markdown
# Daily Summary: 2025-09-05

## Overview
- Total Emails: 15
- Pending: 5
- In Progress: 3
- Resolved: 7

## By Category
- Support: 8
- Sales: 4
- Technical: 3

## Emails
1. **10:30** - user@example.com - "Question about feature" [pending]
2. **11:45** - customer@company.com - "Invoice inquiry" [resolved]
...
```

#### Exit Codes:
- 0: Success
- 1: Invalid date format
- 2: Vault not found
- 3: No emails found for date

## Knowledge Base CLI

### Command: knowledge-base
Search and manage knowledge entries.

```bash
knowledge-base --help
knowledge-base --version
knowledge-base search [options]
knowledge-base extract [options]
```

### Subcommand: search
Search knowledge base for solutions.

#### Options:
- `--query, -q <text>`: Search query
- `--tags, -t <tags>`: Filter by tags (comma-separated)
- `--category, -c <category>`: Filter by category
- `--vault, -v <path>`: Obsidian vault path
- `--format, -f <format>`: Output format (json|markdown|list) [default: json]
- `--limit, -l <number>`: Max results [default: 10]

#### Output (stdout):
```json
{
  "results": [
    {
      "id": "kb-001",
      "title": "How to resolve feature X",
      "problem": "Feature X not working",
      "solution": "Steps to fix...",
      "score": 0.95,
      "path": "Knowledge/technical/kb-001.md"
    }
  ],
  "totalCount": 1
}
```

### Subcommand: extract
Extract knowledge from resolved email.

#### Options:
- `--email-id, -e <id>`: Email ID to extract from
- `--vault, -v <path>`: Obsidian vault path
- `--title, -t <title>`: Knowledge entry title
- `--tags <tags>`: Tags for entry (comma-separated)

#### Input (stdin):
```json
{
  "problem": "Description of issue",
  "solution": "How it was resolved",
  "notes": "Additional context"
}
```

#### Output (stdout):
```json
{
  "knowledgeId": "kb-002",
  "path": "Knowledge/kb-002.md",
  "linkedEmails": ["email-001"]
}
```

#### Exit Codes:
- 0: Success
- 1: Invalid input
- 2: Vault not found
- 3: Email not found
- 4: Extraction failed

## Common CLI Conventions

### Global Options (all commands):
- `--help, -h`: Show help message
- `--version, -V`: Show version number
- `--verbose, -v`: Verbose output
- `--quiet, -q`: Suppress non-error output
- `--config, -c <file>`: Config file path

### Output Formats:
- `json`: Machine-readable JSON
- `markdown`: Human-readable Markdown
- `yaml`: YAML format
- `list`: Simple text list
- `html`: HTML format (for display)

### Environment Variables:
- `OBSIDIAN_VAULT`: Default vault path
- `EMAIL_INQUIRY_CONFIG`: Default config file
- `LOG_LEVEL`: Logging level (debug|info|warn|error)

### Configuration File:
```yaml
vault: /path/to/vault
defaults:
  format: markdown
  includeResolved: true
  includeArchived: false
  summaryCache: 300  # seconds
email:
  maxAttachmentSize: 10485760  # 10MB
  preserveHtml: false
knowledge:
  autoExtract: true
  minEffectiveness: 70
```

### Error Output Format:
```json
{
  "error": {
    "code": "PARSE_ERROR",
    "message": "Failed to parse email",
    "details": {
      "line": 42,
      "reason": "Invalid header format"
    }
  }
}
```