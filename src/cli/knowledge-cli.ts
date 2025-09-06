#!/usr/bin/env node

/**
 * Knowledge Base CLI
 *
 * Command-line interface for searching and extracting knowledge from email inquiries.
 */

import * as fs from 'fs';
// import { EmailInquiryModel } from '../models/EmailInquiry'; // Unused

interface KnowledgeOptions {
  query?: string;
  extract?: string;
  input?: string;
  output?: string;
  format: 'json' | 'markdown';
  limit: number;
  help: boolean;
  version: boolean;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  problem: string;
  solution: string;
  sourceEmails: string[];
  tags: string[];
  createdAt: Date;
}

class KnowledgeBaseCli {
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
          stdout: `knowledge-base v${this.version}\n`,
          stderr: ''
        };
      }

      let result: string = '';

      if (options.query) {
        result = await this.searchKnowledge(options.query, options);
      } else if (options.extract) {
        result = await this.extractKnowledge(options.extract, options);
      } else {
        throw new Error('Either --search or --extract is required');
      }

      if (options.output) {
        fs.writeFileSync(options.output, result);
        return {
          exitCode: 0,
          stdout: `Result written to ${options.output}\n`,
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

  private parseArguments(args: string[]): KnowledgeOptions {
    const options: KnowledgeOptions = {
      format: 'markdown',
      limit: 10,
      help: false,
      version: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--search':
        case '-s':
          options.query = args[++i];
          break;
        case '--extract':
        case '-e':
          options.extract = args[++i];
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
        case '-f': {
          const format = args[++i];
          if (['json', 'markdown'].includes(format)) {
            options.format = format as 'json' | 'markdown';
          } else {
            throw new Error(`Invalid format: ${format}`);
          }
          break;
        }
        case '--limit':
        case '-l':
          options.limit = parseInt(args[++i]);
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

  private async searchKnowledge(query: string, options: KnowledgeOptions): Promise<string> {
    // Placeholder - in real implementation would search knowledge base
    const results: KnowledgeEntry[] = [];

    const searchResults = {
      query,
      results: results.slice(0, options.limit),
      totalCount: results.length
    };

    return this.formatSearchResults(searchResults, options.format);
  }

  private async extractKnowledge(emailId: string, options: KnowledgeOptions): Promise<string> {
    // Placeholder - in real implementation would extract knowledge from resolved email
    const knowledgeEntry: KnowledgeEntry = {
      id: this.generateId(),
      title: 'Extracted Knowledge Entry',
      problem: 'Problem description extracted from email',
      solution: 'Solution details from resolution',
      sourceEmails: [emailId],
      tags: [],
      createdAt: new Date()
    };

    return this.formatKnowledgeEntry(knowledgeEntry, options.format);
  }

  private formatSearchResults(results: any, format: 'json' | 'markdown'): string { // eslint-disable-line @typescript-eslint/no-explicit-any
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);

      case 'markdown': {
        const lines = [
          `# Knowledge Search Results`,
          '',
          `**Query**: ${results.query}`,
          `**Found**: ${results.totalCount} results`,
          ''
        ];

        if (results.results.length === 0) {
          lines.push('No results found.');
        } else {
          results.results.forEach((entry: KnowledgeEntry, index: number) => {
            lines.push(`## ${index + 1}. ${entry.title}`);
            lines.push('');
            lines.push(`**Problem**: ${entry.problem}`);
            lines.push(`**Solution**: ${entry.solution}`);
            lines.push(`**Tags**: ${entry.tags.join(', ')}`);
            lines.push('');
          });
        }

        return lines.join('\n');
      }

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private formatKnowledgeEntry(entry: KnowledgeEntry, format: 'json' | 'markdown'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(entry, null, 2);

      case 'markdown':
        return [
          '---',
          `id: "${entry.id}"`,
          `title: "${entry.title}"`,
          `sourceEmails:`,
          ...entry.sourceEmails.map(id => `  - "${id}"`),
          `tags:`,
          ...entry.tags.map(tag => `  - "${tag}"`),
          `createdAt: "${entry.createdAt.toISOString()}"`,
          '---',
          '',
          `# ${entry.title}`,
          '',
          '## Problem',
          '',
          entry.problem,
          '',
          '## Solution',
          '',
          entry.solution,
          ''
        ].join('\n');

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getHelpText(): string {
    return `
knowledge-base v${this.version} - Search and extract knowledge from email inquiries

USAGE:
    knowledge-base [OPTIONS]

OPTIONS:
    -s, --search <QUERY>     Search knowledge base for given query
    -e, --extract <EMAIL_ID> Extract knowledge from resolved email
    -i, --input <PATH>       Input directory or file path
    -o, --output <FILE>      Output file path
    -f, --format <FORMAT>    Output format: json, markdown (default: markdown)
    -l, --limit <NUMBER>     Limit number of search results (default: 10)
    -h, --help               Show this help message
    -v, --version            Show version information

EXAMPLES:
    knowledge-base --search "login issues" --format markdown
    knowledge-base --extract email-123 --output knowledge.md
    knowledge-base --search "payment" --limit 5 --format json

COMMANDS:
    search      Search the knowledge base for relevant entries
    extract     Extract knowledge from a resolved email inquiry
`;
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new KnowledgeBaseCli();
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

export { KnowledgeBaseCli };
