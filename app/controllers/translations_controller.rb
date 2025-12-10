class TranslationsController < ApplicationController
  def create
    text = params[:text].to_s.strip
    if text.blank?
      return render json: { error: "テキストが空だよ。文字を入れてね。" }, status: :unprocessable_entity
    end

    target_lang = target_language_for(text)
    translated_text = DeeplTranslator.translate(text:, target_lang:)

    render json: {
      translated_text: translated_text,
      target_lang: target_lang,
      source_lang: target_lang == "JA" ? "EN" : "JA"
    }, status: :ok
  rescue DeeplTranslator::ConfigurationError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue DeeplTranslator::TranslationError => e
    Rails.logger.error("DeepL translation error: #{e.message}")
    render json: { error: "翻訳に失敗しちゃった。少し待ってもう一度試してね。" }, status: :bad_gateway
  rescue StandardError => e
    Rails.logger.error("Translation error: #{e.message}")
    render json: { error: "予期せぬエラーが起きたよ。" }, status: :internal_server_error
  end

  private

  def target_language_for(text)
    japanese_pattern = /[\p{Hiragana}\p{Katakana}\p{Han}]/
    japanese_pattern.match?(text) ? "EN" : "JA"
  end
end

