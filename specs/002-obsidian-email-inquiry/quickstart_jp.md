# クイックスタートガイド: Obsidianメール問い合わせ管理

## インストール

1. **プラグインをインストール**:
   ```bash
   # リポジトリをクローン
   git clone https://github.com/your-org/obsidian-email-inquiry.git
   cd obsidian-email-inquiry
   
   # 依存関係をインストール
   npm install
   
   # プラグインをビルド
   npm run build
   
   # ボルトのプラグインフォルダにコピー
   cp -r dist/* /path/to/vault/.obsidian/plugins/email-inquiry/
   ```

2. **プラグインを有効化**:
   - Obsidian設定 → コミュニティプラグインを開く
   - 「Email Inquiry Management」を有効にする
   - 初期設定を構成

## 基本的な使い方

### 1. 最初のメールを取り込む

**方法A: クイック取り込み（ホットキー）**
1. メールクライアントからメール内容をコピー
2. `Ctrl+Shift+E`を押す（カスタマイズ可能）
3. 取り込みダイアログを入力:
   - 送信者メール（可能であれば自動検出）
   - 件名
   - タグ/カテゴリ
4. 「取り込み」をクリック

**方法B: ドラッグ＆ドロップ**
1. メールクライアントから.emlファイルとして保存
2. ファイルをObsidianにドラッグ
3. プラグインが自動的にノートを作成

**方法C: コマンドパレット**
1. コマンドパレットを開く（`Ctrl+P`）
2. 「Email: Capture new inquiry」と入力
3. モーダルに内容を貼り付け

**結果**: `Emails/2025/09/05/[id]-subject.md`に新しいノートが作成されます

### 2. 日次サマリーを表示

**今日のサマリーを生成**:
1. コマンドパレット → 「Email: Today's summary」
2. またはリボンのカレンダーアイコンをクリック

**特定の日付を表示**:
1. コマンドパレット → 「Email: Generate daily summary」
2. ピッカーから日付を選択
3. 新しいペインでサマリーが開きます

**サマリービューのサンプル**:
```markdown
# 日次サマリー: 2025年9月5日

## 統計
📧 総数: 12 | ✅ 解決済み: 8 | ⏳ 保留中: 4

## カテゴリ別
- サポート: 7
- 営業: 3
- 技術: 2

## メールタイムライン
- 09:15 - john@example.com - "ログイン問題" [解決済み]
- 10:30 - mary@company.com - "料金に関する質問" [保留中]
...
```

### 3. 検索とナレッジ構築

**既存ナレッジを検索**:
1. コマンドパレット → 「Email: Search knowledge base」
2. 検索用語を入力
3. 関連性スコア付きで結果を閲覧

**解決済みメールからナレッジを抽出**:
1. 解決済みメールノートを開く
2. コマンドパレット → 「Email: Extract to knowledge base」
3. 生成されたナレッジエントリを編集
4. 関連メールをリンク

### 4. 既存メールの一括インポート

**.mboxファイルからインポート**:
```bash
# CLIを使用
email-parser bulk-import --format mbox --file export.mbox --vault /path/to/vault

# またはUI経由
1. 設定 → Email Inquiry → インポート
2. ファイルと形式を選択
3. デフォルトタグ/カテゴリを選択
4. 「インポート」をクリック
```

## 一般的なワークフロー

### ワークフロー1: 朝のメールトリアージ
```
1. 夜間メールをインポート（一括または個別）
2. 朝のサマリーを生成
3. 新しいメールにタグ付けと分類
4. アクティブ項目のステータスを「進行中」に更新
5. 昨日のフォローアップを確認
```

### ワークフロー2: 解決と文書化
```
1. 保留中メールを開く
2. 解決策と共に解決ノートを追加
3. 解決済みとしてマーク
4. 有価値な場合はナレッジベースに抽出
5. 必要に応じてフォローアップリマインダーを設定
```

