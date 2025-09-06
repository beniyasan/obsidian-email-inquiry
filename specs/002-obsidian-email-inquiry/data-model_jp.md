# データモデル: Obsidianメール問い合わせ管理システム

**日付**: 2025-09-05  
**機能**: 002-obsidian-email-inquiry

## 概要
このドキュメントは、Obsidianメール問い合わせ管理プラグインのデータ構造と関係を定義します。すべてのエンティティは、ObsidianボルトにYAMLフロントマター付きマークダウンファイルとして保存されます。

## コアエンティティ

### EmailInquiry
システムで取り込まれた単一のメール問い合わせを表します。

```typescript
interface EmailInquiry {
  // メタデータ（フロントマターに保存）
  id: string;                    // 一意識別子（UUID v4）
  sender: string;                 // 送信者のメールアドレス
  senderName?: string;            // 送信者の表示名
  subject: string;                // メール件名
  receivedDate: Date;             // ISO 8601タイムスタンプ
  status: EmailStatus;            // 現在のステータス
  tags: string[];                 // ユーザー定義タグ
  category?: EmailCategory;       // 分類
  threadId?: string;              // スレッドグループ識別子
  priority?: Priority;            // 緊急度レベル
  attachments?: AttachmentRef[];  // 添付ファイルへの参照
  
  // 関係
  relatedEmails?: string[];       // 関連メールのID
  knowledgeEntries?: string[];    // リンクされたナレッジエントリのID
  resolutionNoteId?: string;      // 解決ノートのID
  
  // コンテンツ（ノート本文に保存）
  body: string;                   // マークダウン形式のメール内容
  rawContent?: string;            // 元のメール形式を保持
}

enum EmailStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress", 
  RESOLVED = "resolved",
  ARCHIVED = "archived"
}

enum EmailCategory {
  SUPPORT = "support",
  SALES = "sales",
  BILLING = "billing",
  TECHNICAL = "technical",
  FEEDBACK = "feedback",
  OTHER = "other"
}

enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}
```

### DailySummary
特定日付のメールの集約ビュー（動的に生成）。

```typescript
interface DailySummary {
  date: Date;                    // サマリー日付
  emailCount: number;             // 受信メール総数
  
  // ステータス別内訳
  statusBreakdown: {
    pending: number;
    inProgress: number;
    resolved: number;
    archived: number;
  };
  
  // カテゴリ別内訳
  categoryBreakdown: {
    [key in EmailCategory]: number;
  };
  
  // 優先度分布
  priorityBreakdown: {
    [key in Priority]: number;
  };
  
  // メールリスト
  emails: EmailSummaryItem[];     // 簡素化されたメールデータ
  
  // 洞察
  topSenders: SenderStat[];       // 最も頻繁な送信者
  commonKeywords: string[];        // 抽出されたキーワード
  averageResponseTime?: number;    // 時間単位
}

interface EmailSummaryItem {
  id: string;
  sender: string;
  subject: string;
  time: string;                   // HH:MM形式
  status: EmailStatus;
  priority?: Priority;
}

interface SenderStat {
  email: string;
  name?: string;
  count: number;
}
```

### KnowledgeEntry
解決済み問い合わせから蓄積されたナレッジ。

```typescript
interface KnowledgeEntry {
  // メタデータ
  id: string;                    // 一意識別子
  title: string;                 // ナレッジタイトル
  createdDate: Date;             // 作成タイムスタンプ
  lastUpdated: Date;             // 最終更新
  tags: string[];                // 分類タグ
  category?: EmailCategory;      // 主要カテゴリ
  
  // コンテンツ
  problem: string;               // 問題の説明
  solution: string;              // 提供された解決策
  notes?: string;                // 追加メモ
  
  // 関係
  sourceEmails: string[];        // これの由来となるメールID
  relatedEntries?: string[];     // 関連ナレッジID
  
  // 使用追跡
  useCount: number;              // 参照回数
  lastUsed?: Date;               // 最終参照日
  effectiveness?: number;        // 成功率（0-100）
}
```

### ResolutionNote
解決済み問い合わせに追加されたフォローアップ情報。

```typescript
interface ResolutionNote {
  // メタデータ
  id: string;                    // 一意識別子
  emailId: string;               // 関連メールID
  resolvedDate: Date;            // 解決タイムスタンプ
  resolvedBy?: string;           // 解決者
  
  // コンテンツ
  summary: string;               // 解決の簡潔な要約
  details: string;               // 詳細な解決手順
  outcome: ResolutionOutcome;    // 解決の結果
  
  // フォローアップ
  followUpRequired: boolean;     // フォローアップが必要
  followUpDate?: Date;           // フォローアップ時期
  followUpNotes?: string;        // フォローアップ指示
  
  // ナレッジ抽出
  extractedToKnowledge: boolean; // ナレッジベースに追加済み
  knowledgeEntryId?: string;     // リンクされたナレッジエントリ
}

enum ResolutionOutcome {
  SOLVED = "solved",
  WORKAROUND = "workaround",
  NOT_RESOLVED = "not_resolved",
  DUPLICATE = "duplicate",
  NO_ACTION = "no_action"
}
```

### Tag
ユーザー定義の分類ラベル。

```typescript
interface Tag {
  name: string;                  // タグ識別子
  displayName: string;           // ユーザーフレンドリーな名前
  color?: string;                // UI用16進カラー
  description?: string;          // タグの目的
  parent?: string;               // 階層用の親タグ
  emailCount: number;            // タグ付きメール数
  createdDate: Date;             // 作成タイムスタンプ
}
```

