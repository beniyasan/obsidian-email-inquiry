# タスク: Obsidianメール問い合わせ管理システム

**入力**: `/specs/002-obsidian-email-inquiry/`の設計ドキュメント
**前提条件**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## 実行フロー (main)
```
1. 機能ディレクトリからplan.mdを読み込み ✓
   → 技術スタック: TypeScript 5.x, Node.js 18+, Obsidian API
   → ライブラリ: email-parser, daily-summary, knowledge-base
   → 構造: 単一プロジェクト（Obsidianプラグイン）
2. 設計ドキュメントを読み込み ✓:
   → data-model.md: EmailInquiry, DailySummary, KnowledgeEntry, ResolutionNote, Tag
   → contracts/: plugin-api.yaml, cli-commands.md
   → research.md: メール解析決定、ストレージパターン
3. カテゴリ別にタスクを生成 ✓
4. タスクルールを適用: 並列は[P]、TDD順序 ✓
5. 順次番号付け（T001-T028）✓
6. 依存関係グラフ作成 ✓
7. 並列実行例作成 ✓
8. 検証合格 ✓
```

## フォーマット: `[ID] [P?] 説明`
- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- パスはplan.mdの単一プロジェクト構造を前提

## フェーズ 3.1: セットアップ

- [ ] T001 src/にmodels/, services/, cli/, lib/フォルダを含むObsidianプラグインプロジェクト構造を作成
- [ ] T002 package.jsonでObsidian API、Jest、必要な依存関係を含むTypeScriptプロジェクトを初期化
- [ ] T003 [P] tsconfig.jsonでESLint、Prettier、TypeScriptコンパイラオプションを設定

## フェーズ 3.2: テストファースト (TDD) ⚠️ 3.3より前に必ず完了
**重要: これらのテストは実装前に書かれ、必ず失敗する必要があります**

### 契約テスト
- [ ] T004 [P] tests/contract/email-capture.test.tsでメール取り込みコマンドの契約テスト
- [ ] T005 [P] tests/contract/daily-summary.test.tsで日次サマリー生成の契約テスト
- [ ] T006 [P] tests/contract/knowledge-search.test.tsでナレッジ検索の契約テスト
- [ ] T007 [P] tests/contract/bulk-import.test.tsで一括インポートの契約テスト
- [ ] T008 [P] tests/contract/email-resolution.test.tsでメール解決の契約テスト

### CLI契約テスト
- [ ] T009 [P] tests/contract/cli-email-parser.test.tsでemail-parser parseコマンドのCLI契約テスト
- [ ] T010 [P] tests/contract/cli-daily-summary.test.tsでdaily-summary generateのCLI契約テスト
- [ ] T011 [P] tests/contract/cli-knowledge-base.test.tsでknowledge-base searchのCLI契約テスト

### 統合テスト
- [ ] T012 [P] tests/integration/email-capture-flow.test.tsでメール取り込みワークフローの統合テスト
- [ ] T013 [P] tests/integration/daily-summary-flow.test.tsで日次サマリー生成の統合テスト
- [ ] T014 [P] tests/integration/knowledge-extraction-flow.test.tsでナレッジ抽出の統合テスト
- [ ] T015 [P] tests/integration/bulk-import-flow.test.tsで一括インポートワークフローの統合テスト

## フェーズ 3.3: コア実装 (テストが失敗した後のみ)

### データモデル
- [ ] T016 [P] src/models/EmailInquiry.tsでバリデーション付きEmailInquiryモデル
- [ ] T017 [P] src/models/DailySummary.tsでDailySummaryモデル
- [ ] T018 [P] src/models/KnowledgeEntry.tsでKnowledgeEntryモデル
- [ ] T019 [P] src/models/ResolutionNote.tsでResolutionNoteモデル
- [ ] T020 [P] src/models/Tag.tsでTagモデル

### ライブラリコアサービス
- [ ] T021 [P] src/lib/email-parser/index.tsでEmailParserライブラリ
- [ ] T022 [P] src/lib/daily-summary/index.tsでDailySummaryライブラリ
- [ ] T023 [P] src/lib/knowledge-base/index.tsでKnowledgeBaseライブラリ

### プラグインサービス
- [ ] T024 src/services/EmailParser.tsでEmailParserサービス
- [ ] T025 src/services/SummaryGenerator.tsでSummaryGeneratorサービス
- [ ] T026 src/services/KnowledgeIndexer.tsでKnowledgeIndexerサービス

### CLIコマンド
- [ ] T027 [P] src/cli/email-parser-cli.tsでメール解析CLI
- [ ] T028 [P] src/cli/summary-cli.tsで日次サマリーCLI
- [ ] T029 [P] src/cli/knowledge-cli.tsでナレッジベースCLI

## フェーズ 3.4: プラグイン統合

- [ ] T030 src/main.tsでObsidianプラグインメインクラス
- [ ] T031 メール取り込み用コマンドパレット統合
- [ ] T032 日次サマリー用コマンドパレット統合
- [ ] T033 ナレッジ検索用コマンドパレット統合
- [ ] T034 設定タブの実装
- [ ] T035 Obsidian Vault APIとのファイルシステム統合
- [ ] T036 Obsidian MetadataCacheとの検索統合
- [ ] T037 エラーハンドリングとユーザー通知

