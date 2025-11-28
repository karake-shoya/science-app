class Todo < ApplicationRecord
  belongs_to :user

  validates :content, presence: true, length: { maximum: 500 }

  scope :incomplete, -> { where(completed: false) }
  scope :complete, -> { where(completed: true) }
  scope :recent, -> { order(created_at: :desc) }
end
