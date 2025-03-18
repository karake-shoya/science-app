class AnalyticsController < ApplicationController
  def index
    @users = User.all
    @pagy, @users = pagy(User.all, items: 100)
  end
end
