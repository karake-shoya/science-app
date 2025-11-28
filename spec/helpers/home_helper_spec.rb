require 'rails_helper'

RSpec.describe HomeHelper, type: :helper do
  describe '#elapsed_time_from_date' do
    before do
      # 固定の日付でテスト（2024年6月15日）
      travel_to Time.zone.parse("2024-06-15 12:00:00")
    end

    after do
      travel_back
    end

    context 'デフォルトの基準日（2024-04-01）の場合' do
      it '経過日数が正しく計算されること' do
        result = helper.elapsed_time_from_date(nil)
        expect(result[:start_date]).to eq(Date.parse("2024-04-01"))
        expect(result[:days_passed]).to eq(76) # 4/1〜6/15 = 76日
        expect(result[:months_passed]).to eq(2)
        expect(result[:day_of_month]).to eq(15)
      end
    end

    context 'カスタム基準日の場合' do
      it '指定した日付から経過日数が計算されること' do
        result = helper.elapsed_time_from_date("2024-06-01")
        expect(result[:start_date]).to eq(Date.parse("2024-06-01"))
        expect(result[:days_passed]).to eq(15) # 6/1〜6/15 = 15日
        expect(result[:months_passed]).to eq(0)
        expect(result[:day_of_month]).to eq(15)
      end
    end

    context '不正な日付の場合' do
      it 'デフォルト日付にフォールバックすること' do
        result = helper.elapsed_time_from_date("invalid-date")
        expect(result[:start_date]).to eq(Date.parse("2024-04-01"))
      end
    end

    context '空文字の場合' do
      it 'デフォルト日付が使用されること' do
        result = helper.elapsed_time_from_date("")
        expect(result[:start_date]).to eq(Date.parse("2024-04-01"))
      end
    end
  end

  describe 'DEFAULT_START_DATE' do
    it '2024-04-01であること' do
      expect(HomeHelper::DEFAULT_START_DATE).to eq("2024-04-01")
    end
  end
end
