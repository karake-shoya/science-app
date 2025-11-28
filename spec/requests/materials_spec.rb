require 'rails_helper'

RSpec.describe "Materials", type: :request do
  let(:basic_auth_credentials) do
    ActionController::HttpAuthentication::Basic.encode_credentials(
      ENV["BASIC_AUTH_USER"] || "test_user",
      ENV["BASIC_AUTH_PASSWORD"] || "test_password"
    )
  end
  let!(:user) { User.create!(email_address: "test@example.com", password: "Password123") }

  before do
    stub_const("ENV", ENV.to_hash.merge(
      "BASIC_AUTH_USER" => "test_user",
      "BASIC_AUTH_PASSWORD" => "test_password"
    ))
  end

  describe "GET /materials" do
    context "未ログインの場合" do
      it "ログインページにリダイレクトされること" do
        get materials_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to redirect_to(new_session_path)
      end
    end

    context "ログイン済みの場合" do
      before do
        post session_path,
          params: { email_address: "test@example.com", password: "Password123" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      end

      it "学習教材ページが表示されること" do
        get materials_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to have_http_status(:success)
      end
    end
  end
end
