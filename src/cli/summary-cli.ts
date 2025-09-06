#!/usr/bin/env node

/**
 * Daily Summary CLI
 * 
 * Command-line interface for generating daily summaries of email inquiries.
 */

import * as fs from 'fs';
import { EmailInquiryModel } from '../models/EmailInquiry';
import { EmailStatus } from '../types/enums';

interface SummaryOptions {
  date?: string;
  input?: string;
  output?: string;
  format: 'json' | 'markdown' | 'csv';
  includeResolved: boolean;
  includeArchived: boolean;
  help: boolean;
  version: boolean;
}

class DailySummaryCli {
  private version = '1.0.0';

  async run(args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
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
          stdout: `daily-summary v${this.version}\n`,
          stderr: ''
        };
      }

      const date = options.date || new Date().toISOString().split('T')[0];
      const emails = await this.loadEmails(options.input);
      const summary = this.generateSummary(emails, date, options);
      
      const output = this.formatOutput(summary, options.format);
      
      if (options.output) {
        fs.writeFileSync(options.output, output);
        return {
          exitCode: 0,
          stdout: `Summary written to ${options.output}\n`,
          stderr: ''
        };
      } else {
        return {
          exitCode: 0,
          stdout: output,
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

  private parseArguments(args: string[]): SummaryOptions {
    const options: SummaryOptions = {
      format: 'markdown',
      includeResolved: false,
      includeArchived: false,
      help: false,
      version: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--date':
        case '-d':
          options.date = args[++i];
          break;
        case '--input':
        case '-i':
          options.input = args[++i];
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--format':
        case '-f':
          const format = args[++i];
          if (['json', 'markdown', 'csv'].includes(format)) {
            options.format = format as 'json' | 'markdown' | 'csv';
          } else {
            throw new Error(`Invalid format: ${format}`);
          }
          break;
        case '--include-resolved':
          options.includeResolved = true;
          break;
        case '--include-archived':
          options.includeArchived = true;
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

  private async loadEmails(inputPath?: string): Promise<EmailInquiryModel[]> {
    // Placeholder - in real implementation would load emails from vault or files
    return [];
  }

  private generateSummary(emails: EmailInquiryModel[], date: string, options: SummaryOptions) {
    const filteredEmails = emails.filter(email => {
      const emailDate = email.receivedDate.toISOString().split('T')[0];
      if (emailDate !== date) return false;
      
      if (!options.includeResolved && email.status === EmailStatus.RESOLVED) {
        return false;
      }
      
      if (!options.includeArchived && email.status === EmailStatus.ARCHIVED) {
        return false;
      }
      
      return true;
    });

    const statusBreakdown = {
      pending: filteredEmails.filter(e => e.status === EmailStatus.PENDING).length,
      inProgress: filteredEmails.filter(e => e.status === EmailStatus.IN_PROGRESS).length,
      resolved: filteredEmails.filter(e => e.status === EmailStatus.RESOLVED).length,
      archived: filteredEmails.filter(e => e.status === EmailStatus.ARCHIVED).length,
    };

    const categoryBreakdown: Record<string, number> = {};
    filteredEmails.forEach(email => {
      if (email.category) {
        categoryBreakdown[email.category] = (categoryBreakdown[email.category] || 0) + 1;
      }
    });

    return {
      date,
      emailCount: filteredEmails.length,
      emails: filteredEmails,
      statusBreakdown,
      categoryBreakdown,
      generatedAt: new Date()
    };
  }

  private formatOutput(summary: any, format: 'json' | 'markdown' | 'csv'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(summary, null, 2);
        
      case 'markdown':
        return this.toMarkdown(summary);
        
      case 'csv':
        return this.toCSV(summary);
        
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private toMarkdown(summary: any): string {
    const lines = [
      `# Daily Summary - ${summary.date}`,
      '',
      `**Generated**: ${summary.generatedAt}`,
      `**Total Emails**: ${summary.emailCount}`,
      '',
      '## Status Breakdown',
      `- Pending: ${summary.statusBreakdown.pending}`,
      `- In Progress: ${summary.statusBreakdown.inProgress}`,
      `- Resolved: ${summary.statusBreakdown.resolved}`,
      `- Archived: ${summary.statusBreakdown.archived}`,
      '',
      '## Category Breakdown',
    ];

    Object.entries(summary.categoryBreakdown).forEach(([category, count]) => {
      lines.push(`- ${category}: ${count}`);
    });

    if (summary.emails.length > 0) {
      lines.push('', '## Email List');
      summary.emails.forEach((email: EmailInquiryModel) => {
        const time = email.receivedDate.toTimeString().substring(0, 5);
        lines.push(`- ${time} - ${email.sender}: ${email.subject}`);
      });
    }

    return lines.join('\n');
  }

  private toCSV(summary: any): string {
    const header = 'Time,Sender,Subject,Status,Category\n';
    const rows = summary.emails.map((email: EmailInquiryModel) => {
      const time = email.receivedDate.toTimeString().substring(0, 5);
      return `${time},"${email.sender}","${email.subject}",${email.status},${email.category || ''}`;
    });
    return header + rows.join('\n');
  }

  private getHelpText(): string {
    return `
daily-summary v${this.version} - Generate daily summaries of email inquiries

USAGE:
    daily-summary [OPTIONS]

OPTIONS:
    -d, --date <DATE>        Date in YYYY-MM-DD format (default: today)
    -i, --input <PATH>       Input directory or file path
    -o, --output <FILE>      Output file path
    -f, --format <FORMAT>    Output format: json, markdown, csv (default: markdown)
    --include-resolved       Include resolved emails in summary
    --include-archived       Include archived emails in summary
    -h, --help               Show this help message
    -v, --version            Show version information

EXAMPLES:
    daily-summary --date 2023-09-05 --format markdown
    daily-summary --input ./emails --output summary.md
    daily-summary --include-resolved --format csv
`;
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new DailySummaryCli();
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

export { DailySummaryCli };