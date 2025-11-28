class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  EMAIL_MAX_LENGTH = 255
  PASSWORD_MIN_LENGTH = 8
  PASSWORD_MAX_LENGTH = 72 # bcryptの制限

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address,
    presence: true,
    uniqueness: { case_sensitive: false },
    length: { maximum: EMAIL_MAX_LENGTH },
    format: { with: URI::MailTo::EMAIL_REGEXP, message: "は有効なメールアドレス形式で入力してください" }

  validates :password,
    length: {
      minimum: PASSWORD_MIN_LENGTH,
      maximum: PASSWORD_MAX_LENGTH,
      message: "は#{PASSWORD_MIN_LENGTH}文字以上#{PASSWORD_MAX_LENGTH}文字以下で入力してください"
    },
    format: {
      with: /\A(?=.*[a-zA-Z])(?=.*\d).+\z/,
      message: "は英字と数字の両方を含めてください"
    },
    if: -> { new_record? || password.present? }

  validates :name,
    length: { maximum: 100 },
    allow_blank: true
end