## フェーズ 3.5: 高度な機能

- [ ] T038 進捗追跡付き一括インポート機能
- [ ] T039 メールスレッド検出とグループ化
- [ ] T040 添付ファイル処理と抽出
- [ ] T041 ナレッジ抽出の自動化
- [ ] T042 TTL付き日次サマリーキャッシュ
- [ ] T043 検索インデックス化とパフォーマンス最適化

## フェーズ 3.6: 仕上げ

- [ ] T044 [P] tests/unit/email-parser.test.tsでメール解析ロジックの単体テスト
- [ ] T045 [P] tests/unit/summary-generator.test.tsでサマリー生成の単体テスト
- [ ] T046 [P] tests/unit/knowledge-indexer.test.tsでナレッジインデックス化の単体テスト
- [ ] T047 一括操作のパフォーマンステスト（<100メール/分）
- [ ] T048 [P] README.mdでプラグインドキュメンテーション更新
- [ ] T049 [P] quickstart.mdに基づくユーザーガイド作成
- [ ] T050 コードクリーンアップと最適化
- [ ] T051 実際のObsidianボルトでの手動テスト

## 依存関係

### クリティカルパス
1. **セットアップ (T001-T003)** → **テスト (T004-T015)** → **モデル (T016-T020)** → **ライブラリ (T021-T023)** → **サービス (T024-T026)**
2. **サービス** → **プラグイン統合 (T030-T037)** → **高度な機能 (T038-T043)** → **仕上げ (T044-T051)**

### 具体的なブロック
- T004-T015は完了して失敗する必要があり、T016+実装前
- T016-T020（モデル）はT021-T026（サービス）をブロック
- T021-T023（ライブラリ）はT024-T026（プラグインサービス）をブロック
- T024-T026はT030（メインプラグイン）をブロック
- T030はT031-T037（プラグイン機能）をブロック

## 並列実行例

### フェーズ 3.2 - 全契約テスト（まとめて起動）
```bash
# すべての契約テストは並列実行可能 - 異なるファイル
npm test tests/contract/email-capture.test.ts &
npm test tests/contract/daily-summary.test.ts &
npm test tests/contract/knowledge-search.test.ts &
npm test tests/contract/bulk-import.test.ts &
npm test tests/contract/email-resolution.test.ts &
wait
```

### フェーズ 3.3 - モデル作成（まとめて起動）
```bash
# すべてのモデルは並列実装可能 - 異なるファイル
touch src/models/EmailInquiry.ts &
touch src/models/DailySummary.ts &
touch src/models/KnowledgeEntry.ts &
touch src/models/ResolutionNote.ts &
touch src/models/Tag.ts &
wait
```

### フェーズ 3.6 - 単体テスト（まとめて起動）
```bash
# すべての単体テストは並列実行可能 - 異なるファイル
npm test tests/unit/email-parser.test.ts &
npm test tests/unit/summary-generator.test.ts &
npm test tests/unit/knowledge-indexer.test.ts &
wait
```

## 検証チェックリスト
*ゲート: タスク完了前にすべての項目が✓である必要があります*

- [✓] すべての契約に対応するテストがある（T004-T011）
- [✓] すべてのエンティティにモデルタスクがある（T016-T020）
- [✓] すべてのテストが実装前にある（T016+前にT004-T015）
- [✓] 並列タスクが真に独立している（[P]タスクは異なるファイルを使用）
- [✓] 各タスクで正確なファイルパスを指定
- [✓] [P]タスクが他の[P]タスクと同じファイルを変更しない
- [✓] TDD順序を厳格に強制（RED-GREEN-Refactor）
- [✓] 仕様からのすべての機能要件をカバー
- [✓] プラグインアーキテクチャがObsidianベストプラクティスに従う

## 適用されたタスク生成ルール

1. **契約から** ✓:
   - plugin-api.yaml → 5つの契約テスト（T004-T008）
   - cli-commands.md → 3つのCLIテスト（T009-T011）
   
2. **データモデルから** ✓:
   - 5つのエンティティ → 5つのモデルタスク（T016-T020）
   - サービス → 6つのサービスタスク（T021-T026）
   
3. **ユーザーストーリーから** ✓:
   - 4つの主要ワークフロー → 4つの統合テスト（T012-T015）
   - クイックスタートシナリオ → 検証タスク（T047-T051）

4. **適用された順序** ✓:
   - セットアップ → テスト → モデル → サービス → 統合 → 仕上げ
   - 依存関係を厳格に強制

## 注記
- **[P]タスク**: 異なるファイル、依存関係なし - 並列実行に安全
- **テストファースト必須**: T004-T015はT016+実装前に失敗する必要
- **各タスク後にコミット**: GitヒストリーがTDDの進行を示す
- **憲法遵守**: ライブラリファーストアーキテクチャ、各ライブラリのCLI
- **パフォーマンス目標**: 100メール/分の解析、<500ms検索応答
- **プラグイン制約**: <50MBメモリ、Obsidian 1.4+互換性

---
*plan.mdフェーズ2戦略から生成。実装実行の準備完了。*