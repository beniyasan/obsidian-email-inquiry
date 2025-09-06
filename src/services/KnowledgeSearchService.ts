/**
 * KnowledgeSearchService
 * 
 * Service for searching and indexing knowledge base entries.
 * Provides full-text search, filtering, and ranking capabilities.
 */

import { 
  SearchQuery, 
  SearchResult, 
  SearchIndexEntry, 
  SearchStats,
  SearchOptions,
  SearchHighlight
} from '../types/search';

interface VaultAdapter {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<string>;
  list(path: string): Promise<string[]>;
  getFolderPath(folder: string): string;
}

export class KnowledgeSearchService {
  private searchIndex: Map<string, SearchIndexEntry> = new Map();
  private lastIndexUpdate: Date | null = null;
  private indexingInProgress = false;
  private searchCache: Map<string, { results: SearchResult[]; timestamp: number }> = new Map();
  private readonly CACHE_TIMEOUT = 5 * 60 * 1000; // 5分
  private readonly DEFAULT_LIMIT = 50;
  private readonly MIN_RELEVANCE_SCORE = 10;

  constructor(
    private vault: VaultAdapter,
    private settings: {
      knowledgeFolder: string;
      enableCache?: boolean;
      maxResults?: number;
    }
  ) {}

  /**
   * Initialize the search service and build initial index
   */
  async initialize(): Promise<void> {
    console.log('[KnowledgeSearch] Initializing search service...');
    await this.buildSearchIndex();
  }

  /**
   * Search knowledge base with query and filters
   */
  async search(query: SearchQuery, options?: SearchOptions): Promise<SearchResult[]> {
    console.log('[KnowledgeSearch] Searching with query:', query);

    // Check cache if enabled
    if (this.settings.enableCache !== false && options?.enableCache !== false) {
      const cacheKey = this.getCacheKey(query);
      const cached = this.searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
        console.log('[KnowledgeSearch] Returning cached results');
        return cached.results;
      }
    }

    // Ensure index is up to date
    if (!this.lastIndexUpdate || this.isIndexStale()) {
      await this.buildSearchIndex();
    }

    // Perform search
    const results = await this.performSearch(query, options);

    // Cache results
    if (this.settings.enableCache !== false) {
      const cacheKey = this.getCacheKey(query);
      this.searchCache.set(cacheKey, {
        results,
        timestamp: Date.now()
      });
    }

