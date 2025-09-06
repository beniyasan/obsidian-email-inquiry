/**
 * EmailInquiryPlugin - Main Obsidian Plugin Class
 * 
 * Main entry point for the Email Inquiry Management plugin.
 * Integrates all services and provides command palette functionality.
 */

import { Plugin, TFile, Notice, WorkspaceLeaf } from 'obsidian';
import { EmailCaptureService } from '../services/EmailCaptureService';
import { KnowledgeExtractionService } from '../services/KnowledgeExtractionService';
import { DailySummaryService } from '../services/DailySummaryService';
import { I18nService, SupportedLanguage } from '../services/I18nService';
import { ObsidianVaultAdapter } from './adapters/ObsidianVaultAdapter';
import { EmailCaptureModal } from './modals/EmailCaptureModal';
import { EmailInquirySettingsTab } from './EmailInquirySettingsTab';

export interface EmailInquirySettings {
  emailsFolder: string;
  summariesFolder: string;
  knowledgeFolder: string;
  defaultCategory: string;
  defaultPriority: string;
  autoGenerateSummary: boolean;
  autoExtractKnowledge: boolean;
  enableNotifications: boolean;
  maxAttachmentSize: number;
  language: SupportedLanguage;
  customCategories: string[];
}

const DEFAULT_SETTINGS: EmailInquirySettings = {
  emailsFolder: 'Emails',
  summariesFolder: 'Summaries',
  knowledgeFolder: 'Knowledge', 
  defaultCategory: 'specification',
  defaultPriority: 'medium',
  autoGenerateSummary: true,
  autoExtractKnowledge: false,
  enableNotifications: true,
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB
  language: 'en',
  customCategories: []
};

export default class EmailInquiryPlugin extends Plugin {
  settings: EmailInquirySettings;
  
  // Services
  private emailCaptureService: EmailCaptureService;
  private knowledgeExtractionService: KnowledgeExtractionService;
  private dailySummaryService: DailySummaryService;
  private vaultAdapter: ObsidianVaultAdapter;
  private i18nService: I18nService;

  async onload() {
    console.log('Loading Email Inquiry Plugin');
    
    await this.loadSettings();
    
    // Initialize i18n service first
    this.i18nService = new I18nService();
    await this.i18nService.initialize();
    this.i18nService.setLanguage(this.settings.language);
    
    // Initialize other services
    this.vaultAdapter = new ObsidianVaultAdapter(this.app.vault, this.app.fileManager);
    
    // Initialize knowledge extraction service
    this.knowledgeExtractionService = new KnowledgeExtractionService(this.vaultAdapter, {
      knowledgeFolder: this.settings.knowledgeFolder,
      autoExtractKnowledge: this.settings.autoExtractKnowledge,
      enableNotifications: this.settings.enableNotifications
    });
    
    // Initialize daily summary service
    this.dailySummaryService = new DailySummaryService(this.vaultAdapter, {
      summariesFolder: this.settings.summariesFolder,
      emailsFolder: this.settings.emailsFolder,
      language: this.settings.language
    });
    
    // Initialize email capture service with knowledge extraction
    this.emailCaptureService = new EmailCaptureService(
      this.vaultAdapter, 
      this.settings.emailsFolder,
      undefined, // No search indexer for now
      this.knowledgeExtractionService
    );

    // Add settings tab
    this.addSettingTab(new EmailInquirySettingsTab(this.app, this));

    // Register commands
    this.registerCommands();

    // Add ribbon icon
    this.addRibbonIcon('mail', this.i18nService.t('ribbon.capture_email'), () => {
      this.openEmailCaptureModal();
    });

    console.log('[EmailInquiry] Plugin loaded successfully with settings:', {
      emailsFolder: this.settings.emailsFolder,
      summariesFolder: this.settings.summariesFolder,
      knowledgeFolder: this.settings.knowledgeFolder,
      autoExtractKnowledge: this.settings.autoExtractKnowledge,
      language: this.settings.language
    });
  }

