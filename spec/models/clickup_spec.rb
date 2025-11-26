require 'rails_helper'

RSpec.describe Clickup, type: :model do
  describe '.base_url' do
    it '環境変数から取得できること' do
      stub_const('ENV', ENV.to_hash.merge('CLICKUP_API_BASE_URL' => 'https://example.com'))
      expect(Clickup.base_url).to eq('https://example.com')
    end
  end

  describe '.perform_request' do
    let(:url) { URI('https://example.com/api') }
    let(:response_double) { instance_double(Net::HTTPResponse, code: '200', body: '{"result": "ok"}') }

    before do
      http_double = double('http', request: response_double)
      allow(http_double).to receive(:use_ssl=)
      allow(Net::HTTP).to receive(:new).and_return(http_double)
      allow(Clickup).to receive(:api_key).and_return('dummy-key')
    end

    it '正常なレスポンスならJSONを返す' do
      expect(Clickup.perform_request(url)).to eq({ 'result' => 'ok' })
    end

    it '異常なレスポンスならnilを返す' do
      allow(response_double).to receive(:code).and_return('500')
      allow(response_double).to receive(:body).and_return('error')
      expect(Clickup.perform_request(url)).to be_nil
    end
  end

  # バリデーションのテスト例
  it 'is valid with valid attributes' do
    expect(Clickup.new).to be_valid
  end

  # 必要に応じて属性やメソッドのテストを追加
end
