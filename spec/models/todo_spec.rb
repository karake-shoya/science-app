require 'rails_helper'

RSpec.describe Todo, type: :model do
  let(:user) { User.create!(email_address: 'test@example.com', password: 'Password123') }

  describe 'バリデーション' do
    it '有効な属性で作成できること' do
      todo = Todo.new(content: 'テストタスク', user: user)
      expect(todo).to be_valid
    end

    it 'contentが空の場合は無効' do
      todo = Todo.new(content: '', user: user)
      expect(todo).not_to be_valid
      expect(todo.errors[:content]).to include("を入力してください")
    end

    it 'contentが500文字を超える場合は無効' do
      todo = Todo.new(content: 'a' * 501, user: user)
      expect(todo).not_to be_valid
      expect(todo.errors[:content]).to be_present
    end

    it 'userが関連付けられていない場合は無効' do
      todo = Todo.new(content: 'テストタスク', user: nil)
      expect(todo).not_to be_valid
    end
  end

  describe 'デフォルト値' do
    it 'completedのデフォルト値はfalse' do
      todo = Todo.create!(content: 'テストタスク', user: user)
      expect(todo.completed).to be false
    end
  end

  describe 'スコープ' do
    before do
      @incomplete_todo = Todo.create!(content: '未完了タスク', completed: false, user: user)
      @complete_todo = Todo.create!(content: '完了タスク', completed: true, user: user)
    end

    it 'incompleteスコープで未完了のみ取得' do
      expect(Todo.incomplete).to include(@incomplete_todo)
      expect(Todo.incomplete).not_to include(@complete_todo)
    end

    it 'completeスコープで完了のみ取得' do
      expect(Todo.complete).to include(@complete_todo)
      expect(Todo.complete).not_to include(@incomplete_todo)
    end

    it 'recentスコープで新しい順に取得' do
      todos = Todo.recent
      expect(todos.first).to eq(@complete_todo)
      expect(todos.last).to eq(@incomplete_todo)
    end
  end

  describe 'アソシエーション' do
    it 'userに属すること' do
      todo = Todo.new(content: 'テストタスク', user: user)
      expect(todo.user).to eq(user)
    end
  end
end
