require 'rails_helper'

RSpec.describe "Todos", type: :request do
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
    # ログイン
    post session_path,
      params: { email_address: "test@example.com", password: "Password123" },
      headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
  end

  describe "GET /todos" do
    before do
      user.todos.create!(content: "未完了タスク", completed: false)
      user.todos.create!(content: "完了タスク", completed: true)
    end

    it "TODOリストをJSON形式で取得できること" do
      get todos_path, headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      expect(response).to have_http_status(:success)

      json = JSON.parse(response.body)
      expect(json["incomplete"].length).to eq(1)
      expect(json["complete"].length).to eq(1)
    end
  end

  describe "POST /todos" do
    it "TODOを作成できること" do
      expect {
        post todos_path,
          params: { todo: { content: "新しいタスク" } },
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials },
          as: :json
      }.to change(Todo, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "空のcontentでは作成できないこと" do
      post todos_path,
        params: { todo: { content: "" } },
        headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials },
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /todos/:id" do
    let!(:todo) { user.todos.create!(content: "テストタスク", completed: false) }

    it "TODOを完了にできること" do
      patch todo_path(todo),
        params: { todo: { completed: true } },
        headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials },
        as: :json

      expect(response).to have_http_status(:success)
      expect(todo.reload.completed).to be true
    end

    it "contentを更新できること" do
      patch todo_path(todo),
        params: { todo: { content: "更新されたタスク" } },
        headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials },
        as: :json

      expect(response).to have_http_status(:success)
      expect(todo.reload.content).to eq("更新されたタスク")
    end
  end

  describe "DELETE /todos/:id" do
    let!(:todo) { user.todos.create!(content: "削除するタスク") }

    it "TODOを削除できること" do
      expect {
        delete todo_path(todo),
          headers: { "HTTP_AUTHORIZATION" => basic_auth_credentials }
      }.to change(Todo, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
