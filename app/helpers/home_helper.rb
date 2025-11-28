module HomeHelper
  DEFAULT_START_DATE = "2024-04-01".freeze

  def elapsed_time_from_date(start_date_param)
    start_date = parse_start_date(start_date_param)
    today = Time.current.in_time_zone("Asia/Tokyo").to_date

    days_passed = (today - start_date).to_i + 1
    months_passed, day_of_month = calculate_months_and_days(start_date, today)

    {
      start_date: start_date,
      days_passed: days_passed,
      months_passed: months_passed,
      day_of_month: day_of_month
    }
  end

  private

  def parse_start_date(start_date_param)
    Date.parse(start_date_param.presence || DEFAULT_START_DATE)
  rescue ArgumentError
    Date.parse(DEFAULT_START_DATE)
  end

  def calculate_months_and_days(start_date, today)
    months_passed = (today.year - start_date.year) * 12 + (today.month - start_date.month)
    day_of_month = today.day - start_date.day + 1

    if day_of_month <= 0
      months_passed -= 1
      prev_month = today.prev_month
      day_of_month = (prev_month.end_of_month.day - start_date.day + 1) + today.day
    end

    [ months_passed, day_of_month ]
  end
end
