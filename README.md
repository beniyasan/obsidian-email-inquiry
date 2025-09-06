# 📧 Email Inquiry Management Plugin for Obsidian

![Plugin Version](https://img.shields.io/badge/version-1.0.0-blue)
![Obsidian Version](https://img.shields.io/badge/obsidian-%3E%3D1.4.0-purple)
![License](https://img.shields.io/badge/license-MIT-green)

A powerful Obsidian plugin for capturing, organizing, and building knowledge from email inquiries with full Japanese language support. Transform your email support workflow into a searchable knowledge base.

## ✨ Features

### 📧 Email Capture
- **One-click email capture** with rich modal interface
- **Automatic metadata extraction** (sender, subject, date, attachments)
- **Smart categorization** with 4 default categories:
  - **Specification** (仕様) - Requirements, specs, design consultations
  - **Issue** (障害) - Bug reports, system failures
  - **Migration/VUP** (移行/VUP) - System migration, version upgrades
  - **Other** (その他) - General inquiries
- **Custom categories** - Add unlimited custom categories
- **Priority assignment** (Low, Medium, High, Urgent)
- **Tag management** with auto-completion
- **File organization** by date (YYYY/MM structure)

### 🌍 Multi-language Support
- **Full Japanese language support** (日本語完全対応)
- **English interface**
- **Real-time language switching**
- **Localized commands and menus**

### 📊 Daily Summaries
- **Automated daily reports** with status breakdowns
- **Category and priority analysis** 
- **Peak hours identification**
- **Keyword trend analysis**
- **Export options** (Markdown, CSV, JSON)

### 🔍 Knowledge Base
- **Auto-extract solutions** from resolved emails
- **Searchable knowledge repository**
- **Related email linking**
- **Solution effectiveness tracking**

### 🛠️ CLI Tools
- **Email parser CLI** for batch processing (EML, MBOX, CSV)
- **Summary generator CLI** for automated reporting
- **Knowledge extractor CLI** for solution mining

## 🚀 Installation

### Method 1: Manual Installation (Recommended for Testing)

1. **Download the plugin files:**
   - Download `main.js` and `manifest.json` from releases
   
2. **Create plugin directory:**
   ```bash
   # Navigate to your Obsidian vault
   mkdir -p .obsidian/plugins/email-inquiry-management
   ```

3. **Copy plugin files:**
   ```bash
   # Copy the files to the plugin directory
   cp main.js .obsidian/plugins/email-inquiry-management/
   cp manifest.json .obsidian/plugins/email-inquiry-management/
   ```

4. **Enable the plugin:**
   - Restart Obsidian
   - Go to Settings → Community Plugins
   - Enable "Email Inquiry Management"

### Method 2: BRAT (Beta Reviewer's Auto-update Tool)

1. Install BRAT plugin from Community Plugins
2. Add this repository URL in BRAT settings
3. Install and enable the plugin

## 📖 Usage Guide

### 🎯 Quick Start

1. **Capture your first email:**
   - Press `Ctrl+P` (Command Palette)
   - Type "Capture Email" and press Enter
   - Or click the 📧 ribbon icon

2. **Fill in email details:**
   - **Sender Email** (required): customer@example.com
   - **Sender Name** (optional): John Customer
   - **Subject** (required): Login Issue - Cannot Access Dashboard
   - **Category**: Support
   - **Priority**: Medium
   - **Tags**: login-issue, dashboard, urgent
   - **Email Content**: Paste the email body

3. **Click "Capture Email"** - Done! ✅

### 📂 File Organization

Your emails will be automatically organized as:

```
Emails/
└── 2024/
    └── 09/
        ├── 05-14-30-login-issue-cannot-access-dashboard.md
        ├── 05-15-45-billing-question-invoice-payment.md
        └── ...

Summaries/
├── 2024-09-05-daily-summary.md
├── 2024-09-06-daily-summary.md
└── ...

Knowledge/
├── login-troubleshooting-guide.md
├── payment-processing-solutions.md
└── ...
```

### 📋 Email Note Format

Each captured email becomes a structured note:

```markdown
---
id: "email-123-456-789"
sender: "customer@example.com"
senderName: "John Customer"
subject: "Login Issue - Cannot Access Dashboard"
receivedDate: "2024-09-05T14:30:00+09:00"
status: "pending"
tags: ["login-issue", "dashboard", "support"]
category: "support"
priority: "medium"
---

# Login Issue - Cannot Access Dashboard

**From:** John Customer <customer@example.com>
**Date:** 2024-09-05T14:30:00+09:00
**Status:** pending

## Content

Hello Support Team,

I'm having trouble logging into my dashboard...

## Notes

<!-- Add your resolution notes here -->
```

### 📊 Generate Daily Summary

1. **Manual generation:**
   - Command Palette → "Generate Daily Summary"
   - Or use the settings to enable auto-generation

2. **Summary includes:**
   - Total email count and status breakdown
   - Category and priority distribution
   - Peak hour analysis
   - Top senders and keywords
   - Chronological email timeline

### 🔍 Knowledge Extraction

1. **Mark email as resolved:**
   - Update the `status` field to "resolved"
   - Add resolution details in the "Notes" section

2. **Extract knowledge:**
   - Command Palette → "Extract Knowledge"
   - Select the resolved email
   - System creates a reusable knowledge entry

### 📚 CLI Tools Usage

#### Email Parser CLI

```bash
# Parse EML file to JSON
npm run cli:email-parser -- --input email.eml --format json

# Parse MBOX to Markdown
npm run cli:email-parser -- --input mailbox.mbox --format markdown --output parsed.md

# Show help
npm run cli:email-parser -- --help
```

#### Daily Summary CLI

```bash
# Generate today's summary
npm run cli:daily-summary -- --format markdown

# Generate specific date summary
npm run cli:daily-summary -- --date 2024-09-05 --output summary.md

# Include resolved emails
npm run cli:daily-summary -- --include-resolved --format csv
```

#### Knowledge Base CLI

```bash
# Search knowledge base
npm run cli:knowledge-base -- --search "login issues"

# Extract knowledge from resolved email
npm run cli:knowledge-base -- --extract email-123 --output knowledge.md
```

## ⚙️ Configuration

### Plugin Settings

Access plugin settings via: **Settings → Email Inquiry Management**

#### Folder Settings
- **Emails Folder**: `Emails` (where captured emails are stored)
- **Summaries Folder**: `Summaries` (where daily summaries are saved)
- **Knowledge Folder**: `Knowledge` (where extracted knowledge is stored)

#### Default Values
- **Default Category**: Support, Sales, Billing, Technical, Feedback, Other
- **Default Priority**: Low, Medium, High, Urgent

#### Automation
- **Auto-generate Daily Summaries**: ✅ Enabled
- **Auto-extract Knowledge**: ❌ Disabled (manual review recommended)

#### File Handling
- **Max Attachment Size**: 10MB
- **Enable Notifications**: ✅ Enabled

### Advanced Configuration

#### Custom Categories

Edit the plugin settings to add custom categories:

```json
{
  "categories": [
    "support",
    "sales", 
    "billing",
    "technical",
    "feedback",
    "bug-report",
    "feature-request",
    "other"
  ]
}
```

#### Workflow Automation

Set up automated workflows using Obsidian's Templater plugin:

1. **Auto-tagging** based on email content
2. **Smart categorization** using keywords
3. **Priority assignment** based on sender or keywords
4. **Follow-up reminders** for pending emails

## 🎨 Customization

### Custom CSS Styling

Add to your `snippets/email-inquiry.css`:

```css
/* Email status indicators */
.email-status-pending { color: #ffa500; }
.email-status-resolved { color: #28a745; }
.email-status-archived { color: #6c757d; }

/* Priority badges */
.priority-urgent { 
  background: #dc3545; 
  color: white; 
  padding: 2px 6px; 
  border-radius: 3px; 
}

.priority-high { 
  background: #fd7e14; 
  color: white; 
  padding: 2px 6px; 
  border-radius: 3px; 
}
```

### Custom Templates

Create templates in `.obsidian/plugins/email-inquiry-management/templates/`:

```markdown
<!-- email-template.md -->
---
id: "{{id}}"
sender: "{{sender}}"
subject: "{{subject}}"
status: "pending"
tags: []
category: ""
priority: "medium"
---

# {{subject}}

**From:** {{sender}}
**Date:** {{date}}

## Content

{{content}}

## Action Items

- [ ] Initial response sent
- [ ] Issue reproduced
- [ ] Solution implemented
- [ ] Follow-up scheduled

## Notes

<!-- Resolution details -->
```

## 🤝 Workflow Examples

### Customer Support Workflow

1. **Email arrives** → Capture with plugin
2. **Auto-categorize** as "support"
3. **Assign priority** based on keywords
4. **Add initial tags** (bug, feature-request, etc.)
5. **Work on resolution** → Update notes section
6. **Mark as resolved** → Auto-extract to knowledge base
7. **Review daily summary** → Identify patterns

### Sales Inquiry Workflow

1. **Lead email** → Capture as "sales" category
2. **High priority** → Tag with "hot-lead"
3. **Track follow-ups** → Update status to "in_progress"
4. **Close deal** → Mark as "resolved"
5. **Extract best practices** → Add to knowledge base

### Bug Report Workflow

1. **Bug report email** → Capture with "technical" category
2. **Tag with severity** → "critical", "minor", etc.
3. **Link to related emails** → Use email ID references
4. **Document solution** → Detailed resolution notes
5. **Create knowledge entry** → Reusable troubleshooting guide

## 📈 Analytics & Reporting

### Built-in Metrics

- **Response time tracking** (planned feature)
- **Resolution rate by category**
- **Peak support hours**
- **Most common issues**
- **Team performance metrics** (multi-user setups)

### Custom Queries

Use Obsidian's Dataview plugin for custom reports:

```dataview
TABLE sender, subject, status, priority
FROM "Emails"
WHERE status = "pending" AND priority = "urgent"
SORT receivedDate DESC
```

```dataview
TABLE status, count(rows) as "Count"
FROM "Emails" 
WHERE receivedDate >= date(today) - dur(7 days)
GROUP BY status
```

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd email-inquiry-management

# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test

# Development mode (with hot reload)
npm run dev
```

### Project Structure

```
src/
├── models/           # Data models (EmailInquiry, DailySummary, etc.)
├── services/         # Business logic services
├── plugin/           # Obsidian plugin integration
│   ├── adapters/     # Obsidian API adapters
│   ├── modals/       # UI modals and forms
│   └── settings/     # Plugin settings
├── cli/              # Command-line tools
├── lib/              # Standalone libraries
└── types/            # TypeScript type definitions

tests/
├── contract/         # Contract tests (TDD approach)
├── integration/      # Integration tests
└── unit/             # Unit tests
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TDD approach (write tests first)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

#### Plugin Not Loading

1. **Check Obsidian version** (requires ≥1.4.0)
2. **Verify files** (`main.js` and `manifest.json` in plugin folder)
3. **Restart Obsidian** after installation
4. **Enable in settings** (Community Plugins → Email Inquiry Management)

#### Email Capture Fails

1. **Check required fields** (sender, subject, body)
2. **Verify email format** (valid email address)
3. **Check folder permissions** (Emails folder writable)
4. **Review error notifications** in Obsidian

#### Daily Summary Empty

1. **Verify email date format** (YYYY-MM-DD in frontmatter)
2. **Check include settings** (resolved/archived emails)
3. **Confirm email folder structure** (Emails/YYYY/MM/)

#### CLI Tools Not Working

1. **Install dependencies**: `npm install`
2. **Build project**: `npm run build`
3. **Check Node.js version** (≥18.0.0)
4. **Verify file paths** in commands

### Debug Mode

Enable debug logging in plugin settings for detailed error information:

```javascript
// Add to Obsidian console (Ctrl+Shift+I)
localStorage.setItem('email-inquiry-debug', 'true');
```

### Performance Optimization

For large email volumes (>1000 emails):

1. **Enable caching** in plugin settings
2. **Archive old emails** regularly
3. **Use date-range filtering** in summaries
4. **Split large MBOX files** before import

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- Inspired by customer support best practices
- Email parsing powered by industry-standard libraries
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)  
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Discord**: [Community Discord](https://discord.gg/your-channel)

---

**Made with ❤️ for the Obsidian community**

*Transform your email chaos into organized knowledge. Start building your email inquiry knowledge base today!*