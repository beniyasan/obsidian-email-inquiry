# Quickstart Guide: Obsidian Email Inquiry Management

## Installation

1. **Install the plugin**:
   ```bash
   # Clone the repository
   git clone https://github.com/your-org/obsidian-email-inquiry.git
   cd obsidian-email-inquiry
   
   # Install dependencies
   npm install
   
   # Build the plugin
   npm run build
   
   # Copy to your vault's plugins folder
   cp -r dist/* /path/to/vault/.obsidian/plugins/email-inquiry/
   ```

2. **Enable the plugin**:
   - Open Obsidian Settings → Community Plugins
   - Enable "Email Inquiry Management"
   - Configure initial settings

## Basic Usage

### 1. Capture Your First Email

**Method A: Quick Capture (Hotkey)**
1. Copy email content from your email client
2. Press `Ctrl+Shift+E` (customizable)
3. Fill in the capture dialog:
   - Sender email (auto-detected if possible)
   - Subject line
   - Tags/Category
4. Click "Capture"

**Method B: Drag and Drop**
1. Save email as .eml file from your client
2. Drag the file into Obsidian
3. Plugin automatically creates note

**Method C: Command Palette**
1. Open Command Palette (`Ctrl+P`)
2. Type "Email: Capture new inquiry"
3. Paste content in the modal

**Result**: New note created at `Emails/2025/09/05/[id]-subject.md`

### 2. View Daily Summary

**Generate today's summary**:
1. Command Palette → "Email: Today's summary"
2. Or click calendar icon in ribbon

**View specific date**:
1. Command Palette → "Email: Generate daily summary"
2. Select date from picker
3. Summary opens in new pane

**Sample summary view**:
```markdown
# Daily Summary: September 5, 2025

## Statistics
📧 Total: 12 | ✅ Resolved: 8 | ⏳ Pending: 4

## By Category
- Support: 7
- Sales: 3
- Technical: 2

## Email Timeline
- 09:15 - john@example.com - "Login issue" [resolved]
- 10:30 - mary@company.com - "Pricing question" [pending]
...
```

### 3. Search and Build Knowledge

**Search existing knowledge**:
1. Command Palette → "Email: Search knowledge base"
2. Enter search terms
3. Browse results with relevance scores

**Extract knowledge from resolved email**:
1. Open resolved email note
2. Command Palette → "Email: Extract to knowledge base"
3. Edit the generated knowledge entry
4. Link related emails

### 4. Bulk Import Existing Emails

**Import from .mbox file**:
```bash
# Using CLI
email-parser bulk-import --format mbox --file export.mbox --vault /path/to/vault

# Or through UI
1. Settings → Email Inquiry → Import
2. Select file and format
3. Choose default tags/category
4. Click "Import"
```

## Common Workflows

### Workflow 1: Morning Email Triage
```
1. Import overnight emails (bulk or individual)
2. Generate morning summary
3. Tag and categorize new emails
4. Update status to "in_progress" for active items
5. Check yesterday's follow-ups
```

### Workflow 2: Resolve and Document
```
1. Open pending email
2. Add resolution note with solution
3. Mark as resolved
4. Extract to knowledge base if valuable
5. Set follow-up reminder if needed
```

### Workflow 3: Weekly Pattern Analysis
```
1. Generate weekly summary report
2. Review top issues and senders
3. Identify recurring problems
4. Create knowledge entries for patterns
5. Update email templates/responses
```

## Testing the Setup

### Test 1: Email Capture
```bash
# Test CLI parsing
echo "From: test@example.com
Subject: Test Email
Date: 2025-09-05 10:00:00

This is a test email body." | email-parser parse --format json

# Expected: JSON with parsed email data
```

### Test 2: Daily Summary
```bash
# Generate test summary
daily-summary generate --date 2025-09-05 --vault /path/to/vault

# Expected: Markdown summary of emails for that date
```

### Test 3: Knowledge Search
```bash
# Search knowledge base
knowledge-base search --query "login problem" --vault /path/to/vault

# Expected: Relevant knowledge entries
```

## Configuration

### Essential Settings
Edit `.obsidian/plugins/email-inquiry/data.json`:

```json
{
  "emailFolder": "Emails",
  "knowledgeFolder": "Knowledge",
  "summaryFolder": "Summaries",
  "defaultTags": ["inbox"],
  "autoExtractKnowledge": true,
  "summaryHotkey": "Ctrl+Shift+S",
  "captureHotkey": "Ctrl+Shift+E"
}
```

### Email Templates
Create `Templates/email-response.md`:

```markdown
---
tags: [response-template]
---

## Original Inquiry
{{email_subject}}
From: {{sender}}
Date: {{date}}

## Response
Dear {{sender_name}},

[Your response here]

## Internal Notes
- Category: {{category}}
- Priority: {{priority}}
- Related: {{related_emails}}
```

## Troubleshooting

### Issue: Emails not appearing in daily summary
**Solution**: Check email date in frontmatter matches expected format (ISO 8601)

### Issue: Search not finding emails
**Solution**: Rebuild search index: Command → "Email: Rebuild index"

### Issue: Bulk import fails
**Solution**: 
1. Check file format matches selection
2. Verify file size < 100MB
3. Look for malformed emails in source

### Issue: Knowledge extraction empty
**Solution**: Ensure email has resolution note before extraction

## Tips & Best Practices

1. **Use consistent tags**: Create tag hierarchy for better organization
2. **Regular summaries**: Review daily summaries for patterns
3. **Quick templates**: Set up response templates for common issues
4. **Archive old emails**: Move resolved emails > 1 year to archive
5. **Link related emails**: Use `[[email-id]]` to connect conversations
6. **Keyboard shortcuts**: Learn hotkeys for faster workflow
7. **Regular backups**: Enable vault sync or backup

## Next Steps

1. ✅ Customize settings for your workflow
2. ✅ Import existing email archive
3. ✅ Set up daily summary automation
4. ✅ Create knowledge base categories
5. ✅ Train team on workflows

## Support

- GitHub Issues: [github.com/your-org/obsidian-email-inquiry](https://github.com)
- Documentation: [Full docs](./docs/README.md)
- Community Forum: [Obsidian Forum Thread](https://forum.obsidian.md)

## CLI Quick Reference

```bash
# Parse email
email-parser parse -i email.eml -f markdown

# Generate summary
daily-summary generate -d 2025-09-05 -v /vault

# Search knowledge
knowledge-base search -q "error message" -l 10

# Extract knowledge
knowledge-base extract -e email-123 -t "How to fix X"
```