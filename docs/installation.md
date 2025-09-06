# 📦 インストールガイド

Email Inquiry Management Plugin を Obsidian にインストールする方法を詳しく説明します。

## 🎯 前提条件

### 必要な環境
- **Obsidian**: バージョン 1.4.0 以上
- **OS**: Windows, macOS, Linux のいずれか
- **ストレージ**: 約 5MB の空き容量

### 事前準備
1. **Obsidian のアップデート**
   - Help → About で現在のバージョンを確認
   - 必要に応じて最新版にアップデート

2. **Community Plugins の有効化**
   - 設定 (⚙️) → Community plugins
   - "Turn on community plugins" をクリック

## 📥 方法1: 手動インストール（推奨）

### ステップ1: プラグインファイルをダウンロード

1. **GitHub リリースページにアクセス**
   - [https://github.com/beniyasan/obsidian-email-inquiry/releases](https://github.com/beniyasan/obsidian-email-inquiry/releases)

2. **最新リリースを選択**
   - 通常は一番上に表示される最新版

3. **必要ファイルをダウンロード**
   - `main.js` - プラグイン本体
   - `manifest.json` - プラグイン情報

### ステップ2: プラグインフォルダを作成

1. **Vault のルートフォルダに移動**
   - エクスプローラー/Finder で Obsidian Vault を開く

2. **プラグインフォルダ構造を作成**
   ```
   YourVault/
   └── .obsidian/
       └── plugins/
           └── email-inquiry-management/  ← このフォルダを作成
   ```

3. **隠しフォルダの表示設定**
   - **Windows**: エクスプローラー → 表示 → 隠しファイルを表示
   - **macOS**: Finder で `Cmd + Shift + .`
   - **Linux**: ファイルマネージャで隠しファイルを表示

### ステップ3: ファイルを配置

1. **ダウンロードしたファイルを移動**
   ```
   .obsidian/plugins/email-inquiry-management/
   ├── main.js          ← ここに配置
   └── manifest.json    ← ここに配置
   ```

2. **ファイル配置の確認**
   - フォルダ内に2つのファイルがあることを確認

### ステップ4: プラグインを有効化

1. **Obsidian を再起動**
   - 完全にアプリを終了して再度起動

2. **プラグイン設定を開く**
   - 設定 (⚙️) → Community plugins

3. **プラグインを有効化**
   - "Installed plugins" セクションで "Email Inquiry Management" を見つける
   - トグルスイッチをONにする

## 🔄 方法2: BRAT プラグイン経由

### BRAT とは
Beta Reviewer's Auto-update Tool - ベータ版プラグインを簡単にインストールできるツール

### インストール手順

1. **BRAT プラグインをインストール**
   - 設定 → Community plugins → Browse
   - "BRAT" を検索してインストール

2. **BRAT を有効化**
   - インストール後、BRAT を有効化

3. **リポジトリを追加**
   - BRAT 設定を開く
   - "Add Beta plugin" をクリック
   - `https://github.com/beniyasan/obsidian-email-inquiry.git` を入力

4. **プラグインをインストール**
   - BRAT が自動的にプラグインをダウンロード・インストール

## 🔧 方法3: 開発者向け（ソースからビルド）

### 前提条件
- Node.js 18.x 以上
- npm または yarn

### ビルド手順

```bash
# リポジトリをクローン
git clone https://github.com/beniyasan/obsidian-email-inquiry.git
cd obsidian-email-inquiry

# 依存関係をインストール
npm install

# TypeScript型チェック
npm run typecheck

# テストを実行（オプション）
npm test

# プロダクション用にビルド
npm run build

# 生成されたファイルをVaultにコピー
cp main.js manifest.json <path-to-vault>/.obsidian/plugins/email-inquiry-management/
```

## ✅ インストール確認

### 動作テスト

1. **コマンドパレットでテスト**
   - `Ctrl+P` (Windows/Linux) または `Cmd+P` (Mac)
   - "メールをキャプチャ" と入力
   - コマンドが表示されればインストール成功

2. **リボンアイコンの確認**
   - 左サイドバーに 📧 アイコンが表示される
   - クリックしてモーダルが開けばOK

3. **設定画面の確認**
   - 設定 → Email Inquiry Management
   - プラグイン設定画面が開けばOK

### サンプルメールの作成

```markdown
送信者メール: test@example.com
送信者名: テストユーザー
件名: インストールテスト
カテゴリ: その他
優先度: 中
メール内容: プラグインのインストールテストです。
```

## 🐛 トラブルシューティング

### プラグインが表示されない場合

1. **ファイル配置の確認**
   ```
   ✅ 正しい配置:
   .obsidian/plugins/email-inquiry-management/main.js
   .obsidian/plugins/email-inquiry-management/manifest.json
   
   ❌ 間違った配置:
   .obsidian/plugins/main.js
   .obsidian/plugins/email-inquiry-management/email-inquiry-management/main.js
   ```

2. **権限の確認**
   - ファイルに読み取り権限があるか確認
   - ウイルス対策ソフトでブロックされていないか確認

3. **Obsidian の再起動**
   - プラグインファイル変更後は必ず再起動

### プラグインがエラーになる場合

1. **Obsidian バージョンの確認**
   - Help → About でバージョン確認
   - 1.4.0 未満の場合はアップデート

2. **ファイルの整合性確認**
   - ダウンロードしたファイルが破損していないか
   - ファイルサイズが 0KB でないか確認

3. **コンソールログの確認**
   - `Ctrl+Shift+I` で開発者ツールを開く
   - Console タブでエラーメッセージを確認

### メール作成時のエラー

1. **必須フィールドの確認**
   - 送信者メール、件名、内容が入力されているか

2. **フォルダ権限の確認**
   - Emails フォルダに書き込み権限があるか
   - 手動で Emails フォルダを作成してみる

3. **メールアドレス形式の確認**
   - `user@example.com` 形式で入力されているか

## 🔄 アンインストール

プラグインを削除したい場合：

1. **プラグインを無効化**
   - 設定 → Community plugins → Email Inquiry Management → OFF

2. **ファイルを削除**
   ```bash
   # プラグインフォルダを削除
   rm -rf .obsidian/plugins/email-inquiry-management/
   ```

3. **Obsidian を再起動**
   - 設定から完全に削除される

## 📞 サポート

インストールでお困りの場合：

- **バグレポート**: [GitHub Issues](https://github.com/beniyasan/obsidian-email-inquiry/issues)
- **質問・相談**: [GitHub Discussions](https://github.com/beniyasan/obsidian-email-inquiry/discussions)
- **ドキュメント**: [プラグイン Wiki](https://github.com/beniyasan/obsidian-email-inquiry/wiki)

---

**インストールが完了したら、[使用方法](usage.md) をご確認ください！**