### ワークフロー3: 週次パターン分析
```
1. 週次サマリーレポートを生成
2. トップ問題と送信者を確認
3. 繰り返される問題を特定
4. パターンに対してナレッジエントリを作成
5. メールテンプレート/回答を更新
```

## セットアップのテスト

### テスト1: メール取り込み
```bash
# CLI解析をテスト
echo "From: test@example.com
Subject: テストメール
Date: 2025-09-05 10:00:00

これはテストメールの本文です。" | email-parser parse --format json

# 期待値: 解析されたメールデータのJSON
```

### テスト2: 日次サマリー
```bash
# テストサマリーを生成
daily-summary generate --date 2025-09-05 --vault /path/to/vault

# 期待値: その日のメールのマークダウンサマリー
```

### テスト3: ナレッジ検索
```bash
# ナレッジベースを検索
knowledge-base search --query "ログイン問題" --vault /path/to/vault

# 期待値: 関連ナレッジエントリ
```

## 設定

### 必須設定
`.obsidian/plugins/email-inquiry/data.json`を編集:

```json
{
  "emailFolder": "Emails",
  "knowledgeFolder": "Knowledge",
  "summaryFolder": "Summaries",
  "defaultTags": ["inbox"],
  "autoExtractKnowledge": true,
  "summaryHotkey": "Ctrl+Shift+S",
  "captureHotkey": "Ctrl+Shift+E"
}
```

### メールテンプレート
`Templates/email-response.md`を作成:

```markdown
---
tags: [response-template]
---

## 元の問い合わせ
{{email_subject}}
差出人: {{sender}}
日付: {{date}}

## 回答
{{sender_name}}様、

[ここにあなたの回答]

## 内部メモ
- カテゴリ: {{category}}
- 優先度: {{priority}}
- 関連: {{related_emails}}
```

## トラブルシューティング

### 問題: メールが日次サマリーに表示されない
**解決策**: フロントマターのメール日付が期待される形式（ISO 8601）と一致するか確認

### 問題: 検索でメールが見つからない
**解決策**: 検索インデックスを再構築: コマンド → 「Email: Rebuild index」

### 問題: 一括インポートが失敗する
**解決策**: 
1. ファイル形式が選択と一致するか確認
2. ファイルサイズが100MB未満か確認
3. ソース内の不正なメールを確認

### 問題: ナレッジ抽出が空
**解決策**: 抽出前にメールに解決ノートがあることを確認

## ヒント＆ベストプラクティス

1. **一貫したタグ使用**: より良い組織化のためにタグ階層を作成
2. **定期的なサマリー**: パターンのために日次サマリーを確認
3. **クイックテンプレート**: 一般的な問題に対する回答テンプレートを設定
4. **古いメールのアーカイブ**: 1年以上経過した解決済みメールをアーカイブに移動
5. **関連メールをリンク**: 会話を接続するために`[[email-id]]`を使用
6. **キーボードショートカット**: より速いワークフローのためにホットキーを学習
7. **定期的なバックアップ**: ボルト同期またはバックアップを有効化

## 次のステップ

1. ✅ あなたのワークフローに合わせて設定をカスタマイズ
2. ✅ 既存のメールアーカイブをインポート
3. ✅ 日次サマリー自動化を設定
4. ✅ ナレッジベースカテゴリを作成
5. ✅ チームにワークフローをトレーニング

## サポート

- GitHub Issues: [github.com/your-org/obsidian-email-inquiry](https://github.com)
- ドキュメント: [完全なドキュメント](./docs/README.md)
- コミュニティフォーラム: [Obsidianフォーラムスレッド](https://forum.obsidian.md)

## CLIクイックリファレンス

```bash
# メールを解析
email-parser parse -i email.eml -f markdown

# サマリーを生成
daily-summary generate -d 2025-09-05 -v /vault

# ナレッジを検索
knowledge-base search -q "エラーメッセージ" -l 10

# ナレッジを抽出
knowledge-base extract -e email-123 -t "Xを修正する方法"
```