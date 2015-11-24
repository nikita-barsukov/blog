---
layout: post
title: Generating running route maps.
description: Public running routes tracked with Endomondo are mapped in some European cities.
summary: A post for people who can write code about how I generated images for my post about public runs from Endomondo.com  
category: "programming"
js: endo_howto.js
tags: ["endomondo", "running","R","ruby","postgres","stamen","ggplot","visualisation"]
noToc: true
---

I started gathering raw data from the public workouts. Thankfully, all the endomondo workouts are public by default. Moreover, the route is present directly in source of page as a JSON object. This turned out to be extremely helpful later when the raw log file was more than a dozen GB in size. 

<a href="#" class="expander" data-expander-target="#endo_parser">Toggle Ruby code that extracts Endomondo workout data</a>

<pre id='endo_parser' class="content">
<code class='ruby'>
require 'net/https'
require 'nokogiri'

def parse_wout(w)
    uri = URI.parse "https://www.endomondo.com/workouts/#{w}"
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    req = Net::HTTP::Get.new uri.path
    r = http.request(req)

    str = ""
 
    if r.code == '200'
    raw_body = r.body
    doc = Nokogiri::XML(raw_body)
    j = " "
    name = doc.css('.profile-badge h1').text
    str << "'#{w}'"
    str << "\t"
    str << "'#{doc.css('.sport-name').text}'"
    str << "\t"
    str << "'#{doc.css('.date-time').text}'"
    str << "\t"
    str << "'#{name}'"
    str << "\t"
        doc.css("script").each do |s|
            if s.text.include? '"data":'
            begin
                j = s.text.gsub("\n", "") 
                j = j.scan(/"data":(.*?\])/)[0][0]
            rescue
                next
            end
            end
        end
        str << "'#{j}'"
        str << "\t"
        nodes = %w(distance duration avg-speed max-speed calories)
        nodes.each do |node|
            t = doc.css(".side-tabs li.#{node} .value").text
            str << "'#{t}'"
            str << "\t"
        end
    end

    str.chomp("\t")
end
</code>
</pre>

Then I wrote a loop over numbers from 1 to several millions, extracted necessary data with the method above and wrote it to a text file. At the end I got a file with size around 20GB. Next step is processing this dataset.

When the file was small, processing it with R took reasonable amount of time:

<a href="#" class="expander" data-expander-target="#r_dataset">Toggle R code that transforms log file of Endomondo runs to suitable dataset</a>

<pre id="r_dataset" class='content'>
<code class='r'>
options(scipen=999)
library("RJSONIO")
x <- read.csv("path/to/log/file", header=F, sep="\t", quote="'")
colnames(x) <- c("id", "type", "date","name", "route", "distance", "duration", "avg.speed", "max.speed", "calories")
x <- x[!duplicated(x$id),]
x <- x[x$route != " ",]
x <- x[!is.na(x$route),]
x <- droplevels.data.frame(x)
for (i in 1:nrow(x)) {
  z <- as.character(x[i,5])  
  z <- fromJSON(z)
  z <- lapply(z, unlist)
  ref.names <- c("values.distance","values.duration","values.speed","values.alt","lng","lat")
  z <- lapply(z, function(d){
    k <- rep(0, length(ref.names))
    names(k) <- ref.names
    for (i in ref.names){
      if(!is.na(d[i])) {k[i] = d[i]}
    }
    if(!is.na(d["values.pace"])) {k["values.speed"] <- d["values.pace"]}
    k
  })
  z <- data.frame(matrix(unlist(z), nrow=length(z), byrow=T))
      
  z[,7] <- x[i,1]
  z[,8] <- x[i,2]
  if(exists("f")){
    f <- rbind(f, z)
  } else {
    f <- z
  }
}
     
colnames(f) <- c("distance", "duration", "speed", "alt", "lon", "lat", "endo_id", "type")
f <- f[f$speed != 0,]    
</code>
</pre>

However this script did not work for larger files. Of course, it is possible to speed things up using R packages for big data, such as `parallel`, `foreach`, `data.table` etc. However I decided to take different approach. I created postgreSQL database on my workstation and loaded raw log file there. Before that I cleaned it: removed lines with unecessary workout types, leaving only running workouts, removed any missing values, or any incomplete strings. All of it using simple `grep` bash command. Why Postgres? Mainly because it supports JSON data type.

Tricky thing there was to extract longitude, lattitude and workout ID.

<a href="#" class="expander" data-expander-target="#sql_json">Toggle PostgreSQL code that transforms JSON column</a>

<pre class="content" id="sql_json">
<code class='sql'>
SELECT (route ->> 'lng')::float AS lng,
       (route ->> 'lat')::float AS lat,
       id AS endo_id,
       TYPE
FROM
  ( SELECT json_array_elements(route) route,
       id,
       TYPE
   FROM workouts LIMIT 5) w;
</code>
</pre>

I used this statement to insert rows into separate table in the same database. Then I queried necessary datapoints and plotted it with R script.

<a href="#" class="expander" data-expander-target="#r_map">Toggle R code that generates map of runs in Copenhagen</a>

<pre id="r_map" class='content'>
<code class="r">
library('ggplot2')
library('ggmap')
library('plyr')
library('RPostgreSQL')
library('png')

city <- "copenhagen"
i <- c(55.67611,12.56833) # decimal coordinates of Copehagen

boundaries <- list(lon=c(i[1] - 0.5,i[1] + 0.5), lat=c(i[2] - 0.5,i[2] + 0.5))
query <- paste("select * from gps_points where lon > ",boundaries$lon[1] ,
                 " AND lon < ",boundaries$lon[2], 
                 "AND lat >", boundaries$lat[1],
                 "AND lat <", boundaries$lat[2],
            # This part of query is probably not necessary if you removed unecessary workouts before.
                 "AND type IN ('Walking','Running')")  
drv <- dbDriver("PostgreSQL")
con <- dbConnect(drv, dbname="database_name",user="database_user")
rs <- dbSendQuery(con,query)
  
z <- fetch(rs, -1)
  
watercolor <- get_map(location=c(lon=i[1], lat=i[2]), 
                        source = "stamen",
                        maptype = "watercolor",
                        zoom=12)
m <- ggmap(watercolor) +
    geom_path(data = z, aes(x=lon, y=lat,group=endo_id),color=rgb(0,0,0,i[3])) +
    theme(
      axis.line = element_blank(),
      axis.text.y = element_blank(),
      axis.text.x = element_blank(),
      axis.ticks = element_blank(),
      axis.title.x = element_blank(),
      axis.title.y = element_blank(),
      panel.grid.major = element_blank(),
      panel.grid.minor = element_blank(),
      panel.border = element_blank(),
      panel.background = element_blank(),
      legend.key = element_rect(fill = "white",colour = "white"),
      legend.background = element_blank() 
    )
png(paste("plots/", city, ".png", sep=""), width = 900, height = 900)
print(m)  
dev.off()
  
dbDisconnect(con)  

</code>
</pre>

And voilà, beautiful maps of running routes in a city are [successfully generated]({% post_url 2014-07-25-endomondo %}).
