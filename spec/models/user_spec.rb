require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーション' do
    context 'email_address' do
      it '存在しない場合は無効' do
        user = User.new(email_address: nil, password: 'password123')
        expect(user).not_to be_valid
        expect(user.errors[:email_address]).to include("can't be blank")
      end

      it '重複している場合は無効' do
        User.create!(email_address: 'test@example.com', password: 'password123')
        user = User.new(email_address: 'test@example.com', password: 'password123')
        expect(user).not_to be_valid
        expect(user.errors[:email_address]).to include('has already been taken')
      end

      it '不正なフォーマットの場合は無効' do
        user = User.new(email_address: 'invalid-email', password: 'password123')
        expect(user).not_to be_valid
        expect(user.errors[:email_address]).to include('is invalid')
      end

      it '正しいフォーマットの場合は有効' do
        user = User.new(email_address: 'valid@example.com', password: 'password123')
        expect(user).to be_valid
      end

      it '大文字小文字とスペースが正規化される' do
        user = User.create!(email_address: '  TEST@EXAMPLE.COM  ', password: 'password123')
        expect(user.email_address).to eq('test@example.com')
      end
    end

    context 'password' do
      it '8文字未満の場合は無効' do
        user = User.new(email_address: 'test@example.com', password: 'short')
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include('is too short (minimum is 8 characters)')
      end

      it '8文字以上の場合は有効' do
        user = User.new(email_address: 'test@example.com', password: 'password123')
        expect(user).to be_valid
      end
    end
  end

  describe 'アソシエーション' do
    it 'sessionsを複数持てる' do
      user = User.create!(email_address: 'test@example.com', password: 'password123')
      user.sessions.create!(user_agent: 'test', ip_address: '127.0.0.1')
      user.sessions.create!(user_agent: 'test2', ip_address: '127.0.0.2')
      expect(user.sessions.count).to eq(2)
    end

    it 'ユーザー削除時にsessionsも削除される' do
      user = User.create!(email_address: 'test@example.com', password: 'password123')
      user.sessions.create!(user_agent: 'test', ip_address: '127.0.0.1')
      expect { user.destroy }.to change(Session, :count).by(-1)
    end
  end
end
