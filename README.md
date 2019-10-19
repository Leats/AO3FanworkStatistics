# AO3 Fanwork Statistics

This was created because I originally wanted to make some statistics regarding the Dragon Age tag on [archiveofourown.org](http://archiveofourown.org).

I created a script to go through the tag and save the data of every fanwork in the tag. The script also counts how often specific characters and ships were used, plus a few other interesting things.
It was also the first time I worked with d3 to create data graphics with the collected data.
The result can be seen [here](https://leats.github.io/AO3FanworkStatistics/).

---
### How to create other statistics

To create other statistics there is a [branch with a template](https://github.com/Leats/AO3FanworkStatistics/tree/template). It should work with any tag on AO3. This includes fandoms, characters, ships and freeform tags. Specific searches and filtered searches are not supported.


**Step 1:** Clone the repository, use the ['template' branch](https://github.com/Leats/AO3FanworkStatistics/tree/template).

**Step 2:** Edit `/scripts/FandomStatisticsScraper.py`. Change the `url` with whatever you want to have searched.

**Step 3:** Run the script. (If you've never done that before, check out [this](https://realpython.com/run-python-scripts/).) This will probably take a while, depending on the size of the tag. Eventually this should save some data into the `/data` folder of the project.

**Step 4:** In `/data/importantdates.csv` there is a chance to place important dates for the specific fandom. This could be specific release dates, for example.

**Step 5 (optional):** In `/components/lengthandchapters.js` the works get sorted into different bins to show the amount of works with different wordcounts. As standard this is set to 50 bins and the bins reach from 0 to 90000 words. This can be changed by opening the file and changing `binamount` and `largestwork` to something different. Depending on the size of the tag this might be needed. 

**Note:** To actually view the created graphs it is not enough to simply view the file in your web browser of choice. The easiest way to run it in a web server is probably using `python3 -m http.server` or in case of Python 2 `python -m SimpleHTTPServer`. Alternatively it is possible to use github pages as seen int his repository.
