---
layout: post
title: Crime and demographic factors in Los Angeles and Chicago.
description: Crime rate and factors influencing it in Chicago and Los Angeles.
summary: Exploring which demographic parameters influence crime rate in Chicago and Los Angeles. Based on my grading paper for a course "Introduciton to data analysis" from Udacity.
category: "visualisation"
tags: ["usa", "crime","los angeles", "map", "scatterplot"]
css: "/css/style-crime.css" 
---

Introduction
=========
I've been alsways interested in statistics and sociology of crime. Questions like 'Is there a connection between crime and poverty?', 'Does level of educaiton correlates with crime rate?' or 'Are factors correlated with property and personal crimes different or not?' have been dragging my attention for a long time.

This paper is an attempt to find which demographic factors correlate with level of crime using techniques from Udacity's course 'Exploratory data analysis with R'. I'll try to select demographic factors that might correlate with crime rate and cover the following broad topics:

 * determine which of selected factors correlate with level of crime,
 * is there different correlation factors between personal and property crimes.

Research question
-------------
My starting point was to figure out how to get as granular dataset as possible both for crime and for demographic data. As it turns out, several major cities in US provide a dataset of every reported crime, with crime description and, which is even more important, geographical locations of reported crime. I obtained these datasets for two large US cities: Los Angeles and Chicago for the year 2013.

