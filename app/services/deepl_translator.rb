require "net/http"
require "json"

class DeeplTranslator
  class TranslationError < StandardError; end
  class ConfigurationError < StandardError; end

  API_URL = ENV.fetch("DEEPL_API_URL", "https://api-free.deepl.com/v2/translate")

  class << self
    def translate(text:, target_lang:)
      api_key = ENV["DEEPL_API_KEY"]
      raise ConfigurationError, "DeepL APIキーが設定されていません" if api_key.blank?
      raise TranslationError, "翻訳対象のテキストが空です" if text.blank?

      uri = URI(API_URL)
      request = Net::HTTP::Post.new(uri)
      request["Authorization"] = "DeepL-Auth-Key #{api_key}"
      request.set_form_data(text: text, target_lang: target_lang)

      response = perform_request(uri, request)
      parse_translation(response)
    end

    private

    def perform_request(uri, request)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.read_timeout = 5
      http.open_timeout = 5

      response = http.request(request)
      return response if response.is_a?(Net::HTTPSuccess)

      raise TranslationError, "DeepL APIエラー: #{response.code} #{response.body}"
    rescue StandardError => e
      raise TranslationError, "DeepL APIへの接続に失敗しました: #{e.message}"
    end

    def parse_translation(response)
      body = JSON.parse(response.body)
      translated = body.dig("translations", 0, "text")
      raise TranslationError, "DeepLから翻訳結果を取得できませんでした" if translated.blank?

      translated
    rescue JSON::ParserError => e
      raise TranslationError, "DeepLレスポンスの解析に失敗しました: #{e.message}"
    end
  end
end

