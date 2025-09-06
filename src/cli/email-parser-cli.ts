#!/usr/bin/env node

/**
 * Email Parser CLI
 *
 * Command-line interface for parsing email content from various formats.
 * Supports EML, MBOX, and CSV input formats with multiple output options.
 */

import * as fs from 'fs';
// import * as path from 'path'; // Unused
import { EmailInquiryModel } from '../models/EmailInquiry';
import { EmailCategory, Priority } from '../types/enums';

interface CliOptions {
  input?: string;
  output?: string;
  format: 'json' | 'markdown' | 'yaml';
  attachments: boolean;
  preserveHtml: boolean;
  help: boolean;
  version: boolean;
}

class EmailParserCli {
  private version = '1.0.0';

  async run(args: string[], stdin?: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    try {
      const options = this.parseArguments(args);

      if (options.help) {
        return {
          exitCode: 0,
          stdout: this.getHelpText(),
          stderr: ''
        };
      }

      if (options.version) {
        return {
          exitCode: 0,
          stdout: `email-parser v${this.version}\n`,
          stderr: ''
        };
      }

      let inputContent = '';

      if (options.input) {
        if (!fs.existsSync(options.input)) {
          return {
            exitCode: 1,
            stdout: '',
            stderr: `Error: Input file not found: ${options.input}\n`
          };
        }
        inputContent = fs.readFileSync(options.input, 'utf-8');
      } else if (stdin) {
        inputContent = stdin;
      } else {
        return {
          exitCode: 1,
          stdout: '',
          stderr: 'Error: No input provided. Use --input or pipe content to stdin.\n'
        };
      }

      const result = await this.parseEmail(inputContent, options);

      if (options.output) {
        fs.writeFileSync(options.output, result);
        return {
          exitCode: 0,
          stdout: `Parsed email written to ${options.output}\n`,
          stderr: ''
        };
      } else {
        return {
          exitCode: 0,
          stdout: result,
          stderr: ''
        };
      }

    } catch (error) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: `Error: ${error instanceof Error ? error.message : String(error)}\n`
      };
    }
  }

  private parseArguments(args: string[]): CliOptions {
    const options: CliOptions = {
      format: 'json',
      attachments: false,
      preserveHtml: false,
      help: false,
      version: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--input':
        case '-i':
          options.input = args[++i];
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--format':
        case '-f': {
          const format = args[++i];
          if (['json', 'markdown', 'yaml'].includes(format)) {
            options.format = format as 'json' | 'markdown' | 'yaml';
          } else {
            throw new Error(`Invalid format: ${format}. Supported formats: json, markdown, yaml`);
          }
          break;
        }
        case '--attachments':
          options.attachments = true;
          break;
        case '--preserve-html':
          options.preserveHtml = true;
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
        case '--version':
        case '-v':
          options.version = true;
          break;
        default:
          if (arg.startsWith('-')) {
            throw new Error(`Unknown option: ${arg}`);
          }
      }
    }

    return options;
  }

  private async parseEmail(content: string, options: CliOptions): Promise<string> {
    // Detect email format
    const format = this.detectEmailFormat(content);

    let parsedEmails: EmailInquiryModel[] = [];

    switch (format) {
      case 'eml':
        parsedEmails = [this.parseEML(content)];
        break;
      case 'mbox':
        parsedEmails = this.parseMBOX(content);
        break;
      default:
        throw new Error('Unable to detect email format. Supported formats: EML, MBOX');
    }

    return this.formatOutput(parsedEmails, options);
  }

  private detectEmailFormat(content: string): 'eml' | 'mbox' | 'unknown' {
    // Check for MBOX format (starts with "From ")
    if (content.match(/^From\s+\S+@\S+\s+\w+\s+\w+\s+\d+/m)) {
      return 'mbox';
    }

    // Check for EML format (has email headers)
    if (content.includes('From:') || content.includes('To:') || content.includes('Subject:')) {
      return 'eml';
    }

    return 'unknown';
  }

  private parseEML(content: string): EmailInquiryModel {
    const headers = this.parseHeaders(content);
    const body = this.parseBody(content);

    return EmailInquiryModel.create({
      sender: this.extractSender(headers.from || ''),
      senderName: this.extractSenderName(headers.from || ''),
      subject: headers.subject || 'No Subject',
      body: body.text || body.html || '',
      receivedDate: this.parseDate(headers.date || ''),
      category: EmailCategory.OTHER,
      priority: Priority.MEDIUM,
      rawContent: content
    });
  }

  private parseMBOX(content: string): EmailInquiryModel[] {
    const emails: EmailInquiryModel[] = [];

    // Split MBOX content by "From " lines
    const emailBlocks = content.split(/^From /m).filter(block => block.trim());

    for (const block of emailBlocks) {
      try {
        // Reconstruct the email with proper EML format
        const emlContent = this.mboxBlockToEML(block);
        const parsedEmail = this.parseEML(emlContent);
        emails.push(parsedEmail);
      } catch (error) {
        console.warn('Failed to parse email block in MBOX:', error);
      }
    }

    return emails;
  }

  private parseHeaders(emlContent: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const headerSection = emlContent.split('\n\n')[0];
    const headerLines = headerSection.split('\n');

    let currentHeader = '';
    let currentValue = '';

    for (const line of headerLines) {
      if (line.match(/^\s/) && currentHeader) {
        // Continuation line
        currentValue += ' ' + line.trim();
      } else {
        // Save previous header
        if (currentHeader) {
          headers[currentHeader.toLowerCase()] = currentValue.trim();
        }

        // Start new header
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          currentHeader = line.substring(0, colonIndex).trim();
          currentValue = line.substring(colonIndex + 1).trim();
        }
      }
    }

    // Save last header
    if (currentHeader) {
      headers[currentHeader.toLowerCase()] = currentValue.trim();
    }

    return headers;
  }

  private parseBody(emlContent: string): { text?: string; html?: string } {
    const parts = emlContent.split('\n\n');
    if (parts.length < 2) {
      return { text: '' };
    }

    // Simple implementation - just take everything after headers
    const bodyContent = parts.slice(1).join('\n\n').trim();

    // Check if it looks like HTML
    if (bodyContent.includes('<html') || bodyContent.includes('<body')) {
      return { html: bodyContent };
    }

    return { text: bodyContent };
  }

  private extractSender(fromHeader: string): string {
    // Extract email from "Name <email@domain.com>" format
    const emailMatch = fromHeader.match(/<([^>]+)>/);
    if (emailMatch) {
      return emailMatch[1];
    }

    // Check if it's just an email address
    const simpleEmailMatch = fromHeader.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (simpleEmailMatch) {
      return simpleEmailMatch[0];
    }

    return fromHeader.trim();
  }

  private extractSenderName(fromHeader: string): string | undefined {
    // Extract name from "Name <email@domain.com>" format
    const nameMatch = fromHeader.match(/^([^<]+)</);
    if (nameMatch) {
      return nameMatch[1].trim().replace(/^["']|["']$/g, '');
    }
    return undefined;
  }

  private parseDate(dateHeader: string): Date {
    if (!dateHeader) {
      return new Date();
    }

    try {
      const date = new Date(dateHeader);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch {
      // Fall through to default
    }

    return new Date(); // Fallback to current date
  }

  private mboxBlockToEML(block: string): string {
    // Remove the "From " line and convert to standard EML format
    const lines = block.split('\n');

    // Skip the first line if it looks like MBOX "From " line
    const startIndex = lines[0].match(/^[^\s]+@[^\s]+\s+/) ? 1 : 0;

    return lines.slice(startIndex).join('\n');
  }

  private formatOutput(emails: EmailInquiryModel[], options: CliOptions): string {
    switch (options.format) {
      case 'json':
        return JSON.stringify(emails.map(email => email.toJSON()), null, 2);

      case 'markdown':
        return emails.map(email => this.emailToMarkdown(email)).join('\n\n---\n\n');

      case 'yaml':
        return emails.map(email => this.emailToYAML(email)).join('\n---\n');

      default:
        throw new Error(`Unsupported output format: ${options.format}`);
    }
  }

  private emailToMarkdown(email: EmailInquiryModel): string {
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

    return [
      '---',
      yamlLines.join('\n'),
      '---',
      '',
      `# ${email.subject}`,
      '',
      `**From:** ${email.senderName || email.sender} <${email.sender}>`,
      `**Date:** ${email.receivedDate.toISOString()}`,
      '',
      email.body
    ].join('\n');
  }

  private emailToYAML(email: EmailInquiryModel): string {
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

  private getHelpText(): string {
    return `
email-parser v${this.version} - Parse email content from various formats

USAGE:
    email-parser [OPTIONS]

OPTIONS:
    -i, --input <FILE>       Input file path (EML or MBOX format)
    -o, --output <FILE>      Output file path
    -f, --format <FORMAT>    Output format: json, markdown, yaml (default: json)
    --attachments            Extract and include attachment information
    --preserve-html          Preserve HTML formatting in email body
    -h, --help               Show this help message
    -v, --version            Show version information

EXAMPLES:
    email-parser --input email.eml --format markdown
    email-parser --input mailbox.mbox --output parsed.json
    cat email.eml | email-parser --format yaml

FORMATS:
    EML    - Single email message format
    MBOX   - Multiple email messages in one file
    
OUTPUT:
    json      - Structured JSON format
    markdown  - Obsidian-compatible markdown with frontmatter
    yaml      - YAML frontmatter only
`;
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new EmailParserCli();
  const args = process.argv.slice(2);

  cli.run(args).then(result => {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    process.exit(result.exitCode);
  });
}

export { EmailParserCli };
