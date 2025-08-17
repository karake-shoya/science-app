# Science App 📊

時間管理とプロジェクト管理を支援するWebアプリケーション

## 概要

Science Appは、開発者や研究者の作業効率化を目的としたRailsアプリケーションです。ClickUp APIと連携した稼働時間分析、リアルタイムダッシュボード、学習教材の閲覧機能を提供します。

## 主な機能

### 🏠 ダッシュボード
- **リアルタイムクロック**: 現在時刻の表示（東京時間）
- **日数計算**: 指定した基準日からの経過日数を表示
- **時間追跡**: 開始時刻・終了時刻の記録と勤務時間の計算
- **TODOリスト**: タスクの追加・完了・削除機能

### 📈 アナリティクス
- **ClickUp連携**: タスク一覧の表示と稼働時間の自動取得
- **稼働時間分析**: 複数ユーザーの稼働時間計算と予測
- **営業日計算**: 日本の祝日を考慮した営業日数の算出
- **ユーザー動向**: 新規ユーザー登録のグラフ表示
- **ユーザー管理**: 登録ユーザー一覧とページネーション

### 📚 学習教材
- **チートシート**: プログラミング学習用のチートシート表示
- **Git、VSCode、CSS等の参考資料**

### 🔐 認証システム
- **二重認証**: Basic認証 + セッション認証
- **ユーザー管理**: 新規登録・ログイン・パスワードリセット
- **セッション管理**: 安全なセッション管理とログアウト

## 技術スタック

- **Backend**: Ruby on Rails 8.0.1
- **Database**: PostgreSQL
- **Frontend**: Tailwind CSS, Stimulus JS, Hotwire/Turbo
- **Charts**: Chartkick, Groupdate
- **Pagination**: Pagy
- **Authentication**: bcrypt
- **API Integration**: ClickUp API (REST Client)
- **Deployment**: Kamal, Docker

## セットアップ

### 必要なバージョン
- Ruby 3.x以上
- Rails 8.0.1
- PostgreSQL
- Node.js (JavaScript dependencies用)

### インストール

```bash
# リポジトリのクローン
git clone [repository-url]
cd science-app

# 依存関係のインストール
bundle install

# データベースの作成と初期化
rails db:create
rails db:migrate
rails db:seed

# Tailwind CSSのビルド
rails tailwindcss:build

# サーバーの起動
bin/dev
```

### 環境変数の設定

`.env`ファイルまたは環境変数に以下を設定してください：

```bash
# Basic認証
BASIC_AUTH_USER=your_basic_auth_user
BASIC_AUTH_PASSWORD=your_basic_auth_password

# ClickUp API設定
CLICKUP_API_BASE_URL=https://api.clickup.com/api/v2
CLICKUP_API_KEY=your_clickup_api_key
CLICKUP_TEAM_ID=your_team_id
CLICKUP_LIST_ID=your_list_id
CLICKUP_ASSIGNEE_ID=your_assignee_id
CLICKUP_INCLUDE_TASK_ID=your_include_task_id

# データベース設定
DATABASE_URL=postgresql://username:password@localhost/science_app_development
```

## 使用方法

1. **Basic認証**: アプリケーションアクセス時にBasic認証が求められます
2. **ユーザー登録**: `/session/new`でアカウント作成またはログイン
3. **ダッシュボード**: `/dashboard`で時間管理とTODO管理
4. **アナリティクス**: `/analytics`で稼働時間分析とClickUpデータ確認
5. **学習教材**: `/materials`でプログラミングチートシート閲覧

## 開発

### テストの実行
```bash
rails test
```

### コード品質チェック
```bash
bundle exec rubocop
bundle exec brakeman
```

### デプロイ
```bash
# Kamalでのデプロイ
kamal deploy
```

## 設定ファイル

- **認証設定**: `app/controllers/concerns/authentication.rb`
- **ClickUp連携**: `app/models/clickup.rb`
- **ルーティング**: `config/routes.rb`
- **タイムゾーン**: 東京時間に設定済み

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
