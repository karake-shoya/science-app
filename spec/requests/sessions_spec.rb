require 'rails_helper'

RSpec.describe "Sessions", type: :request do
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

  describe "GET /session/new" do
    it "ログインページが表示されること" do
      get new_session_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST /session" do
    let!(:user) { User.create!(email_address: "test@example.com", password: "password123") }

    context "正しい認証情報の場合" do
      it "ログインに成功してリダイレクトされること" do
        post session_path,
          params: { email_address: "test@example.com", password: "password123" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }

        expect(response).to have_http_status(:redirect)
      end
    end

    context "誤った認証情報の場合" do
      it "ログインページにリダイレクトされること" do
        post session_path,
          params: { email_address: "test@example.com", password: "wrongpassword" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }

        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe "DELETE /session" do
    let!(:user) { User.create!(email_address: "test@example.com", password: "password123") }

    it "ログアウトしてログインページにリダイレクトされること" do
      # まずログイン
      post session_path,
        params: { email_address: "test@example.com", password: "password123" },
        headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }

      # ログアウト
      delete session_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      expect(response).to redirect_to(new_session_path)
    end
  end
end
