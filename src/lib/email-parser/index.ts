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
  static parseEML(content: string) {
    // Implementation would be extracted from CLI
    throw new Error('Implementation needed');
  }

  static parseMBOX(content: string) {
    // Implementation would be extracted from CLI  
    throw new Error('Implementation needed');
  }

  static parseCSV(content: string, mapping?: Record<string, string>) {
    // Implementation would be extracted from CLI
    throw new Error('Implementation needed');
  }
}

export const version = '1.0.0';