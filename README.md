# Science App 📊

時間管理とプロジェクト管理を支援するWebアプリケーション

## 概要

Science Appは、開発者や研究者の作業効率化を目的としたRailsアプリケーションです。リアルタイムダッシュボード、学習教材の閲覧機能を提供します。

## 主な機能

### 🏠 ダッシュボード
- **リアルタイムクロック**: 現在時刻の表示（東京時間）
- **日数計算**: 指定した基準日からの経過日数を表示
- **時間追跡**: 開始時刻・終了時刻の記録と勤務時間の計算
- **TODOリスト**: タスクの追加・完了・削除機能（ユーザーごとに管理）
- **メモ機能**: フリーテキストのメモ入力
- **Qiitaトレンド**: Qiitaの人気記事をリアルタイムで表示

### 📚 学習教材
- **チートシート**: プログラミング学習用のチートシート表示
- **Git、VSCode、CSS等の参考資料**

### 🔐 認証システム
- **セッション認証**: Cookieベースの安全なセッション管理
- **ユーザー管理**: 新規登録・ログイン・パスワードリセット

## 技術スタック

- **Backend**: Ruby on Rails 8.1.1
- **Database**: PostgreSQL
- **Asset Pipeline**: Propshaft
- **Frontend**: Tailwind CSS, Stimulus JS, Hotwire/Turbo
- **Charts**: Chartkick, Groupdate
- **Pagination**: Pagy
- **Authentication**: bcrypt
- **External Data**: RSS (Qiitaトレンド), Holidays (日本の祝日)
- **Background Jobs**: Solid Queue, Solid Cache, Solid Cable
- **Testing**: RSpec, Capybara
- **Code Quality**: RuboCop, Brakeman
- **Deployment**: Kamal, Docker

## セットアップ

### 必要なバージョン
- Ruby 3.x以上
- Rails 8.1.1
- PostgreSQL

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
# DeepL翻訳
DEEPL_API_KEY=your_deepl_api_key
# 有料版を使う場合は api.deepl.com に変更
DEEPL_API_URL=https://api-free.deepl.com/v2/translate

# データベース設定（本番環境）
DATABASE_URL=postgresql://username:password@localhost/science_app_production
```

## 使用方法

1. **ユーザー登録**: `/session/new`でアカウント作成またはログイン
2. **ダッシュボード**: `/dashboard`で時間管理・TODO管理・Qiitaトレンド確認
3. **学習教材**: `/materials`でプログラミングチートシート閲覧

## 開発

### テストの実行
```bash
# RSpecによるテスト
bundle exec rspec

# Railsテスト
rails test
```

### コード品質チェック
```bash
bundle exec rubocop
bundle exec brakeman
```

### CI
```bash
bin/ci
```

### デプロイ
```bash
# Kamalでのデプロイ
kamal deploy
```

## 設定ファイル

- **認証設定**: `app/controllers/concerns/authentication.rb`
- **稼働時間計算**: `app/services/working_hours_calculator.rb`
- **ルーティング**: `config/routes.rb`
- **タイムゾーン**: 東京時間に設定済み

## データベース構成

- **users**: ユーザー情報（メールアドレス、名前、パスワード）
- **sessions**: セッション管理（IPアドレス、ユーザーエージェント）
- **todos**: TODOリスト（内容、完了状態、ユーザー紐付け）

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
