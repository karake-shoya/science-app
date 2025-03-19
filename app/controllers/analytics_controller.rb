require "holidays"

class AnalyticsController < ApplicationController
  def index
    @users = User.all
    @pagy, @users = pagy(@users)

    @today = Date.current

    calculate_until = params[:calculate_until] || "today"
    target_date = calculate_until == "yesterday" ? @today.yesterday : @today
    @today_formatted = target_date.strftime("%-m月%d日 (%a)")

    @hours_u1 = params[:total_hours_user1].to_f || 0.0
    @hours_u2 = params[:total_hours_user2].to_f || 0.0

    start_date = target_date.beginning_of_month
    end_date = target_date.end_of_month

    @business_days = (start_date..target_date).count { |date| business_day?(date) }
    @remaining_days = (target_date.next_day..end_date).count { |date| business_day?(date) }

    @per_day_u1 = @business_days > 0 ? (@hours_u1 / @business_days) : 0
    @predicted_u1 = @per_day_u1 * @remaining_days
    @final_u1 = @hours_u1 + @predicted_u1

    @per_day_u2 = @business_days > 0 ? (@hours_u2 / @business_days) : 0
    @predicted_u2 = @per_day_u2 * @remaining_days
    @final_u2 = @hours_u2 + @predicted_u2

    @total_final = @final_u1 + @final_u2
  end

  private
  def business_day?(date)
    !date.saturday? && !date.sunday? && Holidays.on(date, :jp).empty?
  end
end
