# 後方互換性のためのラッパークラス
# 実際のAPI処理はClickupClientに委譲
class Clickup < ApplicationRecord
  class << self
    delegate :fetch_tasks, :fetch_tracked_time, to: ClickupClient
  end
end
