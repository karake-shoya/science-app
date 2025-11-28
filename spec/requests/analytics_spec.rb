require 'rails_helper'

RSpec.describe "Analytics", type: :request do
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
    # ClickUp APIのモック
    allow(ClickupClient).to receive(:fetch_tasks).and_return([])
    allow(ClickupClient).to receive(:fetch_tracked_time).and_return(0.0)
  end

  describe "GET /analytics" do
    context "未ログインの場合" do
      it "ログインページにリダイレクトされること" do
        get analytics_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to redirect_to(new_session_path)
      end
    end

    context "ログイン済みの場合" do
      before do
        post session_path,
          params: { email_address: "test@example.com", password: "Password123" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      end

      it "アナリティクスページが表示されること" do
        get analytics_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to have_http_status(:success)
      end

      it "昨日の日付で計算できること" do
        get analytics_path,
          params: { calculate_until: "yesterday" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to have_http_status(:success)
      end

      it "稼働時間パラメータを受け取れること" do
        get analytics_path,
          params: { total_hours_user1: "10.5", total_hours_user2: "8.0" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to have_http_status(:success)
      end
    end
  end
end
