import csv
import json
import time
from collections import OrderedDict
from datetime import datetime
from urllib.request import urlopen

from bs4 import BeautifulSoup

# this is the url of the tag which should get searched
url = "https://archiveofourown.org/tags/Dragon%20Age%20-%20All%20Media%20Types/works"

page = urlopen(url)
soup = BeautifulSoup(page, 'html.parser')

# check how many pages there are
last_page = int(soup.find(
    "ol", {"class": "pagination actions"}).findAll("li")[-2].string)

fandoms = {}
relationships = {}
characters = {}
freeforms = {}

# each work is saved as a list containing title/author/date/required tags, every fandom,
# relationship, character and "normal" tag, plus language/word count/chapters/comments/kudos/bookmarks/hits
# all of those are separate lists
works = []

for i in range(1, last_page + 1):
    # optional wait between access of pages
    # time.sleep(.25)
    print("On page " + str(i) + " of " + str(last_page))
    newurl = url + "?page=" + str(i)
    page = urlopen(newurl)
    soup = BeautifulSoup(page, 'html.parser')

    for work in soup.findAll("li", {"class": "work blurb group"}):
        new_work = [[], [], [], [], [], []]

        # work details
        # name
        new_work[0].append(work.find("h4").find("a").string)
        # author, which can be anonymous
        author = work.find("h4").find("a").findNext("a")
        if author != None:
            new_work[0].append(author.string)
        # date
        new_work[0].append(work.find("p", {"class": "datetime"}).string)
        # rating, type of ship, warnings and status
        req_tags = work.find(
            "ul", {"class": "required-tags"}).findAll("span", {"class": "text"})
        for t in req_tags:
            new_work[0].append(t.text)

        # work fandoms
        for link in work.find("h5", {"class": "fandoms heading"}).findAll("a"):
            fan = link.string

            # adds to work list
            new_work[1].append(fan)

            # adds to general list
            if fan not in fandoms:
                fandoms[fan] = 1
            else:
                fandoms[fan] += 1

        # work relationships
        for relationship in work.findAll("li", {"class": "relationships"}):
            rel = relationship.find("a").string

            # adds to work list
            new_work[2].append(rel)

            # adds to general list
            if rel not in relationships:
                relationships[rel] = 1
            else:
                relationships[rel] += 1

        # work characters
        for character in work.findAll("li", {"class": "characters"}):
            char = character.find("a").string

            # adds to work list
            new_work[3].append(char)

            # adds to general list
            if char not in characters:
                characters[char] = 1
            else:
                characters[char] += 1

        # work tags
        for freeform in work.findAll("li", {"class": "freeforms"}):
            free = freeform.find("a").string

            # adds to work list
            new_work[4].append(free)

            # adds to general list
            if free not in freeforms:
                freeforms[free] = 1
            else:
                freeforms[free] += 1

        for freeform in work.findAll("li", {"class": "freeforms last"}):
            free = freeform.find("a").string

            # adds to work list
            new_work[4].append(free)

            # adds to general list
            if free not in freeforms:
                freeforms[free] = 1
            else:
                freeforms[free] += 1

        for stat in work.find("dl", {"class": "stats"}).findAll("dd"):
            new_work[5].append(stat.string)
        works.append(new_work)


# save all works in one file
with open('../data/dragonageworks.json', 'w') as outfile:
    json.dump(works, outfile)

# save all ships in file
with open('../data/dragonageships.csv', 'w') as csvfile:
    fieldnames = ['key', 'value']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for k in relationships:
        writer.writerow({'key': k, 'value': relationships[k]})
    csvfile.close()


# save character tags in csv
with open('../data/dragonagechars.csv', 'w') as csvfile:
    chars = OrderedDict(
        sorted(characters.items(), key=lambda x: x[1], reverse=True))
    fieldnames = ['key', 'value']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for k in chars:
        writer.writerow({'key': k, 'value': chars[k]})
    csvfile.close()

# save dates
with open('../data/dragonagedates.csv', 'w') as csvfile:
    dates = {}

    # only save dates of completed works
    for work in works:
        if work[0][-1] == "Complete Work":
            if work[0][2] not in dates:
                dates[work[0][2]] = 1
            else:
                dates[work[0][2]] += 1
    fieldnames = ['date', 'value']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for k in dates:
        writer.writerow({'date': k, 'value': dates[k]})
    csvfile.close()

# save lengths of the works
with open('../data/dragonageworklengths.csv', 'w') as csvfile:
    fieldnames = ['length', 'chapters', 'done']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for k in works:
        length = str(k[-1][1]).replace('"', '').replace(',', '')
        # It seems like very few stories are bugged and do not have a word count. these are not saved
        if "None" in length:
            continue
        chapters = k[-1][2].split("/")
        if chapters[0] == chapters[1]:
            done = True
        else:
            done = False
        writer.writerow(
            {'length': length, 'chapters': chapters[0], 'done': done})
    csvfile.close()

# save ratings in file
with open('../data/dragonageratings.csv', 'w') as csvfile:
    ratings = {}

    for work in works:
        if work[0][3] not in ratings:
            ratings[work[0][3]] = 1
        else:
            ratings[work[0][3]] += 1
    fieldnames = ['key', 'value']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for k in ratings:
        writer.writerow({'key': k, 'value': ratings[k]})
    csvfile.close()
