require "rack/jekyll"
require 'yaml'

use Rack::ContentType, "text/html"
use Rack::ContentLength

run Rack::Jekyll.new