Source of demographic data for the United States is [The United States Census Bureau](http://census.gov/). The smallest geographical unit for which the bureau publishes sample data is [census block group](https://en.wikipedia.org/wiki/Census_block_group). Additionally, bureau provides geographical shapes of these block groups. This allows us to determine census block group of every reported crime, since our initial crime dataset contains information about geographical coordinates of the crime.

Next step was to determine which demographic factors I should select for this paper. There is plenty of research around factors influencing crime. Most of the research describing factors influencing crime, cite these demographic parameters as the ones that have the most incluence to crime rate:

 * Level of urbanization
 * Median income
 * Unemployment
 * Education level
 * Concentraiton of youth
 * Family condition, especially in respect to divorse, family composition etc.

Within the current paper I decided to focus on following variables:

 * Population density,
 * Median personal income,
 * Share of unemployed,
 * Share of those with at least a high school diploma.

All this data is available for download on census block group level through census.gov.

Constructing research dataset.
-----------------
Creating clean dataset for this paper was a long and time consuming task. It contained multiple steps, involving multiple technologies, like Excel, GIS, R and SQL. I used SQL for loading and merging data, and geographical extentions for Postgres database named PostGIS for geographical calculations. I also used Excel and R for cleaning up downloaded datasets. The process is described in detail in a [separate document](https://github.com/nikita-barsukov/ud-651/blob/master/supporting_texts/dataset_construction.md).

As part of cleaning up dataset, I had to assign manually if the crime was personal or property crime. Original crime datasets contained a column "crime type", however these were more granular crime types. More over, each police departments has its own set of crime types. In my case this column contained rather obvious types, such as 'Arson', 'Assault', 'Homicide' or 'Theft', as well as more obscure or granular types, such as *'OTHER MISCELLANEOUS CRIME'* or *'THEFT, COIN MACHINE'*. I constructed a [separate dataset](https://github.com/nikita-barsukov/ud-651/blob/master/clean_datasets/crime_types.csv) that matches between reported crime type form dataset, and crime types used in this research: 'personal', 'property', 'other'. 

At the end I constructed two datasets about crime and demographic statistics in Los Angeles and Chicago:

1. [crime_reports.csv](https://github.com/nikita-barsukov/ud-651/blob/master/clean_datasets/crime_reports.csv), containing crime reports for 2013 in Los Angeles and Chicago. Its columns are: 
    1. crime, crime type as found in report. 
    2. lat and lon - latitude and longitue associated with the crime report
    3. reported_at. Date and hour when crime was reported to happen.
    4. city. Los Angeles or Chicago
    5. type. Personal, property or other.

2. [crime_demo_data.csv](https://github.com/nikita-barsukov/ud-651/blob/master/clean_datasets/crime_demo_data.csv), rate of of personal, property and other crime by census block group per 100,000 inhabitants, with demographic variables. In addition to census block identificator and crime rates, following demographic variables are present:
    1. Population density, persons per sqkare kilometer;
    2. Median personal income, US Dollars;
    3. Share of unemployed
    4. Share of people with at least a high school degree.
    
Analysis and exploration of data
=====================
In this section I will look at two datasets in more detail, and will try to provide a deeper overview of crime situation in both cities. Let's start with exploring basic descriptive statistics of crime reports dataset.


Summary of crime dataset
-------------------
There are 535,912 crime reports in our dataset, 304,372 or 56.8% of our dataset are reported in Chicago and 231,540 or 43.2% were reported in Los Angeles. Crime rates (number of reproted crimes per 100,000)  are given in table below:


Table: Crime rate in Chicago and Los Angeles, 2013

|             |   personal|   property |   total|
|-------------| --------- | --------- | ------- |
|Chicago      |     4,169 |     5,834 |  11,248 |
|Los Angeles  |     2,558 |     3,356 |   6,105 |

Chicago has significantly higher crime rate in 2013 than Los Angeles. Difference is especially high for personal crimes: Chicago's rate of personal crimes is around 60% higher than Los Angeles'.

Let's look at the time when crimes are happening. Hourly patterns by crime type and city are plotted below.

![Share of crime reports by hour](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/hour_breakdowns-1.png) 

Some patterns are the same across the cities and crime types. For example, time when crime reports are reported the least is during early morning hours between 4 and 6 AM. It is surprizing to see that crime reports tend to be reported more at odd hours, as we see from jagged lines in all the facets.

Crime in Chicago and Los Angeles are different in several ways. As we saw in table above, personal crimes in Chicago have larger share of reported crimes than in Los Angeles. Another difference is that property crimes tend to be happening at different times in these two cities: maximum share of reported property crimes in Chicago is at 9AM, while in Los Angeles maximum is at noon.

Let's look at weekday patterns.

![Share of crime reports by weekday](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/weekday_breakdowns-1.png) 

Here we see slightly different crime patterns between two cities. Most crimes in Chicago are reported at the begininng of the week, while in Los Angeles they tend to be happening in the middle of the week.

Univariate plots.
----------

Let's look at distribution of our crime rate variables and demographic variables. Outliers were omitted in plots in this section. 

![Distribution of crime rate in census block groups](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/bivariate_plots-1.png) 

We see several interesting patterns from these histograms. First, all have long tails, they are not normally distributed. Histogram for all crime types have somewhat thicker tail, which is ovbious since personal and property crimes are included in that figure.

Personal and property crimes have maximums at different levels. Histogram of property crime has largest bin on leftmost part of axis, while personal crimes histogram spikes at slightly larger levels of crime rate.

Let's see at histograms of our demographic variables.

![Distribution of demographic variables in census block groups](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/histograms-1.png) 

Three of our demographc variables have similar distributions: quick spike at the beginning of x axis, and then slowly decreasing. Education level is different though: it increases steadily, with a sharp drop very close to a 100% mark.

Bivariate plots.
----------

Scatteplots of number of various types of crime and demograpfic parameters by block group are plotted below. As in previosu section, outliers were removed from this plot.

![Crime rate and demographic variables](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/crime_rate_vs_demo-1.png) 

We can see from scatterplots above that all our demographic variables appear to correlate with crime levels. It is also interesting to note that relation between density and median income from one side and crime levels on another side looks non-linear.

Spatial plots of crime data
--------------

Let's put crime reports to map of each city.

![Property and personal crimes in Chicago and Los Angeles](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/crime_heatmaps-1.png) 

Both personal and property crimes in Los Angeles are concentrated in a single area around Skid Row and Downton Los Angeles. In Chicago though different types of crime are concentrated in completely different areas. Property crimes are clustered around Chicago city center: Near North Side, Chicago Loop and River North. Personal crimes are concentrated heavily around western areas of Chicago: North and South Lawndale, Near West Side.

Let's plot our demographic variables on a city map, to find visual clues about connection between demography and crime level. This is map of Los Angeles with four demographic variables on it:

![Demography maps of Los Angeles](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/demo_map_la-1.png) 

Same variables for Chicago look like this: 

![Demography maps of Chicago](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/demo_map_ch-1.png) 

Plots above suggest that there is indeed some correlation between demographic variables and crime levels. Correlation look especially clear for education levels and median income. In addition to that, crime in Chicago appears to be concentrated in areas with higher unemployment. while for Los Angeles same can be said about areas with high population density.

With all these plots in mind, we now have some visual clues suggesting that there might be a correlation between crime rate and demographic variables, selected for this research. Moreover, they might hind that demographic factors correlate in the same way with personal and property crime rates.

Correlation coefficients
--------------

Let's find quantifiable parameters to visual clues described in sections above and look at correlation matrix: how crime rate in census block groups correlate with our four demographic parameters.


Table: Correlations between crime rate and demography, entire dataset

|                                 |   Total crimes |  Property crimes |  Personal crimes|
|---------------------------------|  ------------- | ---------------- | ----------------|
|Population density               |        -0.0463 |          -0.0340 |          -0.0622|
|Median Income                    |        -0.0363 |          -0.0085 |          -0.0821|
|% of unemployed                  |         0.1532 |           0.1195 |           0.1970|
|% of high school diploma or more |         0.0182 |           0.0270 |          -0.0017|

Perhaps a bit surprizingly for us, correlation coefficients are very low. Unemployment level correlates somewhot more significant with all crime types than other demographic variables, however even here they don't exceed 20%. Other correlation coefficients sow even weaker, with numbers around single digit percent they suggest that correlation on overall dataset is almost non-existent.

However it makes sense to have a look at each individual city to see if things are different.


Table: Correlations between crime rate and demography, Los Angeles

|                                  |  Total crimes|   Property crimes |  Personal crimes |
|--------------------------------- | -------------|  ---------------- | ---------------- |
|Population density                |       -0.0301|           -0.0283 |          -0.0324 |
|Median Income                     |       -0.0029|           -0.0018 |          -0.0055 |
|% of unemployed                   |        0.1753|            0.1751 |           0.1756 |
|% of high school diploma or more  |        0.0218|            0.0240 |           0.0175 |



Table: Correlations between crime rate and demography, Chicago

|                                 |   Total crimes |  Property crimes|   Personal crimes|
|---------------------------------|  ------------- | ----------------|  ----------------|
|Population density               |        -0.1845 |          -0.1799|           -0.1707|
|Median Income                    |        -0.1544 |          -0.0337|           -0.2447|
|% of unemployed                  |         0.2738 |           0.1941|            0.3099|
|% of high school diploma or more |        -0.0589 |           0.0029|           -0.1106|

There are no coefficients higher than 35% on city level as well. In Chicago we see that rate of personal crimes correlate with demographic variables stronger than in Los Angeles, especially the unemployment rate. Also population density correlates somewhat closer with all crime types in Chicago. However even here such numbers do not show us a significant correlation bewteen crime and demographic variables.

Final plots and summary
===============

My research produced mixed results. While correlation patters in both cities differ from each other, I could not find a significant correlation between any of demographic varaible used in this research and crime rate of any type.

![Correlation between crime and demografic parameters, Chicago](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/corr_matrices_ch-1.png) 

Crime in Chicago shows visible level of correlation with unemployment level, density and median income. It is interesting, that personal crimes correlate with these demographical variables more than property crimes.

![Correlation between crime and demografic parameters, Los Angeles](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/corr_matrices_la-1.png) 

As it was mentioned before, correlation patterns in Los Angeles are vastly different from Chicago. Overall correlation coefficients between crime rate and demographic variables are very close to zero. Of all four demographics only unemployment correlates with crimes of both types at more or less visible level (above 15%). Three other demographic variables have correlation coefficients in range 0--5%.

![Correlation between crime and demografic parameters, both cities](https://s3-eu-west-1.amazonaws.com/barsukov-assets/images/la-chicago-crime/corr_matrices_total-1.png) 

Correlation coefficients on all dataset don't give us drastically different picture. Correlation between unemployment and crime rate stands out from other demographic parameters, however it is still way below generally accepted level of 70+%. We also see that personal crimes correlate more with demographic variables. With such low correlation coefficients however this is meaningless, we cannot draw any conclusions based on that.

Another findings that we can see from research above: 

* Personal crimes tend to correlate with demographic parameters stronger than property crimes
* Chicago and Los Angeles have different patterns in correlations
* The only demographic parameter that correlates with borh personal and property crime rate in Los Angeles is unemployment level

Reflection
============
My research failed to show decisively a correlation between level of reported crime in Chicago and Los Angeles, and either of selected four demographic characteristics. 

We clearly see that in both cities crimes are heavily concentrated in certain city areas, which also tend to have distinct demographic qualities. Despite that, correlation coefficient between crime rate per 100,000 inhabitants and demographic characteristics on census block level was insignificant.

So what could go wrong in my analysis? What could be the reasons why I failed to uncover strong correlations between median income, population density, unemployment and education level, and crime rate? After all, these four parameters are associated with crime rate extremely often in relevant literature.

First thing that could be wrong was selected level of granularity of my geographical data. Census blocks, which are the lowest geographical level for which census data is provided publicly, might be too small for the broad analysis attempted in this paper. Plotting same data on larger geographical units might give us a different picture. 

A lot of effort was spent on normalizing and merging raw crime datasets. One of the tasks included normalizing crime types, making their labels uniform across all two cities. I could make mistakes in attributing crime type reported in original dataset to crime type used in this paper.

Besides above problems, there are also other broader issues with taken approach. For example, it does not contain any temporal aspect. Dataset covers only year 2013. This would be crucial had I attempted to perform cause-and-effect analysis.

However despite of my failure to find some support to my research question, plenty of positive things can be found in this grading paper. For example, I showed that there is a lot of potential value in combining publicly available datasets from different sources. Plenty of demographical data is available for various geographical blocks on several levels from American County Survey and census. 

Further research on using datasets used in this paper could include: 

 * Cluster analysis of crime reports. We could explore various clustering approaches to find out areas of crime concentration.
 * Include more demographic variables, ex. family size, number of children in a family etc.
 * We could also use locations of other places, ex. compare distributions of McDonalds's, Starbucks, 7-Eleven restaurants, and locations of crime reports.
