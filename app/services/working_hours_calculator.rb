require "holidays"

class WorkingHoursCalculator
  attr_reader :target_date, :hours_u1, :hours_u2, :subtract_days

  def initialize(params:, default_hours:)
    calculate_until = params[:calculate_until] || "today"
    today = Time.zone.today
    @target_date = calculate_until == "yesterday" ? today.yesterday : today
    @hours_u1 = params[:total_hours_user1].present? ? params[:total_hours_user1].to_f : default_hours
    @hours_u2 = params[:total_hours_user2].to_f || 0.0
    @subtract_days = params[:subtract_days].to_i
  end

  def today_formatted
    target_date.strftime("%-m月%d日 (%a)")
  end

  def business_days
    @business_days ||= (start_date..target_date).count { |date| business_day?(date) }
  end

  def business_days_adjusted
    @business_days_adjusted ||= [ business_days - subtract_days, 0 ].max
  end

  def remaining_days
    @remaining_days ||= (target_date.next_day..end_date).count { |date| business_day?(date) }
  end

  def per_day_u1
    @per_day_u1 ||= business_days_adjusted > 0 ? (hours_u1 / business_days_adjusted) : 0
  end

  def per_day_u2
    @per_day_u2 ||= business_days_adjusted > 0 ? (hours_u2 / business_days_adjusted) : 0
  end

  def predicted_u1
    @predicted_u1 ||= per_day_u1 * remaining_days
  end

  def predicted_u2
    @predicted_u2 ||= per_day_u2 * remaining_days
  end

  def final_u1
    @final_u1 ||= hours_u1 + predicted_u1
  end

  def final_u2
    @final_u2 ||= hours_u2 + predicted_u2
  end

  def total_final
    final_u1 + final_u2
  end

  def current_total
    hours_u1 + hours_u2
  end

  private

  def start_date
    target_date.beginning_of_month
  end

  def end_date
    target_date.end_of_month
  end

  def business_day?(date)
    !date.saturday? && !date.sunday? && Holidays.on(date, :jp).empty?
  end
end
