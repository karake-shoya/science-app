class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  include Pagy::Backend

  before_action :authenticate

  private
  def authenticate
    authenticate_or_request_with_http_basic do |username, password|
      if username == ENV["BASIC_AUTH_USER"] && password == ENV["BASIC_AUTH_PASSWORD"]
        true
      else
        render plain: "Unauthorized", status: :unauthorized
      end
    end
  end
end
