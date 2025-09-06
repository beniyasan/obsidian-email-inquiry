/**
 * EmailCaptureModal
 * 
 * Modal dialog for capturing email inquiries with form validation
 * and real-time preview functionality.
 */

import { App, Modal, Setting, TextAreaComponent, DropdownComponent, TextComponent } from 'obsidian';
import { EmailCaptureService } from '../../services/EmailCaptureService';
import { I18nService } from '../../services/I18nService';
import { EmailInquirySettings } from '../EmailInquiryPlugin';
import { EmailCaptureRequest, EmailCaptureResponse } from '../../types/api';
import { EmailCategory, Priority } from '../../types/enums';

export class EmailCaptureModal extends Modal {
  private emailCaptureService: EmailCaptureService;
  private settings: EmailInquirySettings;
  private i18nService: I18nService;
  private onSuccess: (result: EmailCaptureResponse) => void;

  // Form fields
  private senderInput: TextComponent;
  private senderNameInput: TextComponent;
  private subjectInput: TextComponent;
  private bodyInput: TextAreaComponent;
  private categoryDropdown: DropdownComponent;
  private priorityDropdown: DropdownComponent;
  private tagsInput: TextComponent;

  constructor(
    app: App,
    emailCaptureService: EmailCaptureService,
    settings: EmailInquirySettings,
    i18nService: I18nService,
    onSuccess: (result: EmailCaptureResponse) => void
  ) {
    super(app);
    this.emailCaptureService = emailCaptureService;
    this.settings = settings;
    this.i18nService = i18nService;
    this.onSuccess = onSuccess;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: this.i18nService.t('modal.capture_email.title') });

    // Sender Email (Required)
    new Setting(contentEl)
      .setName(this.i18nService.t('modal.capture_email.sender_email'))
      .setDesc('Email address of the person who sent the inquiry')
      .addText(text => {
        this.senderInput = text;
        text
          .setPlaceholder(this.i18nService.t('modal.capture_email.placeholder.sender_email'))
          .onChange(value => {
            this.validateEmail(value);
          });
      });

    // Sender Name (Optional)
    new Setting(contentEl)
      .setName(this.i18nService.t('modal.capture_email.sender_name'))
      .setDesc('Display name of the sender (optional)')
      .addText(text => {
        this.senderNameInput = text;
        text.setPlaceholder(this.i18nService.t('modal.capture_email.placeholder.sender_name'));
      });

    // Subject (Required)
    new Setting(contentEl)
      .setName(this.i18nService.t('modal.capture_email.subject'))
      .setDesc('Email subject line')
      .addText(text => {
        this.subjectInput = text;
        text.setPlaceholder(this.i18nService.t('modal.capture_email.placeholder.subject'));
      });

    // Category
    new Setting(contentEl)
      .setName(this.i18nService.t('modal.capture_email.category'))
      .setDesc('Categorize this inquiry')
      .addDropdown(dropdown => {
        this.categoryDropdown = dropdown;
        const categories = this.i18nService.getTranslationGroup('categories');
        dropdown.addOption('', 'Select category...');
        
        // Add default categories
        dropdown
          .addOption(EmailCategory.SPECIFICATION, categories.specification)
          .addOption(EmailCategory.ISSUE, categories.issue)
          .addOption(EmailCategory.MIGRATION_VUP, categories.migration_vup)
          .addOption(EmailCategory.OTHER, categories.other);
          
        // Add custom categories
        if (this.settings.customCategories && this.settings.customCategories.length > 0) {
          // Add separator if there are custom categories
          dropdown.addOption('---', '--- Custom Categories ---');
          this.settings.customCategories.forEach(customCategory => {
            dropdown.addOption(customCategory, customCategory);
          });
        }
        
        dropdown.setValue(this.settings.defaultCategory);
      });

    // Priority
    new Setting(contentEl)
      .setName(this.i18nService.t('modal.capture_email.priority'))
      .setDesc('Priority level of this inquiry')
      .addDropdown(dropdown => {
        this.priorityDropdown = dropdown;
        const priorities = this.i18nService.getTranslationGroup('priorities');
        dropdown
          .addOption(Priority.LOW, priorities.low)
          .addOption(Priority.MEDIUM, priorities.medium)
          .addOption(Priority.HIGH, priorities.high)
          .addOption(Priority.URGENT, priorities.urgent)
          .setValue(this.settings.defaultPriority);
      });

    // Tags
    new Setting(contentEl)
      .setName(this.i18nService.t('modal.capture_email.tags'))
      .setDesc('Comma-separated tags for this email')
      .addText(text => {
        this.tagsInput = text;
        text.setPlaceholder(this.i18nService.t('modal.capture_email.placeholder.tags'));
      });

    // Email Body (Required)
    new Setting(contentEl)
      .setName(this.i18nService.t('modal.capture_email.email_content'))
      .setDesc('The main content of the email')
      .addTextArea(textarea => {
        this.bodyInput = textarea;
        textarea
          .setPlaceholder(this.i18nService.t('modal.capture_email.placeholder.email_content'))
          .inputEl.style.height = '200px';
      });

    // Buttons
    const buttonContainer = contentEl.createDiv('modal-button-container');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '20px';

    // Cancel button
    buttonContainer.createEl('button', { text: this.i18nService.t('modal.capture_email.cancel_button') }, button => {
      button.onclick = () => {
        this.close();
      };
    });

    // Capture button
    buttonContainer.createEl('button', { 
      text: this.i18nService.t('modal.capture_email.capture_button'),
      cls: 'mod-cta'
    }, button => {
      button.onclick = async () => {
        await this.captureEmail();
      };
    });

    // Focus on sender input
    setTimeout(() => {
      this.senderInput.inputEl.focus();
    }, 100);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    // Add visual feedback
    const inputEl = this.senderInput.inputEl;
    if (email && !isValid) {
      inputEl.style.borderColor = 'red';
      inputEl.style.boxShadow = '0 0 5px rgba(255, 0, 0, 0.3)';
    } else {
      inputEl.style.borderColor = '';
      inputEl.style.boxShadow = '';
    }
    
    return isValid;
  }

  private validateForm(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const sender = this.senderInput.getValue().trim();
    const subject = this.subjectInput.getValue().trim();
    const body = this.bodyInput.getValue().trim();

    if (!sender) {
      errors.push(this.i18nService.t('modal.capture_email.validation.sender_email_required'));
    } else if (!this.validateEmail(sender)) {
      errors.push(this.i18nService.t('modal.capture_email.validation.sender_email_invalid'));
    }

    if (!subject) {
      errors.push(this.i18nService.t('modal.capture_email.validation.subject_required'));
    }

    if (!body) {
      errors.push(this.i18nService.t('modal.capture_email.validation.content_required'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async captureEmail() {
    try {
      const validation = this.validateForm();
      
      if (!validation.isValid) {
        // Show validation errors
        const errorMessage = validation.errors.join('\n');
        this.showError(`Please fix the following errors:\n\n${errorMessage}`);
        return;
      }

      // Prepare request
      const request: EmailCaptureRequest = {
        sender: this.senderInput.getValue().trim(),
        senderName: this.senderNameInput.getValue().trim() || undefined,
        subject: this.subjectInput.getValue().trim(),
        body: this.bodyInput.getValue().trim(),
        receivedDate: new Date().toISOString(),
        category: this.categoryDropdown.getValue() as EmailCategory || undefined,
        priority: this.priorityDropdown.getValue() as Priority || Priority.MEDIUM,
        tags: this.parseTags(this.tagsInput.getValue()),
      };

      // Show loading state
      const captureButton = this.contentEl.querySelector('.mod-cta') as HTMLButtonElement;
      const originalText = captureButton.textContent;
      captureButton.textContent = 'Capturing...';
      captureButton.disabled = true;

      // Capture email
      const result = await this.emailCaptureService.captureEmail(request);

      // Success callback
      this.onSuccess(result);
      
      this.close();
    } catch (error) {
      this.showError(`Failed to capture email: ${error instanceof Error ? error.message : String(error)}`);
      
      // Reset button state
      const captureButton = this.contentEl.querySelector('.mod-cta') as HTMLButtonElement;
      captureButton.textContent = 'Capture Email';
      captureButton.disabled = false;
    }
  }

  private parseTags(tagsString: string): string[] {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  private showError(message: string) {
    // Remove existing error message
    const existingError = this.contentEl.querySelector('.modal-error');
    if (existingError) {
      existingError.remove();
    }

    // Create error element
    const errorEl = this.contentEl.createDiv('modal-error');
    errorEl.style.color = 'red';
    errorEl.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    errorEl.style.padding = '10px';
    errorEl.style.marginTop = '10px';
    errorEl.style.borderRadius = '4px';
    errorEl.style.border = '1px solid red';
    errorEl.textContent = message;

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove();
      }
    }, 5000);
  }
}