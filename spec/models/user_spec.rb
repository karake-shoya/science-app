require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーション' do
    context 'email_address' do
      it '存在しない場合は無効' do
        user = User.new(email_address: nil, password: 'Password123')
        expect(user).not_to be_valid
        expect(user.errors[:email_address]).to include("can't be blank")
      end

      it '重複している場合は無効' do
        User.create!(email_address: 'test@example.com', password: 'Password123')
        user = User.new(email_address: 'test@example.com', password: 'Password123')
        expect(user).not_to be_valid
        expect(user.errors[:email_address]).to include('has already been taken')
      end

      it '大文字小文字が異なっても重複している場合は無効' do
        User.create!(email_address: 'test@example.com', password: 'Password123')
        user = User.new(email_address: 'TEST@EXAMPLE.COM', password: 'Password123')
        expect(user).not_to be_valid
      end

      it '不正なフォーマットの場合は無効' do
        user = User.new(email_address: 'invalid-email', password: 'Password123')
        expect(user).not_to be_valid
        expect(user.errors[:email_address]).to include('は有効なメールアドレス形式で入力してください')
      end

      it '255文字を超える場合は無効' do
        long_email = "#{'a' * 244}@example.com" # 256文字
        user = User.new(email_address: long_email, password: 'Password123')
        expect(user).not_to be_valid
        expect(user.errors[:email_address]).to be_present
      end

      it '正しいフォーマットの場合は有効' do
        user = User.new(email_address: 'valid@example.com', password: 'Password123')
        expect(user).to be_valid
      end

      it '大文字小文字とスペースが正規化される' do
        user = User.create!(email_address: '  TEST@EXAMPLE.COM  ', password: 'Password123')
        expect(user.email_address).to eq('test@example.com')
      end
    end

    context 'password' do
      it '8文字未満の場合は無効' do
        user = User.new(email_address: 'test@example.com', password: 'Pass1')
        expect(user).not_to be_valid
        expect(user.errors[:password]).to be_present
      end

      it '72文字を超える場合は無効' do
        long_password = 'Aa1' + 'a' * 70 # 73文字
        user = User.new(email_address: 'test@example.com', password: long_password)
        expect(user).not_to be_valid
        expect(user.errors[:password]).to be_present
      end

      it '英字のみの場合は無効' do
        user = User.new(email_address: 'test@example.com', password: 'PasswordOnly')
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include('は英字と数字の両方を含めてください')
      end

      it '数字のみの場合は無効' do
        user = User.new(email_address: 'test@example.com', password: '12345678')
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include('は英字と数字の両方を含めてください')
      end

      it '英字と数字を含む8文字以上の場合は有効' do
        user = User.new(email_address: 'test@example.com', password: 'Password123')
        expect(user).to be_valid
      end
    end

    context 'name' do
      it '100文字を超える場合は無効' do
        user = User.new(email_address: 'test@example.com', password: 'Password123', name: 'a' * 101)
        expect(user).not_to be_valid
        expect(user.errors[:name]).to be_present
      end

      it '100文字以内の場合は有効' do
        user = User.new(email_address: 'test@example.com', password: 'Password123', name: 'a' * 100)
        expect(user).to be_valid
      end

      it '空でも有効' do
        user = User.new(email_address: 'test@example.com', password: 'Password123', name: '')
        expect(user).to be_valid
      end
    end
  end

  describe '定数' do
    it 'EMAIL_MAX_LENGTHが255であること' do
      expect(User::EMAIL_MAX_LENGTH).to eq(255)
    end

    it 'PASSWORD_MIN_LENGTHが8であること' do
      expect(User::PASSWORD_MIN_LENGTH).to eq(8)
    end

    it 'PASSWORD_MAX_LENGTHが72であること' do
      expect(User::PASSWORD_MAX_LENGTH).to eq(72)
    end
  end

  describe 'アソシエーション' do
    it 'sessionsを複数持てる' do
      user = User.create!(email_address: 'test@example.com', password: 'Password123')
      user.sessions.create!(user_agent: 'test', ip_address: '127.0.0.1')
      user.sessions.create!(user_agent: 'test2', ip_address: '127.0.0.2')
      expect(user.sessions.count).to eq(2)
    end

    it 'ユーザー削除時にsessionsも削除される' do
      user = User.create!(email_address: 'test@example.com', password: 'Password123')
      user.sessions.create!(user_agent: 'test', ip_address: '127.0.0.1')
      expect { user.destroy }.to change(Session, :count).by(-1)
    end
  end
end