  onunload() {
    console.log('Unloading Email Inquiry Plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    
    // Update i18n service language when settings change
    if (this.i18nService) {
      this.i18nService.setLanguage(this.settings.language);
    }
    
    // Re-initialize services with new settings
    if (this.vaultAdapter) {
      // Update knowledge extraction service settings
      this.knowledgeExtractionService.updateSettings({
        knowledgeFolder: this.settings.knowledgeFolder,
        autoExtractKnowledge: this.settings.autoExtractKnowledge,
        enableNotifications: this.settings.enableNotifications
      });
      
      // Update daily summary service settings
      this.dailySummaryService.updateSettings({
        summariesFolder: this.settings.summariesFolder,
        emailsFolder: this.settings.emailsFolder,
        language: this.settings.language
      });
      
      // Re-initialize email capture service with updated settings
      this.emailCaptureService = new EmailCaptureService(
        this.vaultAdapter,
        this.settings.emailsFolder,
        undefined,
        this.knowledgeExtractionService
      );
    }
    
    console.log('[EmailInquiry] Settings updated:', {
      emailsFolder: this.settings.emailsFolder,
      knowledgeFolder: this.settings.knowledgeFolder,
      autoExtractKnowledge: this.settings.autoExtractKnowledge
    });
  }

  private registerCommands() {
    // Capture Email Command
    this.addCommand({
      id: 'capture-email',
      name: this.i18nService.t('commands.capture_email'),
      callback: () => {
        this.openEmailCaptureModal();
      }
    });

    // Generate Daily Summary Command
    this.addCommand({
      id: 'generate-daily-summary',
      name: this.i18nService.t('commands.generate_daily_summary'),
      callback: () => {
        this.generateDailySummary();
      }
    });

    // Search Knowledge Base Command
    this.addCommand({
      id: 'search-knowledge-base',
      name: this.i18nService.t('commands.search_knowledge_base'),
      callback: () => {
        this.openKnowledgeSearch();
      }
    });

    // Bulk Import Command
    this.addCommand({
      id: 'bulk-import-emails',
      name: this.i18nService.t('commands.bulk_import_emails'),
      callback: () => {
        this.openBulkImportModal();
      }
    });
  }

  private openEmailCaptureModal() {
    new EmailCaptureModal(
      this.app,
      this.emailCaptureService,
      this.settings,
      this.i18nService,
      (result) => {
        if (this.settings.enableNotifications) {
          new Notice(this.i18nService.t('notices.email_captured', { path: result.path }));
        }
      }
    ).open();
  }

  private async generateDailySummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`[EmailInquiry] Generating daily summary for: ${today}`);
      
      new Notice(this.i18nService.t('notices.generating_summary', { date: today }));
      
      // Generate daily summary using the service
      const result = await this.dailySummaryService.generateSummary({ 
        date: today,
        includePreviousDays: 0 // Only today's emails
      });
      
      if (this.settings.enableNotifications) {
        new Notice(this.i18nService.t('notices.summary_generated_with_path', { 
          path: result.filePath,
          count: result.stats.totalEmails 
        }));
      } else {
        new Notice(this.i18nService.t('notices.summary_generated'));
      }
      
      console.log(`[EmailInquiry] Daily summary generated successfully:`, result);
      
    } catch (error) {
      console.error('[EmailInquiry] Daily summary generation failed:', error);
      new Notice(this.i18nService.t('notices.error_generating_summary', { error: String(error) }));
    }
  }

  private openKnowledgeSearch() {
    // TODO: Implement knowledge search modal
    new Notice(this.i18nService.t('notices.knowledge_search_coming_soon'));
  }

  private openBulkImportModal() {
    // TODO: Implement bulk import modal
    new Notice(this.i18nService.t('notices.bulk_import_coming_soon'));
  }

  // Utility methods
  getEmailsFolder(): string {
    return this.settings.emailsFolder;
  }

  getSummariesFolder(): string {
    return this.settings.summariesFolder;
  }

  getKnowledgeFolder(): string {
    return this.settings.knowledgeFolder;
  }

  getI18nService(): I18nService {
    return this.i18nService;
  }
}