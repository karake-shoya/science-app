require 'open-uri'
require 'rss'

class HomeController < ApplicationController
  allow_unauthenticated_access only: [ :index ]
  def index
  end

  def dashboard
    url = 'https://qiita.com/popular-items/feed'
    rss = URI.open(url).read
    feed = RSS::Parser.parse(rss, false)
    @qiita_trends = feed.items.first(15)
  end
end
