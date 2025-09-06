/**
 * KnowledgeSearchModal
 * 
 * Modal dialog for searching knowledge base entries.
 * Provides search input, filters, and results display.
 */

import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import { KnowledgeSearchService } from '../../services/KnowledgeSearchService';
import { SearchQuery, SearchResult, SearchOptions } from '../../types/search';
import { I18nService } from '../../services/I18nService';

export class KnowledgeSearchModal extends Modal {
  private searchService: KnowledgeSearchService;
  private i18n: I18nService;
  private searchResults: SearchResult[] = [];
  private currentQuery: SearchQuery = { query: '' };
  private searchDebounceTimer: NodeJS.Timeout | null = null;
  private resultsContainer: HTMLElement;
  private searchInput: HTMLInputElement;
  private categoryFilter: HTMLSelectElement;
  private dateFromInput: HTMLInputElement;
  private dateToInput: HTMLInputElement;
  private fuzzySearchToggle: HTMLInputElement;
  private searchInTitleToggle: HTMLInputElement;
  private searchInContentToggle: HTMLInputElement;
  private resultsInfo: HTMLElement;
  private isSearching = false;

  constructor(
    app: App,
    searchService: KnowledgeSearchService,
    i18n: I18nService,
    private settings: {
      knowledgeFolder: string;
      customCategories?: string[];
    }
  ) {
    super(app);
    this.searchService = searchService;
    this.i18n = i18n;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('knowledge-search-modal');

    // Modal title
    contentEl.createEl('h2', { text: '知識ベースを検索' });

    // Search input section
    this.createSearchInput(contentEl);

    // Filters section
    this.createFiltersSection(contentEl);

    // Results info
    this.resultsInfo = contentEl.createEl('div', { 
      cls: 'search-results-info',
      text: '検索を開始してください'
    });

    // Results container
    this.resultsContainer = contentEl.createEl('div', { 
      cls: 'search-results-container' 
    });

    // Initialize search service
    this.initializeSearch();

    // Focus search input
    this.searchInput.focus();
  }

