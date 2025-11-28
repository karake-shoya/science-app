require 'rails_helper'

RSpec.describe Clickup, type: :model do
  it 'is valid with valid attributes' do
    expect(Clickup.new).to be_valid
  end

  it 'fetch_tasksがClickupClientに委譲されること' do
    expect(ClickupClient).to receive(:fetch_tasks).and_return([])
    expect(Clickup.fetch_tasks).to eq([])
  end

  it 'fetch_tracked_timeがClickupClientに委譲されること' do
    expect(ClickupClient).to receive(:fetch_tracked_time).and_return(0.0)
    expect(Clickup.fetch_tracked_time).to eq(0.0)
  end
end

RSpec.describe ClickupClient do
  describe '.fetch_tasks' do
    it 'タスク一覧を取得できること' do
      stub_const('ENV', ENV.to_hash.merge(
        'CLICKUP_API_BASE_URL' => 'https://api.clickup.com/api/v2',
        'CLICKUP_LIST_ID' => '123',
        'CLICKUP_API_KEY' => 'test-key'
      ))

      response_body = { 'tasks' => [ { 'name' => 'Task 1' } ] }.to_json
      response_double = instance_double(Net::HTTPResponse, code: '200', body: response_body)
      http_double = double('http', request: response_double)
      allow(http_double).to receive(:use_ssl=)
      allow(http_double).to receive(:verify_mode=)
      allow(Net::HTTP).to receive(:new).and_return(http_double)

      expect(ClickupClient.fetch_tasks).to eq([ { 'name' => 'Task 1' } ])
    end

    it 'APIエラー時は空配列を返すこと' do
      stub_const('ENV', ENV.to_hash.merge(
        'CLICKUP_API_BASE_URL' => 'https://api.clickup.com/api/v2',
        'CLICKUP_LIST_ID' => '123',
        'CLICKUP_API_KEY' => 'test-key'
      ))

      response_double = instance_double(Net::HTTPResponse, code: '500', body: 'error')
      http_double = double('http', request: response_double)
      allow(http_double).to receive(:use_ssl=)
      allow(http_double).to receive(:verify_mode=)
      allow(Net::HTTP).to receive(:new).and_return(http_double)

      expect(ClickupClient.fetch_tasks).to eq([])
    end
  end
end
