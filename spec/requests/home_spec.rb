require 'rails_helper'

RSpec.describe "Home", type: :request do
  let(:basic_auth_credentials) do
    ActionController::HttpAuthentication::Basic.encode_credentials(
      ENV["BASIC_AUTH_USER"] || "test_user",
      ENV["BASIC_AUTH_PASSWORD"] || "test_password"
    )
  end

  describe "GET /" do
    before do
      stub_const("ENV", ENV.to_hash.merge(
        "BASIC_AUTH_USER" => "test_user",
        "BASIC_AUTH_PASSWORD" => "test_password"
      ))
    end

    it "indexページが表示されること" do
      get root_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /dashboard" do
    let(:user) { User.create!(email_address: "test@example.com", password: "Password123") }

    before do
      stub_const("ENV", ENV.to_hash.merge(
        "BASIC_AUTH_USER" => "test_user",
        "BASIC_AUTH_PASSWORD" => "test_password"
      ))
    end

    context "未ログイン時" do
      it "ログインページにリダイレクトされること" do
        get dashboard_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to redirect_to(new_session_path)
      end
    end

    context "ログイン済み時" do
      let(:user_session) { user.sessions.create!(user_agent: "test", ip_address: "127.0.0.1") }

      it "ダッシュボードが表示されること" do
        # Qiita RSSのスタブ
        rss_content = <<~RSS
          <?xml version="1.0" encoding="UTF-8"?>
          <rss version="2.0">
            <channel>
              <item><title>テスト記事1</title><link>https://example.com/1</link></item>
              <item><title>テスト記事2</title><link>https://example.com/2</link></item>
            </channel>
          </rss>
        RSS
        allow(URI).to receive(:open).and_return(StringIO.new(rss_content))

        # signed cookieを設定するためにPOSTでログインする
        post session_path,
          params: { email_address: user.email_address, password: "Password123" },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }

        get dashboard_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
        expect(response).to have_http_status(:success)
      end
    end
  end
end
