# CLIコマンド契約

## メール解析CLI

### コマンド: email-parser
Obsidianノート用にメール内容を解析・構造化します。

```bash
email-parser --help
email-parser --version
email-parser parse [オプション]
```

#### オプション:
- `--input, -i <ファイル>`: 入力メールファイル（.eml, .msg）
- `--format, -f <形式>`: 出力形式（json|markdown|yaml）[デフォルト: json]
- `--extract-attachments`: 添付ファイルを抽出して保存
- `--output, -o <ファイル>`: 出力ファイルパス
- `--preserve-html`: HTML書式を保持

#### 入力 (stdinまたはファイル):
```
生のメール内容またはファイルパス
```

#### 出力 (stdout):
```json
{
  "sender": "user@example.com",
  "senderName": "田中太郎",
  "subject": "メール件名",
  "date": "2025-09-05T10:30:00Z",
  "body": "マークダウン形式のメール内容",
  "attachments": [
    {
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 102400
    }
  ]
}
```

#### 終了コード:
- 0: 成功
- 1: 無効な入力形式
- 2: ファイル未発見
- 3: 解析エラー

## 日次サマリーCLI

### コマンド: daily-summary
Obsidian用の日次メールサマリーを生成します。

```bash
daily-summary --help
daily-summary --version
daily-summary generate [オプション]
```

#### オプション:
- `--date, -d <日付>`: サマリー対象日（YYYY-MM-DD）[デフォルト: 今日]
- `--vault, -v <パス>`: Obsidianボルトパス
- `--format, -f <形式>`: 出力形式（json|markdown|html）[デフォルト: markdown]
- `--include-resolved`: 解決済みメールを含む
- `--include-archived`: アーカイブ済みメールを含む
- `--output, -o <ファイル>`: 出力ファイルパス

#### 入力:
指定パスのObsidianボルトから読み取り

#### 出力 (stdout):
```markdown
# 日次サマリー: 2025-09-05

## 概要
- 総メール数: 15
- 保留中: 5
- 処理中: 3
- 解決済み: 7

## カテゴリ別
- サポート: 8
- 営業: 4
- 技術: 3

## メール一覧
1. **10:30** - user@example.com - "機能に関する質問" [保留中]
2. **11:45** - customer@company.com - "請求書問い合わせ" [解決済み]
...
```

#### 終了コード:
- 0: 成功
- 1: 無効な日付形式
- 2: ボルト未発見
- 3: 該当日のメールなし

## ナレッジベースCLI

### コマンド: knowledge-base
ナレッジエントリを検索・管理します。

```bash
knowledge-base --help
knowledge-base --version
knowledge-base search [オプション]
knowledge-base extract [オプション]
```

### サブコマンド: search
解決策をナレッジベースから検索します。

#### オプション:
- `--query, -q <テキスト>`: 検索クエリ
- `--tags, -t <タグ>`: タグでフィルター（カンマ区切り）
- `--category, -c <カテゴリ>`: カテゴリでフィルター
- `--vault, -v <パス>`: Obsidianボルトパス
- `--format, -f <形式>`: 出力形式（json|markdown|list）[デフォルト: json]
- `--limit, -l <数値>`: 最大結果数 [デフォルト: 10]

#### 出力 (stdout):
```json
{
  "results": [
    {
      "id": "kb-001",
      "title": "機能Xを解決する方法",
      "problem": "機能Xが動作しない",
      "solution": "修正手順...",
      "score": 0.95,
      "path": "Knowledge/technical/kb-001.md"
    }
  ],
  "totalCount": 1
}
```

### サブコマンド: extract
解決済みメールからナレッジを抽出します。

#### オプション:
- `--email-id, -e <ID>`: 抽出対象のメールID
- `--vault, -v <パス>`: Obsidianボルトパス
- `--title, -t <タイトル>`: ナレッジエントリタイトル
- `--tags <タグ>`: エントリのタグ（カンマ区切り）

#### 入力 (stdin):
```json
{
  "problem": "問題の説明",
  "solution": "解決方法",
  "notes": "追加コンテキスト"
}
```

#### 出力 (stdout):
```json
{
  "knowledgeId": "kb-002",
  "path": "Knowledge/kb-002.md",
  "linkedEmails": ["email-001"]
}
```

#### 終了コード:
- 0: 成功
- 1: 無効な入力
- 2: ボルト未発見
- 3: メール未発見
- 4: 抽出失敗

## 共通CLI規約

### グローバルオプション（全コマンド）:
- `--help, -h`: ヘルプメッセージを表示
- `--version, -V`: バージョン番号を表示
- `--verbose, -v`: 詳細出力
- `--quiet, -q`: エラー以外の出力を抑制
- `--config, -c <ファイル>`: 設定ファイルパス

### 出力形式:
- `json`: 機械読み取り可能なJSON
- `markdown`: 人間が読みやすいMarkdown
- `yaml`: YAML形式
- `list`: シンプルなテキストリスト
- `html`: HTML形式（表示用）

### 環境変数:
- `OBSIDIAN_VAULT`: デフォルトボルトパス
- `EMAIL_INQUIRY_CONFIG`: デフォルト設定ファイル
- `LOG_LEVEL`: ログレベル（debug|info|warn|error）

### 設定ファイル:
```yaml
vault: /path/to/vault
defaults:
  format: markdown
  includeResolved: true
  includeArchived: false
  summaryCache: 300  # 秒
email:
  maxAttachmentSize: 10485760  # 10MB
  preserveHtml: false
knowledge:
  autoExtract: true
  minEffectiveness: 70
```

### エラー出力形式:
```json
{
  "error": {
    "code": "PARSE_ERROR",
    "message": "メールの解析に失敗しました",
    "details": {
      "line": 42,
      "reason": "無効なヘッダー形式"
    }
  }
}
```