require "holidays"

class AnalyticsController < ApplicationController
  def index
    @users = User.all
    @tasks = Clickup.fetch_tasks
    @total_duration_hours = Clickup.fetch_tracked_time

    @pagy, @users = pagy(@users)

    @today = Time.zone.today

    calculate_until = params[:calculate_until] || "today"
    target_date = calculate_until == "yesterday" ? @today.yesterday : @today
    @today_formatted = target_date.strftime("%-m月%d日 (%a)")

    @hours_u1 = params[:total_hours_user1].present? ? params[:total_hours_user1].to_f : @total_duration_hours
    @hours_u2 = params[:total_hours_user2].to_f || 0.0

    start_date = target_date.beginning_of_month
    end_date = target_date.end_of_month

    Rails.logger.info("Date range: #{start_date} to #{end_date}")

  @business_days = (start_date..target_date).count { |date| business_day?(date) }
  subtract_days = params[:subtract_days].to_i
  @business_days_adjusted = [ @business_days - subtract_days, 0 ].max
  @remaining_days = (target_date.next_day..end_date).count { |date| business_day?(date) }

  @per_day_u1 = @business_days_adjusted > 0 ? (@hours_u1 / @business_days_adjusted) : 0
  @predicted_u1 = @per_day_u1 * @remaining_days
  @final_u1 = @hours_u1 + @predicted_u1

  @per_day_u2 = @business_days_adjusted > 0 ? (@hours_u2 / @business_days_adjusted) : 0
  @predicted_u2 = @per_day_u2 * @remaining_days
  @final_u2 = @hours_u2 + @predicted_u2

  @total_final = @final_u1 + @final_u2
  end

  private
  def business_day?(date)
    !date.saturday? && !date.sunday? && Holidays.on(date, :jp).empty?
  end
end
