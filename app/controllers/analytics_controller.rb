class AnalyticsController < ApplicationController
  def index
    @tasks = Clickup.fetch_tasks
    total_duration_hours = Clickup.fetch_tracked_time

    @calculator = WorkingHoursCalculator.new(params: params, default_hours: total_duration_hours)
    @pagy, @users = pagy(User.all)
  end
end
