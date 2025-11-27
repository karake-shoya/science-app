require "uri"
require "net/http"
require "json"

class Clickup < ApplicationRecord
  def self.base_url
    ENV["CLICKUP_API_BASE_URL"]
  end

  def self.list_id
    ENV["CLICKUP_LIST_ID"]
  end

  def self.api_key
    ENV["CLICKUP_API_KEY"]
  end

  def self.perform_request(url)
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true

    if Rails.env.development?
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    end

    request = Net::HTTP::Get.new(url)
    request["accept"] = "application/json"
    request["Authorization"] = api_key

    begin
      response = http.request(request)
      if response.code == "200"
        JSON.parse(response.body)
      else
        Rails.logger.error("ClickUp API Error: #{response.code} - #{response.body}")
        nil
      end
    rescue StandardError => e
      Rails.logger.error("Failed to perform request to ClickUp: #{e.message}")
      nil
    end
  end

  def self.fetch_tasks
    url = URI("#{base_url}/list/#{list_id}/task")
    response = perform_request(url)
    response ? response["tasks"] : []
  end

  def self.fetch_tracked_time
    team_id = ENV["CLICKUP_TEAM_ID"]
    assignee_id = ENV["CLICKUP_ASSIGNEE_ID"]
    include_task_id = ENV["CLICKUP_INCLUDE_TASK_ID"]
    today = Time.zone.today
    Rails.logger.info("Fetching tracked time from ClickUp for today: #{today}")
    start_date = today.beginning_of_month.beginning_of_day.to_i * 1000
    end_date = today.end_of_month.end_of_day.to_i * 1000
    Rails.logger.info("Fetching tracked time from ClickUp for the period: #{start_date} to #{end_date}")

    url = URI("#{base_url}/team/#{team_id}/time_entries?assignee=#{assignee_id}&list_id=#{list_id}&start_date=#{start_date}&end_date=#{end_date}")
    response = perform_request(url)

    if response
      time_entries = response["data"]
      filtered_entries = time_entries.reject do |entry|
        entry.dig("task", "status", "status") == "未着手" &&
        entry.dig("task", "id") != include_task_id
      end

      total_duration_ms = filtered_entries.sum { |entry| entry["duration"].to_i }
      (total_duration_ms / (1000 * 60 * 60.0)).round(2)
    else
      0.0
    end
  end
end
