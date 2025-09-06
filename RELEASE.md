# 📧 Email Inquiry Management Plugin v1.0.0

## ✨ 新機能

### 🎌 完全日本語対応
- **日本語インターフェース** - すべてのメニュー、ボタン、メッセージを日本語化
- **リアルタイム言語切り替え** - 設定でいつでも English ⇔ 日本語 の切り替え可能
- **ローカライズされたコマンド** - コマンドパレットも日本語対応

### 📋 新カテゴリシステム
4つの実用的なデフォルトカテゴリに刷新：
- **仕様** (Specification) - 要件確認、仕様相談、設計相談
- **障害** (Issue) - バグレポート、システム障害、不具合報告
- **移行/VUP** (Migration/VUP) - システム移行、バージョンアップ
- **その他** (Other) - 一般的な問い合わせ

### 🏷️ カスタムカテゴリ管理
- **無制限追加** - 業務に合わせて独自カテゴリを追加
- **視覚的管理** - タグ形式で表示、×ボタンで簡単削除
- **削除確認** - 誤操作防止の確認ダイアログ
- **既存メール保護** - カテゴリ削除しても既存メールに影響なし

### 📧 強化されたメール管理
- **リッチモーダルUI** - 使いやすいメール入力フォーム
- **優先度システム** - 低、中、高、緊急の4段階
- **自動ファイル整理** - 日付別フォルダ構造（YYYY/MM）
- **メタデータ管理** - 送信者、件名、日時、ステータス等を構造化

### 🔧 開発者向け機能
- **TypeScript完全対応** - 型安全な開発環境
- **テストインフラ** - Jest によるユニット・統合テスト
- **CLI ツール** - バッチ処理、サマリー生成、ナレッジ抽出
- **国際化システム** - 簡単に他言語追加可能

## 🚀 インストール方法

### 手動インストール

1. **ファイルをダウンロード**
   - `main.js` - プラグイン本体
   - `manifest.json` - プラグイン情報

2. **プラグインフォルダに配置**
   ```
   <your-vault>/.obsidian/plugins/email-inquiry-management/
   ├── main.js
   └── manifest.json
   ```

3. **プラグインを有効化**
   - Obsidian を再起動
   - 設定 → コミュニティプラグイン → Email Inquiry Management を有効化

### ソースからビルド

```bash
git clone https://github.com/beniyasan/obsidian-email-inquiry.git
cd obsidian-email-inquiry
npm install
npm run build
```

## 📖 使用方法

### 基本的な使い方

1. **メールをキャプチャ**
   - `Ctrl+P` でコマンドパレットを開く
   - 「メールをキャプチャ」と入力してEnter

2. **情報を入力**
   - 送信者メール（必須）
   - 件名（必須）
   - カテゴリ選択
   - 優先度設定
   - メール内容（必須）

3. **完了**
   - 「メールをキャプチャ」ボタンをクリック
   - Emails フォルダに自動保存

### カスタムカテゴリの管理

1. **設定を開く**: 設定 → Email Inquiry Management
2. **カスタムカテゴリ**セクションへ移動
3. **カテゴリ名を入力**して「追加」ボタン
4. **削除**：各カテゴリの×ボタンをクリック

## 🌍 対応言語

- 🇯🇵 **日本語** - 完全対応
- 🇺🇸 **English** - Full support

言語切り替えは 設定 → 詳細設定 → 言語 から可能です。

## 🔧 システム要件

- **Obsidian**: v1.4.0 以上
- **OS**: Windows, macOS, Linux
- **Node.js**: v18+ (開発時のみ)

## 🐛 既知の問題

- 大容量メール（10MB超）の処理に時間がかかる場合があります
- 一部の特殊文字を含むメールで文字化けが発生する可能性があります

## 📝 今後の予定

- **v1.1.0**: 自動分類機能の追加
- **v1.2.0**: テンプレート機能の実装
- **v1.3.0**: 統計・分析機能の強化

## 🙏 謝辞

このプラグインは以下の技術・ライブラリを使用しています：

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [TypeScript](https://www.typescriptlang.org/)
- [esbuild](https://esbuild.github.io/)
- [Jest](https://jestjs.io/)

## 📞 サポート

- **バグレポート**: [GitHub Issues](https://github.com/beniyasan/obsidian-email-inquiry/issues)
- **機能要求**: [GitHub Issues](https://github.com/beniyasan/obsidian-email-inquiry/issues)
- **ディスカッション**: [GitHub Discussions](https://github.com/beniyasan/obsidian-email-inquiry/discussions)

---

**Happy Email Management! 📧✨**

*このリリースにより、Obsidian でのメール管理が格段に向上します。日本語完全対応で、より多くのユーザーにご利用いただけるようになりました。*