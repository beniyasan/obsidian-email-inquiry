# 📧 Obsidian Email Inquiry Management Plugin

![Plugin Version](https://img.shields.io/badge/version-1.0.0-blue)
![Obsidian Version](https://img.shields.io/badge/obsidian-%3E%3D1.4.0-purple)
![License](https://img.shields.io/badge/license-MIT-green)

メール問い合わせを効率的に管理し、ナレッジベースを構築するための Obsidian プラグインです。日本語完全対応で、メールサポート業務を検索可能な知識ベースに変換します。

## ✨ 機能

### 📧 メールキャプチャ
- **ワンクリックメールキャプチャ** - リッチなモーダルインターフェース
- **自動メタデータ抽出** - 送信者、件名、日付、添付ファイル
- **スマートカテゴリ分類** - 4つのデフォルトカテゴリ：
  - **仕様** (Specification) - 要件確認、仕様相談、設計相談
  - **障害** (Issue) - バグレポート、システム障害、不具合報告
  - **移行/VUP** (Migration/VUP) - システム移行、バージョンアップ
  - **その他** (Other) - 一般的な問い合わせ
- **カスタムカテゴリ** - 無制限にカテゴリを追加可能
- **優先度設定** - 低、中、高、緊急
- **タグ管理** - オートコンプリート機能付き
- **ファイル整理** - 日付別構造（YYYY/MM形式）

### 🌍 多言語対応
- **日本語完全対応** - すべてのUIを日本語化
- **英語インターフェース** - English interface
- **リアルタイム言語切替** - 設定から即座に切り替え
- **ローカライズされたコマンドとメニュー**

### 📊 日次サマリー
- **自動日次レポート** - ステータス内訳付き
- **カテゴリと優先度の分析**
- **ピーク時間の特定**
- **キーワードトレンド分析**
- **エクスポートオプション** - Markdown、CSV、JSON

### 🔍 ナレッジベース
- **解決済みメールから自動でソリューション抽出**
- **検索可能なナレッジリポジトリ**
- **関連メールのリンク**
- **ソリューション効果の追跡**

### 🛠️ CLI ツール
- **メールパーサーCLI** - バッチ処理対応（EML、MBOX、CSV）
- **サマリー生成CLI** - 自動レポート作成
- **ナレッジ抽出CLI** - ソリューションマイニング

## 🚀 インストール

### 方法1: 手動インストール（推奨）

1. **プラグインファイルをダウンロード:**
   - Releasesから `main.js` と `manifest.json` をダウンロード
   
2. **プラグインディレクトリを作成:**
   ```bash
   # Obsidian Vaultに移動
   mkdir -p .obsidian/plugins/email-inquiry-management
   ```

3. **プラグインファイルをコピー:**
   ```bash
   # プラグインディレクトリにファイルをコピー
   cp main.js .obsidian/plugins/email-inquiry-management/
   cp manifest.json .obsidian/plugins/email-inquiry-management/
   ```

4. **プラグインを有効化:**
   - Obsidianを再起動
   - 設定 → コミュニティプラグイン
   - "Email Inquiry Management"を有効化

### 方法2: ソースからビルド

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/obsidian-email-inquiry.git
cd obsidian-email-inquiry

# 依存関係をインストール
npm install

# ビルド
npm run build

# Vaultにコピー
cp main.js manifest.json <vault>/.obsidian/plugins/email-inquiry-management/
```

## 📖 使用方法

### 🎯 クイックスタート

1. **最初のメールをキャプチャ:**
   - `Ctrl+P` を押してコマンドパレットを開く
   - "メールをキャプチャ" と入力してEnter
   - またはリボンの 📧 アイコンをクリック

2. **メール詳細を入力:**
   - **送信者メール** (必須): customer@example.com
   - **送信者名** (任意): 田中太郎
   - **件名** (必須): ログイン問題 - ダッシュボードにアクセスできません
   - **カテゴリ**: 仕様
   - **優先度**: 中
   - **タグ**: ログイン問題, ダッシュボード, 緊急
   - **メール内容**: メール本文を貼り付け

3. **"メールをキャプチャ" をクリック** - 完了！ ✅

### 📂 ファイル組織

メールは自動的に以下のように整理されます：

```
Emails/
└── 2024/
    └── 09/
        ├── 05-14-30-login-issue-cannot-access-dashboard.md
        ├── 05-15-45-billing-question-invoice-payment.md
        └── ...

Summaries/
├── 2024-09-05-daily-summary.md
├── 2024-09-06-daily-summary.md
└── ...

Knowledge/
├── login-troubleshooting-guide.md
├── payment-processing-solutions.md
└── ...
```

### 📋 メールノートのフォーマット

キャプチャされた各メールは構造化されたノートになります：

```markdown
---
id: "email-123-456-789"
sender: "customer@example.com"
senderName: "田中太郎"
subject: "ログイン問題 - ダッシュボードにアクセスできません"
receivedDate: "2024-09-05T14:30:00+09:00"
status: "pending"
tags: ["ログイン問題", "ダッシュボード", "サポート"]
category: "specification"
priority: "medium"
---

# ログイン問題 - ダッシュボードにアクセスできません

**From:** 田中太郎 <customer@example.com>
**Date:** 2024-09-05T14:30:00+09:00
**Status:** pending

## 内容

お世話になっております。

ダッシュボードにログインできない問題が発生しています...

## メモ

<!-- 解決メモをここに追加 -->
```

### 📊 日次サマリーの生成

1. **手動生成:**
   - コマンドパレット → "日次サマリーを生成"
   - または設定で自動生成を有効化

2. **サマリーに含まれる内容:**
   - メール総数とステータス内訳
   - カテゴリと優先度の分布
   - ピーク時間分析
   - トップ送信者とキーワード
   - 時系列メールタイムライン

### 🔍 ナレッジ抽出

1. **メールを解決済みにマーク:**
   - `status` フィールドを "resolved" に更新
   - "メモ" セクションに解決詳細を追加

2. **ナレッジを抽出:**
   - コマンドパレット → "ナレッジを抽出"
   - 解決済みメールを選択
   - システムが再利用可能なナレッジエントリを作成

### 📚 CLI ツールの使用方法

#### Email Parser CLI

```bash
# Parse EML file to JSON
npm run cli:email-parser -- --input email.eml --format json

# Parse MBOX to Markdown
npm run cli:email-parser -- --input mailbox.mbox --format markdown --output parsed.md

# Show help
npm run cli:email-parser -- --help
```

#### Daily Summary CLI

```bash
# Generate today's summary
npm run cli:daily-summary -- --format markdown

# Generate specific date summary
npm run cli:daily-summary -- --date 2024-09-05 --output summary.md

# Include resolved emails
npm run cli:daily-summary -- --include-resolved --format csv
```

#### Knowledge Base CLI

```bash
# Search knowledge base
npm run cli:knowledge-base -- --search "login issues"

# Extract knowledge from resolved email
npm run cli:knowledge-base -- --extract email-123 --output knowledge.md
```

## ⚙️ 設定

### プラグイン設定

設定へのアクセス: **設定 → Email Inquiry Management**

#### フォルダ設定
- **メールフォルダ**: `Emails` (キャプチャしたメールの保存先)
- **サマリーフォルダ**: `Summaries` (日次サマリーの保存先)
- **ナレッジフォルダ**: `Knowledge` (抽出したナレッジの保存先)

#### デフォルト値
- **デフォルトカテゴリ**: 仕様、障害、移行/VUP、その他
- **デフォルト優先度**: 低、中、高、緊急

#### 自動化
- **日次サマリーの自動生成**: ✅ 有効
- **ナレッジの自動抽出**: ❌ 無効 (手動レビューを推奨)

#### ファイル処理
- **最大添付ファイルサイズ**: 10MB
- **通知を有効化**: ✅ 有効

### 詳細設定

#### カスタムカテゴリ

プラグイン設定でカスタムカテゴリを追加:

```json
{
  "customCategories": [
    "バグレポート",
    "機能要求", 
    "アカウント問題",
    "会計相談",
    "セキュリティ",
    "運用相談"
  ]
}
```

#### Workflow Automation

Set up automated workflows using Obsidian's Templater plugin:

1. **Auto-tagging** based on email content
2. **Smart categorization** using keywords
3. **Priority assignment** based on sender or keywords
4. **Follow-up reminders** for pending emails

## 🎨 カスタマイズ

### Custom CSS Styling

Add to your `snippets/email-inquiry.css`:

```css
/* Email status indicators */
.email-status-pending { color: #ffa500; }
.email-status-resolved { color: #28a745; }
.email-status-archived { color: #6c757d; }

/* Priority badges */
.priority-urgent { 
  background: #dc3545; 
  color: white; 
  padding: 2px 6px; 
  border-radius: 3px; 
}

.priority-high { 
  background: #fd7e14; 
  color: white; 
  padding: 2px 6px; 
  border-radius: 3px; 
}
```

### Custom Templates

Create templates in `.obsidian/plugins/email-inquiry-management/templates/`:

```markdown
<!-- email-template.md -->
---
id: "{{id}}"
sender: "{{sender}}"
subject: "{{subject}}"
status: "pending"
tags: []
category: ""
priority: "medium"
---

# {{subject}}

**From:** {{sender}}
**Date:** {{date}}

## Content

{{content}}

## Action Items

- [ ] Initial response sent
- [ ] Issue reproduced
- [ ] Solution implemented
- [ ] Follow-up scheduled

## Notes

<!-- Resolution details -->
```

## 🤝 ワークフロー例

### Customer Support Workflow

1. **Email arrives** → Capture with plugin
2. **Auto-categorize** as "support"
3. **Assign priority** based on keywords
4. **Add initial tags** (bug, feature-request, etc.)
5. **Work on resolution** → Update notes section
6. **Mark as resolved** → Auto-extract to knowledge base
7. **Review daily summary** → Identify patterns

### Sales Inquiry Workflow

1. **Lead email** → Capture as "sales" category
2. **High priority** → Tag with "hot-lead"
3. **Track follow-ups** → Update status to "in_progress"
4. **Close deal** → Mark as "resolved"
5. **Extract best practices** → Add to knowledge base

### Bug Report Workflow

1. **Bug report email** → Capture with "technical" category
2. **Tag with severity** → "critical", "minor", etc.
3. **Link to related emails** → Use email ID references
4. **Document solution** → Detailed resolution notes
5. **Create knowledge entry** → Reusable troubleshooting guide

## 📈 分析とレポート

### Built-in Metrics

- **Response time tracking** (planned feature)
- **Resolution rate by category**
- **Peak support hours**
- **Most common issues**
- **Team performance metrics** (multi-user setups)

### Custom Queries

Use Obsidian's Dataview plugin for custom reports:

```dataview
TABLE sender, subject, status, priority
FROM "Emails"
WHERE status = "pending" AND priority = "urgent"
SORT receivedDate DESC
```

```dataview
TABLE status, count(rows) as "Count"
FROM "Emails" 
WHERE receivedDate >= date(today) - dur(7 days)
GROUP BY status
```

## 🛠️ 開発

### ソースからのビルド

```bash
# Clone the repository
git clone <repository-url>
cd email-inquiry-management

# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test

# Development mode (with hot reload)
npm run dev
```

### Project Structure

```
src/
├── models/           # Data models (EmailInquiry, DailySummary, etc.)
├── services/         # Business logic services
├── plugin/           # Obsidian plugin integration
│   ├── adapters/     # Obsidian API adapters
│   ├── modals/       # UI modals and forms
│   └── settings/     # Plugin settings
├── cli/              # Command-line tools
├── lib/              # Standalone libraries
└── types/            # TypeScript type definitions

tests/
├── contract/         # Contract tests (TDD approach)
├── integration/      # Integration tests
└── unit/             # Unit tests
```

### コントリビュート

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TDD approach (write tests first)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 🐛 トラブルシューティング

### Common Issues

#### Plugin Not Loading

1. **Check Obsidian version** (requires ≥1.4.0)
2. **Verify files** (`main.js` and `manifest.json` in plugin folder)
3. **Restart Obsidian** after installation
4. **Enable in settings** (Community Plugins → Email Inquiry Management)

#### Email Capture Fails

1. **Check required fields** (sender, subject, body)
2. **Verify email format** (valid email address)
3. **Check folder permissions** (Emails folder writable)
4. **Review error notifications** in Obsidian

#### Daily Summary Empty

1. **Verify email date format** (YYYY-MM-DD in frontmatter)
2. **Check include settings** (resolved/archived emails)
3. **Confirm email folder structure** (Emails/YYYY/MM/)

#### CLI Tools Not Working

1. **Install dependencies**: `npm install`
2. **Build project**: `npm run build`
3. **Check Node.js version** (≥18.0.0)
4. **Verify file paths** in commands

### Debug Mode

Enable debug logging in plugin settings for detailed error information:

```javascript
// Add to Obsidian console (Ctrl+Shift+I)
localStorage.setItem('email-inquiry-debug', 'true');
```

### Performance Optimization

For large email volumes (>1000 emails):

1. **Enable caching** in plugin settings
2. **Archive old emails** regularly
3. **Use date-range filtering** in summaries
4. **Split large MBOX files** before import

## 📄 ライセンス

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 謝辞

- Built with [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- Inspired by customer support best practices
- Email parsing powered by industry-standard libraries
- Icons from [Lucide](https://lucide.dev/)

## 📞 サポートとコミュニティ

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)  
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Discord**: [Community Discord](https://discord.gg/your-channel)

---

**Obsidian コミュニティのために ❤️ を込めて作られました**

*メールの混沌を整理された知識に変換。今日からメール問い合わせナレッジベースの構築を始めましょう！*