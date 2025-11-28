require 'rails_helper'

RSpec.describe "Users", type: :request do
  let(:basic_auth_credentials) do
    ActionController::HttpAuthentication::Basic.encode_credentials(
      ENV["BASIC_AUTH_USER"] || "test_user",
      ENV["BASIC_AUTH_PASSWORD"] || "test_password"
    )
  end

  before do
    stub_const("ENV", ENV.to_hash.merge(
      "BASIC_AUTH_USER" => "test_user",
      "BASIC_AUTH_PASSWORD" => "test_password"
    ))
  end

  describe "GET /users/new" do
    it "新規登録ページが表示されること" do
      get new_user_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST /users" do
    context "正しいパラメータの場合" do
      let(:valid_params) do
        {
          user: {
            name: "Test User",
            email_address: "newuser@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }
      end

      it "ユーザーが作成されること" do
        expect {
          post users_path,
            params: valid_params,
            headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        }.to change(User, :count).by(1)
      end

      it "ダッシュボードにリダイレクトされること" do
        post users_path,
          params: valid_params,
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }

        expect(response).to redirect_to(dashboard_path)
      end
    end

    context "不正なパラメータの場合" do
      let(:invalid_params) do
        {
          user: {
            name: "Test User",
            email_address: "invalid-email",
            password: "short",
            password_confirmation: "short"
          }
        }
      end

      it "ユーザーが作成されないこと" do
        expect {
          post users_path,
            params: invalid_params,
            headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        }.not_to change(User, :count)
      end

      it "422ステータスが返されること" do
        post users_path,
          params: invalid_params,
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /users/:id" do
    let!(:user) { User.create!(email_address: "test@example.com", password: "password123") }

    context "ログイン済みの場合" do
      before do
        post session_path,
          params: { email_address: "test@example.com", password: "password123" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      end

      it "ユーザー詳細ページが表示されること" do
        get user_path(user), headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to have_http_status(:success)
      end
    end

    context "未ログインの場合" do
      it "ログインページにリダイレクトされること" do
        get user_path(user), headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to redirect_to(new_session_path)
      end
    end
  end
end