    return results;
  }

  /**
   * Build or rebuild the search index
   */
  async buildSearchIndex(): Promise<void> {
    if (this.indexingInProgress) {
      console.log('[KnowledgeSearch] Indexing already in progress, skipping...');
      return;
    }

    this.indexingInProgress = true;
    console.log('[KnowledgeSearch] Building search index...');

    try {
      const knowledgeFolder = this.vault.getFolderPath(this.settings.knowledgeFolder);
      
      // Check if knowledge folder exists
      if (!(await this.vault.exists(knowledgeFolder))) {
        console.log('[KnowledgeSearch] Knowledge folder does not exist:', knowledgeFolder);
        this.searchIndex.clear();
        return;
      }

      // Get all knowledge files
      const files = await this.vault.list(knowledgeFolder);
      const knowledgeFiles = files.filter(file => file.endsWith('.md'));

      console.log(`[KnowledgeSearch] Found ${knowledgeFiles.length} knowledge files`);

      // Clear existing index
      this.searchIndex.clear();

      // Index each file
      for (const file of knowledgeFiles) {
        try {
          const entry = await this.indexFile(file);
          if (entry) {
            this.searchIndex.set(entry.id, entry);
          }
        } catch (error) {
          console.error(`[KnowledgeSearch] Error indexing file ${file}:`, error);
        }
      }

      this.lastIndexUpdate = new Date();
      console.log(`[KnowledgeSearch] Index built with ${this.searchIndex.size} entries`);

    } finally {
      this.indexingInProgress = false;
    }
  }

  /**
   * Index a single knowledge file
   */
  private async indexFile(filePath: string): Promise<SearchIndexEntry | null> {
    try {
      const content = await this.vault.read(filePath);
      
      // Parse frontmatter and content
      const { frontmatter, body } = this.parseFrontmatter(content);
      
      if (!frontmatter.id) {
        console.warn(`[KnowledgeSearch] No ID found in file: ${filePath}`);
        return null;
      }

      // Extract search-relevant fields
      const entry: SearchIndexEntry = {
        id: frontmatter.id,
        filePath,
        title: frontmatter.title || this.extractTitle(body),
        content: body,
        problem: this.extractSection(body, '問題・質問') || '',
        solution: this.extractSection(body, '解決方法・回答') || '',
        category: frontmatter.category || 'その他',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
        priority: frontmatter.priority,
        sourceEmailId: frontmatter.sourceEmailId,
        createdAt: frontmatter.createdAt ? new Date(frontmatter.createdAt) : new Date(),
        updatedAt: frontmatter.updatedAt ? new Date(frontmatter.updatedAt) : new Date(),
        lastIndexed: new Date()
      };

      return entry;

    } catch (error) {
      console.error(`[KnowledgeSearch] Error reading file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Perform the actual search
   */
  private async performSearch(query: SearchQuery, options?: SearchOptions): Promise<SearchResult[]> {
    const startTime = Date.now();
    const results: SearchResult[] = [];

    // Search through index
    for (const entry of this.searchIndex.values()) {
      // Apply filters
      if (!this.matchesFilters(entry, query)) {
        continue;
      }

      // Calculate relevance score
      const score = this.calculateRelevanceScore(entry, query);
      
      // Skip if below minimum score
      if (score < (options?.minRelevanceScore || this.MIN_RELEVANCE_SCORE)) {
        continue;
      }

      // Create search result
      const result = this.createSearchResult(entry, query, score);
      results.push(result);
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply limit
    const limit = query.limit || options?.maxResults || this.settings.maxResults || this.DEFAULT_LIMIT;
    const limitedResults = results.slice(0, limit);

    const searchTime = Date.now() - startTime;
    console.log(`[KnowledgeSearch] Search completed in ${searchTime}ms, found ${limitedResults.length} results`);

    return limitedResults;
  }

  /**
   * Check if entry matches search filters
   */
  private matchesFilters(entry: SearchIndexEntry, query: SearchQuery): boolean {
    // Category filter
    if (query.categories && query.categories.length > 0) {
      if (!query.categories.includes(entry.category)) {
        return false;
      }
    }

    // Tag filter
    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => entry.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Date range filter
    if (query.dateRange) {
      const entryDate = entry.createdAt;
      if (entryDate < query.dateRange.from || entryDate > query.dateRange.to) {
        return false;
      }
    }

    // Priority filter
    if (query.priority && query.priority.length > 0) {
      if (!entry.priority || !query.priority.includes(entry.priority)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate relevance score for an entry
   */
  private calculateRelevanceScore(entry: SearchIndexEntry, query: SearchQuery): number {
    if (!query.query || query.query.trim() === '') {
      return 50; // Default score for empty query
    }

    const searchTerms = this.tokenizeQuery(query.query.toLowerCase());
    let score = 0;
    const matchedFields: Set<string> = new Set();

    // Define field weights
    const fieldWeights = {
      title: 10,
      keywords: 8,
      problem: 6,
      solution: 6,
      tags: 5,
      content: 3,
      category: 2
    };

    // Search in each field
    const searchFields = query.searchIn || ['all'];
    
    for (const [field, weight] of Object.entries(fieldWeights)) {
      // Skip if field not in search scope
      if (!searchFields.includes('all') && !searchFields.includes(field as any)) {
        continue;
      }

      const fieldValue = this.getFieldValue(entry, field);
      if (!fieldValue) continue;

      const fieldText = fieldValue.toLowerCase();
      let fieldScore = 0;

      for (const term of searchTerms) {
        if (query.fuzzy) {
          // Fuzzy matching
          const similarity = this.calculateSimilarity(fieldText, term);
          if (similarity > 0.7) {
            fieldScore += weight * similarity;
            matchedFields.add(field);
          }
        } else {
          // Exact matching
          if (fieldText.includes(term)) {
            fieldScore += weight;
            matchedFields.add(field);
            
            // Bonus for exact word match
            const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
            if (wordBoundaryRegex.test(fieldText)) {
              fieldScore += weight * 0.5;
            }
          }
        }
      }

      score += fieldScore;
    }

    // Normalize score to 0-100
    const maxPossibleScore = Object.values(fieldWeights).reduce((sum, w) => sum + w, 0) * searchTerms.length;
    const normalizedScore = Math.min(100, (score / maxPossibleScore) * 100);

    return Math.round(normalizedScore);
  }

  /**
   * Create search result from index entry
   */
  private createSearchResult(entry: SearchIndexEntry, query: SearchQuery, score: number): SearchResult {
    const highlights = this.generateHighlights(entry, query);
    const excerpt = this.generateExcerpt(entry, query, highlights);

    return {
      id: entry.id,
      title: entry.title,
      excerpt,
      filePath: entry.filePath,
      category: entry.category,
      tags: entry.tags,
      relevanceScore: score,
      matchedFields: [...new Set(highlights.map(h => h.field))],
      highlights,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    };
  }

  /**
   * Generate highlights for search result
   */
  private generateHighlights(entry: SearchIndexEntry, query: SearchQuery): SearchHighlight[] {
    const highlights: SearchHighlight[] = [];
    
    if (!query.query) return highlights;

    const searchTerms = this.tokenizeQuery(query.query.toLowerCase());
    const fieldsToHighlight = ['title', 'problem', 'solution', 'content'];

    for (const field of fieldsToHighlight) {
      const fieldValue = this.getFieldValue(entry, field);
      if (!fieldValue) continue;

      for (const term of searchTerms) {
        const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
        const matches = fieldValue.matchAll(regex);

        for (const match of matches) {
          if (match.index !== undefined) {
            const start = Math.max(0, match.index - 50);
            const end = Math.min(fieldValue.length, match.index + term.length + 50);
            const snippet = '...' + fieldValue.substring(start, end) + '...';
            const highlightedSnippet = snippet.replace(regex, '<mark>$1</mark>');

            highlights.push({
              field,
              snippet: highlightedSnippet,
              position: {
                start: match.index,
                end: match.index + term.length
              }
            });

            // Limit highlights per field
            if (highlights.filter(h => h.field === field).length >= 2) {
              break;
            }
          }
        }
      }
    }

    return highlights;
  }

  /**
   * Generate excerpt for search result
   */
  private generateExcerpt(entry: SearchIndexEntry, query: SearchQuery, highlights: SearchHighlight[]): string {
    // If we have highlights, use the first one
    if (highlights.length > 0) {
      return highlights[0].snippet;
    }

    // Otherwise, generate from problem or solution
    const text = entry.problem || entry.solution || entry.content;
    const maxLength = 200;

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + '...';
  }

  /**
   * Get statistics about the search index
   */
  getStats(): SearchStats {
    return {
      totalResults: this.searchIndex.size,
      searchTime: 0,
      indexSize: this.searchIndex.size,
      lastUpdated: this.lastIndexUpdate || new Date()
    };
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    console.log('[KnowledgeSearch] Cache cleared');
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<typeof this.settings>): void {
    Object.assign(this.settings, settings);
    this.clearCache();
  }

  // Helper methods

  private parseFrontmatter(content: string): { frontmatter: any; body: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, body: content };
    }

    const frontmatterText = match[1];
    const body = match[2];
    const frontmatter: any = {};

    // Simple YAML parsing
    const lines = frontmatterText.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Handle quoted strings
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }

        // Handle arrays
        if (value === '') {
          // Check if next lines are array items
          const arrayItems: string[] = [];
          let i = lines.indexOf(line) + 1;
          while (i < lines.length && lines[i].startsWith('  - ')) {
            let item = lines[i].substring(4).trim();
            if (item.startsWith('"') && item.endsWith('"')) {
              item = item.slice(1, -1);
            }
            arrayItems.push(item);
            i++;
          }
          if (arrayItems.length > 0) {
            frontmatter[key] = arrayItems;
            continue;
          }
        }

        frontmatter[key] = value;
      }
    }

    return { frontmatter, body };
  }

  private extractTitle(content: string): string {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1] : 'Untitled';
  }

  private extractSection(content: string, sectionTitle: string): string {
    const regex = new RegExp(`^##\\s+${this.escapeRegex(sectionTitle)}\\s*$([\\s\\S]*?)(?=^##\\s|$)`, 'gm');
    const match = regex.exec(content);
    return match ? match[1].trim() : '';
  }

  private tokenizeQuery(query: string): string[] {
    // Simple tokenization - split by spaces but respect quotes
    const tokens: string[] = [];
    const regex = /[^\s"]+|"([^"]*)"/gi;
    let match;

    while ((match = regex.exec(query)) !== null) {
      tokens.push(match[1] || match[0]);
    }

    return tokens;
  }

  private getFieldValue(entry: SearchIndexEntry, field: string): string {
    switch (field) {
      case 'title': return entry.title;
      case 'content': return entry.content;
      case 'problem': return entry.problem;
      case 'solution': return entry.solution;
      case 'category': return entry.category;
      case 'tags': return entry.tags.join(' ');
      case 'keywords': return entry.keywords.join(' ');
      default: return '';
    }
  }

  private calculateSimilarity(text: string, term: string): number {
    // Simple fuzzy matching using Levenshtein-like similarity
    const maxDistance = Math.floor(term.length * 0.3);
    
    for (let i = 0; i <= text.length - term.length; i++) {
      const substring = text.substring(i, i + term.length);
      const distance = this.levenshteinDistance(substring, term);
      
      if (distance <= maxDistance) {
        return 1 - (distance / term.length);
      }
    }

    return 0;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getCacheKey(query: SearchQuery): string {
    return JSON.stringify({
      query: query.query,
      categories: query.categories?.sort(),
      tags: query.tags?.sort(),
      dateRange: query.dateRange,
      priority: query.priority?.sort(),
      searchIn: query.searchIn?.sort(),
      fuzzy: query.fuzzy,
      limit: query.limit
    });
  }

  private isIndexStale(): boolean {
    if (!this.lastIndexUpdate) return true;
    
    // Consider index stale after 10 minutes
    const staleTime = 10 * 60 * 1000;
    return Date.now() - this.lastIndexUpdate.getTime() > staleTime;
  }
}