  private createSearchInput(container: HTMLElement) {
    const searchSection = container.createEl('div', { cls: 'search-input-section' });

    // Search input with icon
    const searchWrapper = searchSection.createEl('div', { cls: 'search-input-wrapper' });
    
    this.searchInput = searchWrapper.createEl('input', {
      type: 'text',
      placeholder: 'キーワードを入力して検索...',
      cls: 'search-input'
    });

    // Search button
    const searchButton = searchWrapper.createEl('button', {
      text: '検索',
      cls: 'search-button'
    });

    // Event listeners
    this.searchInput.addEventListener('input', () => {
      this.debounceSearch();
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    searchButton.addEventListener('click', () => {
      this.performSearch();
    });
  }

  private createFiltersSection(container: HTMLElement) {
    const filtersSection = container.createEl('details', { cls: 'filters-section' });
    filtersSection.createEl('summary', { text: 'フィルターオプション' });

    const filtersContent = filtersSection.createEl('div', { cls: 'filters-content' });

    // Category filter
    const categoryGroup = filtersContent.createEl('div', { cls: 'filter-group' });
    categoryGroup.createEl('label', { text: 'カテゴリ:' });
    this.categoryFilter = categoryGroup.createEl('select', { cls: 'category-filter' });
    
    // Add category options
    this.categoryFilter.createEl('option', { value: '', text: 'すべて' });
    const defaultCategories = ['specification', 'issue', 'migration_vup', 'other'];
    const allCategories = [...defaultCategories, ...(this.settings.customCategories || [])];
    
    for (const category of allCategories) {
      this.categoryFilter.createEl('option', { 
        value: category, 
        text: this.translateCategory(category) 
      });
    }

    // Date range filter
    const dateGroup = filtersContent.createEl('div', { cls: 'filter-group' });
    dateGroup.createEl('label', { text: '日付範囲:' });
    
    const dateWrapper = dateGroup.createEl('div', { cls: 'date-range-wrapper' });
    this.dateFromInput = dateWrapper.createEl('input', { 
      type: 'date',
      cls: 'date-input'
    });
    dateWrapper.createEl('span', { text: '〜' });
    this.dateToInput = dateWrapper.createEl('input', { 
      type: 'date',
      cls: 'date-input'
    });

    // Search options
    const optionsGroup = filtersContent.createEl('div', { cls: 'filter-group' });
    optionsGroup.createEl('label', { text: '検索オプション:' });
    
    const optionsWrapper = optionsGroup.createEl('div', { cls: 'search-options' });
    
    // Fuzzy search toggle
    const fuzzyOption = optionsWrapper.createEl('label', { cls: 'option-label' });
    this.fuzzySearchToggle = fuzzyOption.createEl('input', { 
      type: 'checkbox',
      cls: 'option-checkbox'
    });
    fuzzyOption.createEl('span', { text: 'あいまい検索' });

    // Search in title
    const titleOption = optionsWrapper.createEl('label', { cls: 'option-label' });
    this.searchInTitleToggle = titleOption.createEl('input', { 
      type: 'checkbox',
      cls: 'option-checkbox',
      value: 'true'
    });
    this.searchInTitleToggle.checked = true;
    titleOption.createEl('span', { text: 'タイトルを検索' });

    // Search in content
    const contentOption = optionsWrapper.createEl('label', { cls: 'option-label' });
    this.searchInContentToggle = contentOption.createEl('input', { 
      type: 'checkbox',
      cls: 'option-checkbox',
      value: 'true'
    });
    this.searchInContentToggle.checked = true;
    contentOption.createEl('span', { text: '内容を検索' });

    // Add filter change listeners
    this.categoryFilter.addEventListener('change', () => this.performSearch());
    this.dateFromInput.addEventListener('change', () => this.performSearch());
    this.dateToInput.addEventListener('change', () => this.performSearch());
    this.fuzzySearchToggle.addEventListener('change', () => this.performSearch());
    this.searchInTitleToggle.addEventListener('change', () => this.performSearch());
    this.searchInContentToggle.addEventListener('change', () => this.performSearch());
  }

  private async initializeSearch() {
    try {
      await this.searchService.initialize();
      const stats = this.searchService.getStats();
      this.resultsInfo.setText(`${stats.indexSize}件の知識エントリがインデックスされています`);
    } catch (error) {
      console.error('[KnowledgeSearch] Failed to initialize search:', error);
      this.resultsInfo.setText('検索サービスの初期化に失敗しました');
    }
  }

  private debounceSearch() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  private async performSearch() {
    if (this.isSearching) {
      return;
    }

    // Build search query
    this.currentQuery = this.buildSearchQuery();

    // Show loading state
    this.isSearching = true;
    this.resultsInfo.setText('検索中...');
    this.resultsContainer.empty();

    try {
      // Perform search
      const startTime = Date.now();
      this.searchResults = await this.searchService.search(this.currentQuery);
      const searchTime = Date.now() - startTime;

      // Update results info
      if (this.searchResults.length === 0) {
        this.resultsInfo.setText('検索結果が見つかりませんでした');
      } else {
        this.resultsInfo.setText(
          `${this.searchResults.length}件の結果が見つかりました (${searchTime}ms)`
        );
      }

      // Display results
      this.displayResults();

    } catch (error) {
      console.error('[KnowledgeSearch] Search failed:', error);
      this.resultsInfo.setText('検索エラーが発生しました');
      new Notice('検索に失敗しました: ' + error);

    } finally {
      this.isSearching = false;
    }
  }

  private buildSearchQuery(): SearchQuery {
    const query: SearchQuery = {
      query: this.searchInput.value.trim(),
      fuzzy: this.fuzzySearchToggle.checked,
      limit: 50
    };

    // Category filter
    if (this.categoryFilter.value) {
      query.categories = [this.categoryFilter.value];
    }

    // Date range filter
    if (this.dateFromInput.value || this.dateToInput.value) {
      query.dateRange = {
        from: this.dateFromInput.value ? new Date(this.dateFromInput.value) : new Date(0),
        to: this.dateToInput.value ? new Date(this.dateToInput.value) : new Date()
      };
    }

    // Search scope
    const searchIn: ('title' | 'content' | 'all')[] = [];
    if (this.searchInTitleToggle.checked) searchIn.push('title');
    if (this.searchInContentToggle.checked) searchIn.push('content');
    
    if (searchIn.length === 0 || searchIn.length === 2) {
      query.searchIn = ['all'];
    } else {
      query.searchIn = searchIn;
    }

    return query;
  }

  private displayResults() {
    this.resultsContainer.empty();

    if (this.searchResults.length === 0) {
      this.resultsContainer.createEl('div', {
        cls: 'no-results',
        text: '検索条件に一致する知識エントリが見つかりませんでした'
      });
      return;
    }

    // Create results list
    const resultsList = this.resultsContainer.createEl('div', { cls: 'results-list' });

    for (const result of this.searchResults) {
      this.createResultItem(resultsList, result);
    }
  }

  private createResultItem(container: HTMLElement, result: SearchResult) {
    const resultItem = container.createEl('div', { cls: 'result-item' });

    // Result header
    const header = resultItem.createEl('div', { cls: 'result-header' });
    
    // Title with relevance score
    const titleWrapper = header.createEl('div', { cls: 'result-title-wrapper' });
    const title = titleWrapper.createEl('a', {
      cls: 'result-title',
      text: result.title,
      href: '#'
    });

    // Relevance badge
    if (result.relevanceScore > 70) {
      titleWrapper.createEl('span', {
        cls: 'relevance-badge high',
        text: `${result.relevanceScore}%`
      });
    } else if (result.relevanceScore > 40) {
      titleWrapper.createEl('span', {
        cls: 'relevance-badge medium',
        text: `${result.relevanceScore}%`
      });
    }

    // Category and tags
    const metadata = header.createEl('div', { cls: 'result-metadata' });
    metadata.createEl('span', {
      cls: 'result-category',
      text: this.translateCategory(result.category)
    });

    if (result.tags.length > 0) {
      const tagsWrapper = metadata.createEl('span', { cls: 'result-tags' });
      for (const tag of result.tags.slice(0, 3)) {
        tagsWrapper.createEl('span', {
          cls: 'tag',
          text: tag
        });
      }
    }

    // Excerpt with highlights
    const excerpt = resultItem.createEl('div', {
      cls: 'result-excerpt'
    });
    
    // Use innerHTML for highlights (safe because we control the content)
    excerpt.innerHTML = this.sanitizeHtml(result.excerpt);

    // Matched fields info
    if (result.matchedFields.length > 0) {
      const matchInfo = resultItem.createEl('div', {
        cls: 'result-match-info',
        text: `マッチ: ${result.matchedFields.map(f => this.translateField(f)).join(', ')}`
      });
    }

    // Date info
    const dateInfo = resultItem.createEl('div', {
      cls: 'result-date',
      text: `作成: ${this.formatDate(result.createdAt)}`
    });

    // Click handler
    title.addEventListener('click', (e) => {
      e.preventDefault();
      this.openKnowledgeEntry(result);
    });

    // Keyboard navigation
    resultItem.tabIndex = 0;
    resultItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.openKnowledgeEntry(result);
      }
    });
  }

  private async openKnowledgeEntry(result: SearchResult) {
    try {
      // Try to get the file with the path as-is
      let file = this.app.vault.getAbstractFileByPath(result.filePath);
      
      // If not found, try without leading slash
      if (!file && result.filePath.startsWith('/')) {
        const pathWithoutSlash = result.filePath.substring(1);
        file = this.app.vault.getAbstractFileByPath(pathWithoutSlash);
      }
      
      // If still not found, try with knowledge folder prefix
      if (!file) {
        const pathWithFolder = `${this.settings.knowledgeFolder}/${result.filePath}`;
        file = this.app.vault.getAbstractFileByPath(pathWithFolder);
      }
      
      if (file instanceof TFile) {
        // Close modal
        this.close();
        
        // Open the file
        await this.app.workspace.getLeaf(false).openFile(file);
        
        // Show notice
        new Notice(`知識エントリを開きました: ${result.title}`);
      } else {
        new Notice('ファイルが見つかりません: ' + result.filePath);
      }
    } catch (error) {
      console.error('[KnowledgeSearch] Failed to open file:', error);
      new Notice('ファイルを開けませんでした');
    }
  }

  private translateCategory(category: string): string {
    const translations: Record<string, string> = {
      'specification': '仕様',
      'issue': '障害',
      'migration_vup': '移行/VUP',
      'other': 'その他'
    };
    return translations[category] || category;
  }

  private translateField(field: string): string {
    const translations: Record<string, string> = {
      'title': 'タイトル',
      'content': '内容',
      'problem': '問題',
      'solution': '解決方法',
      'tags': 'タグ',
      'category': 'カテゴリ',
      'keywords': 'キーワード'
    };
    return translations[field] || field;
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  private sanitizeHtml(html: string): string {
    // Simple HTML sanitization for highlights
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();

    // Clear debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }
}