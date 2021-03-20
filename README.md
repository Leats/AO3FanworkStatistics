# AO3 Fanwork Statistics

This was created because I originally wanted to make some statistics regarding the Dragon Age tag on [archiveofourown.org](http://archiveofourown.org). By now it has developed into Haikyuu statistics.

I created a script to go through the tag and save the data of every fanwork in the tag to a postgresql database.

Back in 2018 this was also the first time I worked with d3 to create data graphics with the collected data.
In 2021 I redid parts of the visualizations.

**The result can be seen [here](https://leats.github.io/AO3FanworkStatistics/).**

**Limitations: Only fanworks visible for everyone are counted in these statistics. Works where one has to be logged in were ignored.**

---
### What I did / Structure of the Project


#### Scraper
The script I used to scrape AO3 is found in `/scripts/FandomStatisticsScraper.py`. For it to run properly a [PostgreSQL database](https://www.postgresql.org/download/) is needed and the credentials need to get entered into `/database.ini` (an example file is already in the repository).

Right now, especially with large AO3 tags this scraper will take HOURS because it rests 7 seconds between pages. Every wait shorter than this might trigger `429 - Too Many Requests`. For fandoms that consist of more than 100,000 fanworks the originally displayed amount of pages will not be correct as AO3 can only display 5000 pages at once. Every additional one will only be properly counted once we're on page 5000. (Right now this script would not look at more than 200,000 fanworks at most.)

#### Flask App
Originally I had planned on using a Flask app with SQLAlchemy for this project. However, as I still want to use github pages for the visualisations right now I did work without the flask app. But the file for it is still in the repository (`/app.py`), and I might continue on adding visualisations directly accessing the database as that gives a lot more options. For now, though, the visualisations only use pre-created JSON files with the data.

#### Visualisations
I use [skrollr](https://github.com/Prinzhorn/skrollr) for the website and [D3](https://d3js.org/) for the graphs.

#### The past version
The parts only used in the past version can be seen in `/past version`. This includes the data of the Dragon Age tag on AO3 and the original `html` and `js` files. These are currently not used in the new version.