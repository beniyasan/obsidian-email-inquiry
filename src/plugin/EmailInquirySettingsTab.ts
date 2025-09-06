/**
 * EmailInquirySettingsTab
 * 
 * Settings tab for configuring the Email Inquiry plugin preferences.
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import EmailInquiryPlugin from './EmailInquiryPlugin';
import { EmailCategory, Priority } from '../types/enums';
import { SupportedLanguage } from '../services/I18nService';

export class EmailInquirySettingsTab extends PluginSettingTab {
  plugin: EmailInquiryPlugin;

  constructor(app: App, plugin: EmailInquiryPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const i18n = this.plugin.getI18nService();
    containerEl.createEl('h2', { text: i18n.t('settings.title') });

    // Folder Settings
    containerEl.createEl('h3', { text: i18n.t('settings.folders.title') });

    new Setting(containerEl)
      .setName(i18n.t('settings.folders.emails_folder'))
      .setDesc(i18n.t('settings.folders.emails_folder_desc'))
      .addText(text => text
        .setPlaceholder('Emails')
        .setValue(this.plugin.settings.emailsFolder)
        .onChange(async (value) => {
          this.plugin.settings.emailsFolder = value || 'Emails';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(i18n.t('settings.folders.summaries_folder'))
      .setDesc(i18n.t('settings.folders.summaries_folder_desc'))
      .addText(text => text
        .setPlaceholder('Summaries')
        .setValue(this.plugin.settings.summariesFolder)
        .onChange(async (value) => {
          this.plugin.settings.summariesFolder = value || 'Summaries';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(i18n.t('settings.folders.knowledge_folder'))
      .setDesc(i18n.t('settings.folders.knowledge_folder_desc'))
      .addText(text => text
        .setPlaceholder('Knowledge')
        .setValue(this.plugin.settings.knowledgeFolder)
        .onChange(async (value) => {
          this.plugin.settings.knowledgeFolder = value || 'Knowledge';
          await this.plugin.saveSettings();
        }));

    // Default Values
    containerEl.createEl('h3', { text: i18n.t('settings.defaults.title') });

    new Setting(containerEl)
      .setName(i18n.t('settings.defaults.category'))
      .setDesc(i18n.t('settings.defaults.category_desc'))
      .addDropdown(dropdown => {
        const categories = i18n.getTranslationGroup('categories');
        
        // Add default categories
        dropdown
          .addOption(EmailCategory.SPECIFICATION, categories.specification)
          .addOption(EmailCategory.ISSUE, categories.issue)
          .addOption(EmailCategory.MIGRATION_VUP, categories.migration_vup)
          .addOption(EmailCategory.OTHER, categories.other);
          
        // Add custom categories
        if (this.plugin.settings.customCategories && this.plugin.settings.customCategories.length > 0) {
          this.plugin.settings.customCategories.forEach(customCategory => {
            dropdown.addOption(customCategory, customCategory);
          });
        }
        
        dropdown.setValue(this.plugin.settings.defaultCategory)
          .onChange(async (value) => {
            this.plugin.settings.defaultCategory = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(i18n.t('settings.defaults.priority'))
      .setDesc(i18n.t('settings.defaults.priority_desc'))
      .addDropdown(dropdown => {
        const priorities = i18n.getTranslationGroup('priorities');
        dropdown
          .addOption(Priority.LOW, priorities.low)
          .addOption(Priority.MEDIUM, priorities.medium)
          .addOption(Priority.HIGH, priorities.high)
          .addOption(Priority.URGENT, priorities.urgent)
          .setValue(this.plugin.settings.defaultPriority)
          .onChange(async (value) => {
            this.plugin.settings.defaultPriority = value;
            await this.plugin.saveSettings();
          });
      });

    // Automation Settings
    containerEl.createEl('h3', { text: i18n.t('settings.automation.title') });

    new Setting(containerEl)
      .setName(i18n.t('settings.automation.auto_summary'))
      .setDesc(i18n.t('settings.automation.auto_summary_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoGenerateSummary)
        .onChange(async (value) => {
          this.plugin.settings.autoGenerateSummary = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(i18n.t('settings.automation.auto_knowledge'))
      .setDesc(i18n.t('settings.automation.auto_knowledge_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoExtractKnowledge)
        .onChange(async (value) => {
          this.plugin.settings.autoExtractKnowledge = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(i18n.t('settings.automation.enable_notifications'))
      .setDesc(i18n.t('settings.automation.enable_notifications_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableNotifications)
        .onChange(async (value) => {
          this.plugin.settings.enableNotifications = value;
          await this.plugin.saveSettings();
        }));

    // Custom Categories Section
    containerEl.createEl('h3', { text: i18n.t('settings.categories.title') });
    
    // Display current custom categories
    const categoriesContainer = containerEl.createDiv('custom-categories-container');
    categoriesContainer.style.marginBottom = '15px';
    
    // Add description for category management
    const descriptionEl = categoriesContainer.createEl('p', {
      text: i18n.t('settings.categories.manage_desc'),
      cls: 'setting-item-description'
    });
    descriptionEl.style.marginBottom = '8px';
    descriptionEl.style.color = 'var(--text-muted)';
    descriptionEl.style.fontSize = '13px';
    
    this.displayCustomCategories(categoriesContainer, i18n);
    
    // Add new category
    new Setting(containerEl)
      .setName(i18n.t('settings.categories.add_category'))
      .setDesc(i18n.t('settings.categories.add_category_desc'))
      .addText(text => {
        text.setPlaceholder(i18n.t('settings.categories.category_placeholder'));
        const addButton = containerEl.createEl('button', {
          text: i18n.t('settings.categories.add_button'),
          cls: 'mod-cta'
        });
        addButton.style.marginLeft = '10px';
        addButton.onclick = async () => {
          const categoryName = text.getValue().trim();
          if (categoryName && !this.plugin.settings.customCategories.includes(categoryName)) {
            this.plugin.settings.customCategories.push(categoryName);
            await this.plugin.saveSettings();
            text.setValue('');
            this.displayCustomCategories(categoriesContainer, i18n);
          }
        };
        // Add the button next to the text input
        text.inputEl.parentElement?.appendChild(addButton);
      });

    // Advanced Settings
    containerEl.createEl('h3', { text: i18n.t('settings.advanced.title') });

    // Language Setting
    new Setting(containerEl)
      .setName(i18n.t('settings.advanced.language'))
      .setDesc(i18n.t('settings.advanced.language_desc'))
      .addDropdown(dropdown => {
        const languages = i18n.getTranslationGroup('languages');
        dropdown
          .addOption('en', languages.en)
          .addOption('ja', languages.ja)
          .setValue(this.plugin.settings.language)
          .onChange(async (value: string) => {
            this.plugin.settings.language = value as SupportedLanguage;
            await this.plugin.saveSettings();
            // Refresh the settings tab to show the new language
            this.display();
          });
      });

    new Setting(containerEl)
      .setName(i18n.t('settings.advanced.max_attachment_size'))
      .setDesc(i18n.t('settings.advanced.max_attachment_size_desc'))
      .addText(text => text
        .setPlaceholder('10')
        .setValue(String(this.plugin.settings.maxAttachmentSize / (1024 * 1024)))
        .onChange(async (value) => {
          const sizeInMB = parseFloat(value) || 10;
          this.plugin.settings.maxAttachmentSize = sizeInMB * 1024 * 1024;
          await this.plugin.saveSettings();
        }));

    // Add a reset settings button
    new Setting(containerEl)
      .setName('Reset Settings')
      .setDesc('Reset all settings to default values')
      .addButton(button => button
        .setButtonText('Reset to Defaults')
        .setWarning()
        .onClick(async () => {
          // Confirm reset
          const confirmed = confirm('Are you sure you want to reset all settings to default values? This cannot be undone.');
          if (confirmed) {
            this.plugin.settings = {
              emailsFolder: 'Emails',
              summariesFolder: 'Summaries',
              knowledgeFolder: 'Knowledge',
              defaultCategory: 'specification',
              defaultPriority: 'medium',
              autoGenerateSummary: true,
              autoExtractKnowledge: false,
              enableNotifications: true,
              maxAttachmentSize: 10 * 1024 * 1024,
              language: 'en',
              customCategories: []
            };
            await this.plugin.saveSettings();
            this.display(); // Refresh the settings tab
          }
        }));

    // Plugin information
    containerEl.createEl('h3', { text: 'About' });
    containerEl.createEl('p', { 
      text: 'Email Inquiry Management Plugin v1.0.0 - Capture, organize, and build knowledge from email inquiries.' 
    });
  }

  private displayCustomCategories(container: HTMLElement, i18n: any): void {
    container.empty();
    
    if (this.plugin.settings.customCategories.length === 0) {
      container.createEl('p', { 
        text: i18n.t('settings.categories.no_custom_categories'),
        cls: 'setting-item-description'
      });
      return;
    }

    // Create a list of current custom categories
    const categoryList = container.createEl('div', { cls: 'custom-categories-list' });
    categoryList.style.display = 'flex';
    categoryList.style.flexWrap = 'wrap';
    categoryList.style.gap = '8px';
    categoryList.style.marginTop = '8px';

    this.plugin.settings.customCategories.forEach((category, index) => {
      const categoryTag = categoryList.createEl('span', {
        text: category,
        cls: 'category-tag'
      });
      
      // Style the category tag
      categoryTag.style.backgroundColor = 'var(--interactive-accent)';
      categoryTag.style.color = 'var(--text-on-accent)';
      categoryTag.style.padding = '4px 8px';
      categoryTag.style.borderRadius = '12px';
      categoryTag.style.fontSize = '12px';
      categoryTag.style.display = 'inline-flex';
      categoryTag.style.alignItems = 'center';
      categoryTag.style.gap = '4px';
      
      // Add remove button
      const removeButton = categoryTag.createEl('span', {
        text: '×',
        cls: 'category-remove'
      });
      removeButton.style.cursor = 'pointer';
      removeButton.style.fontWeight = 'bold';
      removeButton.style.marginLeft = '4px';
      removeButton.style.opacity = '0.8';
      removeButton.style.fontSize = '14px';
      removeButton.style.lineHeight = '1';
      removeButton.style.width = '16px';
      removeButton.style.height = '16px';
      removeButton.style.display = 'inline-flex';
      removeButton.style.alignItems = 'center';
      removeButton.style.justifyContent = 'center';
      removeButton.style.borderRadius = '50%';
      removeButton.style.transition = 'all 0.2s ease';
      removeButton.title = i18n.t('settings.categories.delete_tooltip');
      
      removeButton.addEventListener('mouseenter', () => {
        removeButton.style.opacity = '1';
        removeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        removeButton.style.transform = 'scale(1.1)';
      });
      
      removeButton.addEventListener('mouseleave', () => {
        removeButton.style.opacity = '0.8';
        removeButton.style.backgroundColor = 'transparent';
        removeButton.style.transform = 'scale(1)';
      });
      
      removeButton.onclick = async () => {
        const confirmed = confirm(i18n.t('settings.categories.delete_confirm', { category }));
        if (confirmed) {
          this.plugin.settings.customCategories.splice(index, 1);
          await this.plugin.saveSettings();
          this.displayCustomCategories(container, i18n);
        }
      };
    });
  }
}