### AttachmentRef
メール添付ファイルへの参照。

```typescript
interface AttachmentRef {
  filename: string;              // 元のファイル名
  mimeType: string;              // ファイルMIMEタイプ
  size: number;                  // ファイルサイズ（バイト）
  path: string;                  // ボルト内のパス
  extractedText?: string;        // 該当する場合のテキスト内容
}
```

## ファイル構造

```
Vault/
├── Emails/
│   ├── YYYY/
│   │   ├── MM/
│   │   │   ├── DD/
│   │   │   │   ├── {id}-{subject-slug}.md     # 個別メール
│   │   │   │   └── attachments/
│   │   │   │       └── {id}/                  # 添付ファイル
│   └── Threads/
│       └── {thread-id}.md                     # スレッドサマリー
├── Knowledge/
│   ├── {category}/
│   │   └── {id}-{title-slug}.md               # ナレッジエントリ
├── Resolutions/
│   └── {email-id}-resolution.md               # 解決ノート
├── Summaries/
│   └── daily/
│       └── YYYY-MM-DD.md                      # 日次サマリー（キャッシュ済み）
└── .email-inquiry/
    ├── config.json                             # プラグイン設定
    ├── tags.json                               # タグ定義
    └── indexes/
        ├── sender.json                         # 送信者インデックス
        └── thread.json                         # スレッドインデックス
```

## フロントマタースキーマ

### メールノートフロントマター
```yaml
---
type: email-inquiry
email-id: "550e8400-e29b-41d4-a716-446655440000"
sender: "user@example.com"
sender-name: "John Doe"
subject: "機能Xについての質問"
date: 2025-09-05T10:30:00Z
status: pending
tags: [support, feature-request]
category: support
thread-id: "thread-123"
priority: medium
attachments: 
  - filename: "screenshot.png"
    size: 45678
related-emails: ["id1", "id2"]
knowledge-entries: ["kb-001"]
resolution-note: "resolution-123"
---
```

### ナレッジエントリフロントマター
```yaml
---
type: knowledge-entry
knowledge-id: "kb-001"
title: "機能Xの問題を解決する方法"
created: 2025-09-01T09:00:00Z
updated: 2025-09-05T11:00:00Z
tags: [feature-x, troubleshooting]
category: technical
source-emails: ["email-001", "email-002"]
use-count: 15
effectiveness: 85
---
```

## 検証ルール

### EmailInquiry検証
- `id`: 必須、有効なUUID v4である必要
- `sender`: 必須、有効なメール形式である必要
- `subject`: 必須、最大200文字
- `receivedDate`: 必須、有効なISO 8601である必要
- `status`: 必須、有効なenum値である必要
- `tags`: オプション、メールあたり最大10タグ
- `body`: 必須、空でない

### DailySummary検証
- `date`: 必須、有効な日付である必要
- `emailCount`: 必須、非負の整数
- 動的に生成、保存されない

### KnowledgeEntry検証
- `title`: 必須、最大100文字
- `problem`: 必須、最大500文字
- `solution`: 必須、空でない
- `sourceEmails`: 必須、少なくとも1つのメール
- `useCount`: 必須、非負の整数

### ResolutionNote検証
- `emailId`: 必須、既存メールを参照する必要
- `summary`: 必須、最大200文字
- `outcome`: 必須、有効なenum値
- `followUpDate`: 提供される場合、未来の日付である必要

## 状態遷移

### メールステータスフロー
```
PENDING → IN_PROGRESS → RESOLVED → ARCHIVED
   ↓          ↓            ↓
ARCHIVED   ARCHIVED    （終端）
```

### ルール:
1. 新しいメールはPENDINGで開始
2. 任意の状態からARCHIVEDに遷移可能
3. RESOLVEDメールはIN_PROGRESSに再開可能
4. ARCHIVEDは手動変更されない限り終端

## インデックス化戦略

### 主要インデックス
1. **日付インデックス**: 日次サマリー用の受信日別メール
2. **送信者インデックス**: 関係追跡用の送信者別メール
3. **スレッドインデックス**: 会話ビュー用のスレッドID別メール
4. **タグインデックス**: 分類用のタグ別メール
5. **ステータスインデックス**: ワークフロー用のステータス別メール

### 検索最適化
- Obsidianによるフロントマターフィールドのインデックス化
- メール本文の全文検索
- サマリー用のキャッシュされた集約
- 変更時の増分更新

## データ移行

### バージョン1.0.0 → 将来
- フロントマタースキーマのバージョン管理
- 2つのメジャーバージョンでの後方互換性
- 構造変更用の移行スクリプト
- 移行前のバックアップ

## パフォーマンス考慮事項

### 制限
- ボルトあたり最大10,000メール（ソフト制限）
- 1日あたり最大100メール推奨
- スレッドあたり最大50メール
- サマリーキャッシュ: 5分TTL
- インデックス再構築: 変更時に増分

### 最適化
- メール内容の遅延読み込み
- リストのページネーション（ページあたり50項目）
- 一括インポート用のバックグラウンドインデックス化
- 古いメール（1年以上）の圧縮

## セキュリティとプライバシー

### 機密データ
- メールアドレス: そのまま保存（ユーザーの責任）
- メール内容: 暗号化されない（ボルト暗号化推奨）
- 添付ファイル: ボルトに保存（ノートと同じセキュリティ）

### ベストプラクティス
- 定期的なボルトバックアップ
- インポート前のメールサニタイズ
- 機密データに対するボルト暗号化の使用
- プラグイン権限の制限