/**
 * Email Parser Library
 *
 * Standalone library for parsing email content from various formats.
 * Can be used independently of the Obsidian plugin.
 */

export { EmailInquiryModel, AttachmentRef } from '../../models/EmailInquiry';
export { EmailStatus, EmailCategory, Priority } from '../../types/enums';
export { EmailParserCli } from '../../cli/email-parser-cli';

// Core parsing functions
export class EmailParser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parseEML(_content: string) {
    // Implementation would be extracted from CLI
    throw new Error('Implementation needed');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parseMBOX(_content: string) {
    // Implementation would be extracted from CLI
    throw new Error('Implementation needed');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parseCSV(_content: string, _mapping?: Record<string, string>) {
    // Implementation would be extracted from CLI
    throw new Error('Implementation needed');
  }
}

export const version = '1.0.0';
