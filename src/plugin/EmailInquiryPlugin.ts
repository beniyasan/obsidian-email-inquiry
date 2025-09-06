/**
 * EmailInquiryPlugin - Main Obsidian Plugin Class
 * 
 * Main entry point for the Email Inquiry Management plugin.
 * Integrates all services and provides command palette functionality.
 */

import { Plugin, TFile, Notice, WorkspaceLeaf } from 'obsidian';
import { EmailCaptureService } from '../services/EmailCaptureService';
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
    this.emailCaptureService = new EmailCaptureService(this.vaultAdapter);

    // Add settings tab
    this.addSettingTab(new EmailInquirySettingsTab(this.app, this));

    // Register commands
    this.registerCommands();

    // Add ribbon icon
    this.addRibbonIcon('mail', this.i18nService.t('ribbon.capture_email'), () => {
      this.openEmailCaptureModal();
    });

    console.log('Email Inquiry Plugin loaded successfully');
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
      new Notice(this.i18nService.t('notices.generating_summary', { date: today }));
      
      // TODO: Implement daily summary generation
      // const summary = await this.dailySummaryService.generateSummary({ date: today });
      
      new Notice(this.i18nService.t('notices.summary_generated'));
    } catch (error) {
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