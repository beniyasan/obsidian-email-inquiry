# 🚀 GitHub リポジトリへのプッシュ手順

## 1. GitHub でリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. 以下の設定でリポジトリを作成：
   - **Repository name**: `obsidian-email-inquiry`
   - **Description**: "Email Inquiry Management Plugin for Obsidian with Japanese support"
   - **Public/Private**: お好みで選択
   - **Initialize**: 何もチェックしない（README, .gitignore, license は追加しない）
4. 「Create repository」をクリック

## 2. リモートリポジトリを追加してプッシュ

作成したリポジトリの URL をコピーして、以下のコマンドを実行：

```bash
# リモートリポジトリを追加（YOUR_USERNAME を実際のユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/obsidian-email-inquiry.git

# または SSH を使用する場合
git remote add origin git@github.com:YOUR_USERNAME/obsidian-email-inquiry.git

# main ブランチにプッシュ
git push -u origin main
```

## 3. 確認事項

### ✅ .gitignore で除外されているファイル

以下のファイルは GitHub にアップロードされません：

- `node_modules/` - npm パッケージ（package.json から復元可能）
- `README-*.md` - ローカル用ドキュメント
- `INSTALLATION-GUIDE.md`, `QUICK-INSTALL.md` - ローカル用ガイド
- `test-*.js`, `*.html` - テストファイル
- `.env` - 環境変数（もし存在すれば）

### ✅ 含まれる重要なファイル

以下のファイルは GitHub に含まれます：

- `src/` - ソースコード全体
- `package.json`, `package-lock.json` - 依存関係情報
- `tsconfig.json` - TypeScript 設定
- `esbuild.config.mjs` - ビルド設定
- `manifest.json` - Obsidian プラグイン情報
- `main.js` - ビルド済みプラグイン
- `README.md` - メインドキュメント
- `specs/` - 仕様書

## 4. GitHub Actions の設定（オプション）

自動ビルドを設定したい場合は、`.github/workflows/build.yml` を作成：

```yaml
name: Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Run tests
      run: npm test
```

## 5. リリースの作成（オプション）

プラグインを配布する場合：

1. GitHub リポジトリページで「Releases」をクリック
2. 「Create a new release」をクリック
3. タグバージョン（例: `v1.0.0`）を設定
4. リリースタイトルとノートを記入
5. 以下のファイルを添付：
   - `main.js`
   - `manifest.json`
6. 「Publish release」をクリック

## 6. 今後の更新

変更をコミットしてプッシュする場合：

```bash
# 変更をステージング
git add .

# コミット
git commit -m "Your commit message"

# プッシュ
git push
```

## 7. コラボレーション

他の開発者を招待する場合：

1. リポジトリの「Settings」→「Manage access」
2. 「Invite a collaborator」をクリック
3. ユーザー名またはメールアドレスで招待

---

**準備完了！** 🎉

リポジトリが正常にプッシュされたら、以下の URL でアクセスできます：
`https://github.com/YOUR_USERNAME/obsidian-email-inquiry`