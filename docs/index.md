# 📧 Email Inquiry Management Plugin

Obsidian 用のメール問い合わせ管理プラグインへようこそ！

## 🎌 日本語完全対応

このプラグインは日本語のユーザーを第一に考えて開発されました。すべてのUI、メッセージ、コマンドが自然な日本語で表示されます。

## ✨ 主な機能

### 📬 スマートなメール管理
- **ワンクリックキャプチャ** - 簡単操作でメール情報を Obsidian に取り込み
- **自動分類システム** - 4つの実用的なカテゴリで効率的に整理
- **優先度管理** - 緊急度に応じた4段階の優先度設定

### 🏷️ 柔軟なカテゴリシステム
- **仕様** - 要件確認、仕様相談、設計関連
- **障害** - バグレポート、システム障害、不具合
- **移行/VUP** - システム移行、バージョンアップ
- **その他** - 一般的な問い合わせ
- **カスタムカテゴリ** - 独自の分類を無制限追加

### 🌍 多言語インターフェース
- **日本語** - 完全ローカライズ
- **English** - Full support
- **リアルタイム切り替え** - 設定からワンクリックで言語変更

## 🚀 クイックスタート

### インストール

1. **ファイルをダウンロード**
   - [最新リリース](https://github.com/beniyasan/obsidian-email-inquiry/releases)から `main.js` と `manifest.json` を取得

2. **プラグインフォルダに配置**
   ```
   <vault>/.obsidian/plugins/email-inquiry-management/
   ├── main.js
   └── manifest.json
   ```

3. **有効化**
   - Obsidian 再起動後、設定 → コミュニティプラグイン → Email Inquiry Management を有効化

### 基本的な使い方

1. **`Ctrl+P`** でコマンドパレットを開く
2. **「メールをキャプチャ」** と入力
3. **メール詳細を入力** して保存
4. **Emails フォルダ** で自動整理された内容を確認

## 📚 ドキュメント

### 📖 詳細ガイド
- [**インストールガイド**](installation.md) - 詳細なセットアップ手順
- [**使用方法**](usage.md) - 機能別の使い方説明
- [**カスタマイズ**](customization.md) - 設定とカスタマイズ方法
- [**トラブルシューティング**](troubleshooting.md) - よくある問題と解決方法

### 🔧 開発者向け
- [**API ドキュメント**](api.md) - プラグインAPI の詳細
- [**開発ガイド**](development.md) - 開発環境の構築方法
- [**コントリビューション**](contributing.md) - プロジェクトへの貢献方法

## 💡 使用例

### 📋 カスタマーサポート
```markdown
---
sender: "customer@example.com"
subject: "ログイン問題について"
category: "障害"
priority: "high"
---

お客様からのログイン障害報告を構造化して管理
```

### 🔧 開発チーム
```markdown
---
sender: "dev@company.com"  
subject: "API仕様の確認"
category: "仕様"
priority: "medium"
---

開発者間の仕様確認やレビュー依頼を整理
```

### 🚀 システム運用
```markdown
---
sender: "ops@company.com"
subject: "サーバー移行計画"
category: "移行/VUP"
priority: "urgent"
---

インフラ移行やアップグレード計画を一元管理
```

## 🎯 こんな方におすすめ

- **📧 メールベースのサポート業務**をしている方
- **📝 顧客とのやり取り**を体系的に管理したい方  
- **🏢 チームでの情報共有**を効率化したい方
- **🔍 過去のメール**から知識を蓄積したい方
- **📊 問い合わせの傾向**を分析したい方

## 🔗 リンク集

### プロジェクト
- [**GitHub リポジトリ**](https://github.com/beniyasan/obsidian-email-inquiry) - ソースコード
- [**リリース**](https://github.com/beniyasan/obsidian-email-inquiry/releases) - 最新版ダウンロード
- [**Issues**](https://github.com/beniyasan/obsidian-email-inquiry/issues) - バグレポート・機能要求

### コミュニティ
- [**Discussions**](https://github.com/beniyasan/obsidian-email-inquiry/discussions) - 質問・議論
- [**Obsidian コミュニティ**](https://obsidian.md/community) - Obsidian 全般

## 🆕 最新情報

### v1.0.0 (2024-09-06)
- 🎌 **日本語完全対応** - UI 全体の日本語化完了
- 📋 **新カテゴリシステム** - 4つの実用的なデフォルトカテゴリ  
- 🏷️ **カスタムカテゴリ** - 無制限のカテゴリ追加・管理機能
- 🔧 **開発環境整備** - TypeScript、Jest、国際化システム

---

**📧 効率的なメール管理で、あなたの業務を革新しましょう！**

*このプラグインは日本のユーザーのニーズを第一に考えて開発されました。ご不明な点がございましたら、お気軽にお問い合わせください。*