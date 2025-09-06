/**
 * Search-related type definitions
 */

/**
 * Search query parameters
 */
export interface SearchQuery {
  query: string;                         // 検索クエリ
  categories?: string[];                 // カテゴリフィルター
  tags?: string[];                       // タグフィルター
  dateRange?: {                         // 日付範囲
    from: Date;
    to: Date;
  };
  priority?: string[];                   // 優先度フィルター
  searchIn?: ('title' | 'content' | 'all')[]; // 検索対象フィールド
  fuzzy?: boolean;                       // ファジー検索の有効化
  limit?: number;                        // 結果の最大数
}

/**
 * Search result item
 */
export interface SearchResult {
  id: string;                           // エントリID
  title: string;                        // タイトル
  excerpt: string;                      // 抜粋（ハイライト付き）
  filePath: string;                     // ファイルパス
  category: string;                     // カテゴリ
  tags: string[];                       // タグ
  relevanceScore: number;               // 関連性スコア（0-100）
  matchedFields: string[];              // マッチしたフィールド
  highlights: SearchHighlight[];        // ハイライト情報
  createdAt: Date;                      // 作成日
  updatedAt: Date;                      // 更新日
}

/**
 * Search highlight information
 */
export interface SearchHighlight {
  field: string;                        // フィールド名
  snippet: string;                      // ハイライト付きスニペット
  position: {                           // 元のテキスト内の位置
    start: number;
    end: number;
  };
}

/**
 * Search index entry
 */
export interface SearchIndexEntry {
  id: string;                           // エントリID
  filePath: string;                     // ファイルパス
  title: string;                        // タイトル
  content: string;                      // 内容（検索用）
  problem: string;                      // 問題・質問
  solution: string;                     // 解決方法・回答
  category: string;                     // カテゴリ
  tags: string[];                       // タグ
  keywords: string[];                   // キーワード
  priority?: string;                    // 優先度
  sourceEmailId?: string;               // 元のメールID
  createdAt: Date;                      // 作成日
  updatedAt: Date;                      // 更新日
  lastIndexed: Date;                    // 最終インデックス日時
}

/**
 * Search statistics
 */
export interface SearchStats {
  totalResults: number;                 // 総結果数
  searchTime: number;                   // 検索時間（ミリ秒）
  indexSize: number;                    // インデックスサイズ
  lastUpdated: Date;                    // 最終更新日時
}

/**
 * Search options
 */
export interface SearchOptions {
  enableCache?: boolean;                // キャッシュの有効化
  cacheTimeout?: number;                // キャッシュタイムアウト（ミリ秒）
  maxResults?: number;                  // 最大結果数
  minRelevanceScore?: number;           // 最小関連性スコア
  highlightLength?: number;             // ハイライトスニペットの長さ
}