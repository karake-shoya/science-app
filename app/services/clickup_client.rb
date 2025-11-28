require "uri"
require "net/http"
require "json"

class ClickupClient
  class << self
    def fetch_tasks
      url = URI("#{base_url}/list/#{list_id}/task")
      response = perform_request(url)
      response ? response["tasks"] : []
    end

    def fetch_tracked_time
      today = Time.zone.today
      start_date = today.beginning_of_month.beginning_of_day.to_i * 1000
      end_date = today.end_of_month.end_of_day.to_i * 1000

      url = URI("#{base_url}/team/#{team_id}/time_entries?assignee=#{assignee_id}&list_id=#{list_id}&start_date=#{start_date}&end_date=#{end_date}")
      response = perform_request(url)

      return 0.0 unless response

      calculate_total_hours(response["data"])
    end

    private

    def base_url
      ENV.fetch("CLICKUP_API_BASE_URL", nil)
    end

    def list_id
      ENV.fetch("CLICKUP_LIST_ID", nil)
    end

    def api_key
      ENV.fetch("CLICKUP_API_KEY", nil)
    end

    def team_id
      ENV.fetch("CLICKUP_TEAM_ID", nil)
    end

    def assignee_id
      ENV.fetch("CLICKUP_ASSIGNEE_ID", nil)
    end

    def include_task_id
      ENV.fetch("CLICKUP_INCLUDE_TASK_ID", nil)
    end

    def perform_request(url)
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE if Rails.env.development?

      request = Net::HTTP::Get.new(url)
      request["accept"] = "application/json"
      request["Authorization"] = api_key

      response = http.request(request)
      return JSON.parse(response.body) if response.code == "200"

      Rails.logger.error("ClickUp API Error: #{response.code} - #{response.body}")
      nil
    rescue StandardError => e
      Rails.logger.error("Failed to perform request to ClickUp: #{e.message}")
      nil
    end

    def calculate_total_hours(time_entries)
      filtered_entries = time_entries.reject do |entry|
        entry.dig("task", "status", "status") == "未着手" &&
        entry.dig("task", "id") != include_task_id
      end

      total_duration_ms = filtered_entries.sum { |entry| entry["duration"].to_i }
      (total_duration_ms / (1000 * 60 * 60.0)).round(2)
    end
  end
end
