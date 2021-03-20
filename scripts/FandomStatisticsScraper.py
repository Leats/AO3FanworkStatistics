import time
import psycopg2
from datetime import datetime
from urllib.request import urlopen
from configparser import ConfigParser
from bs4 import BeautifulSoup

# this is the url of the tag which should get searched
# please note that some fanfics are only shown to logged in users
# this scraper won't see them
url = "https://archiveofourown.org/tags/Haikyuu!!/works"


def config(filename='database.ini', section='postgresql'):
    # create a parser
    parser = ConfigParser()
    # read config file
    parser.read(filename)

    # get section, default to postgresql
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception(
            'Section {0} not found in the {1} file'.format(section, filename))

    return db


def create_tables(cur):
    """Create tables in the PostgreSQL database."""
    commands = ("""CREATE TABLE IF NOT EXISTS works (
                id INTEGER PRIMARY KEY,
                title VARCHAR NOT NULL,
                author VARCHAR,
                date DATE,
                rating VARCHAR,
                warnings VARCHAR,
                category VARCHAR,
                status VARCHAR,
                fandoms VARCHAR [],
                relationships VARCHAR [],
                characters VARCHAR [],
                tags VARCHAR [],
                language VARCHAR,
                words INTEGER,
                chapters INTEGER,
                comments INTEGER,
                kudos INTEGER,
                bookmarks INTEGER,
                hits INTEGER,
                collections INTEGER
        )""",)
    try:
        # create table one by one
        for command in commands:
            cur.execute(command)
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)


def add_new_page(soup, cur, conn):
    works = soup.find("ol", {"class": "work index group"})
    for work in works.findAll("li", {"role": "article"}):
        new_work = {}

        # work details
        # id
        new_work['id'] = work.find("h4").find("a")['href'].rsplit('/', 1)[1]
        # name
        new_work['title'] = work.find("h4").find("a").string
        # author, which can be anonymous
        author = work.find("h4").find("a").findNext("a")
        new_work['author'] = author.string
        # date
        new_work['date'] = work.find("p", {"class": "datetime"}).string
        # rating, type of ship, warnings and status
        req_tags = work.find(
            "ul", {"class": "required-tags"}).findAll("span", {"class": "text"})
        new_work['rating'] = req_tags[0].text
        new_work['warnings'] = req_tags[1].text
        new_work['category'] = req_tags[2].text
        new_work['status'] = req_tags[3].text

        # work fandoms
        work_fandoms = []
        for link in work.find("h5", {"class": "fandoms heading"}).findAll("a"):
            fan = link.string

            # adds to work list
            work_fandoms.append(fan)

        new_work['fandoms'] = work_fandoms

        # work relationships
        work_relationships = []
        for relationship in work.findAll("li", {"class": "relationships"}):
            rel = relationship.find("a").string

            # adds to work list
            work_relationships.append(rel)

        new_work['relationships'] = work_relationships

        # work characters
        work_characters = []
        for character in work.findAll("li", {"class": "characters"}):
            char = character.find("a").string

            # adds to work list
            work_characters.append(char)

        new_work['characters'] = work_characters

        # work tags
        work_freeforms = []
        for freeform in work.findAll("li", {"class": "freeforms"}):
            free = freeform.find("a").string

            # adds to work list
            work_freeforms.append(free)

        for freeform in work.findAll("li", {"class": "freeforms last"}):
            free = freeform.find("a").string

            # adds to work list
            work_freeforms.append(free)

        new_work['tags'] = work_freeforms

        for stat in work.find("dl", {"class": "stats"}).findAll("dd"):
            if stat['class'][0] == 'chapters':
                if stat.find("a") is not None:
                    new_work['chapters'] = int(stat.find("a").string)
                else:
                    new_work['chapters'] = 1
            elif stat['class'][0] == 'language':
                new_work['language'] = stat.string
            elif stat.string is not None:
                new_work[stat['class'][0]] = int(stat.string.replace(',', ''))

        columns = new_work.keys()
        values = [new_work[column] for column in columns]
        vals_str_list = ["%s"] * len(values)
        vals_str = ", ".join(vals_str_list)

        cur.execute("""INSERT INTO works ({cols}) VALUES ({vals_str}) ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        author = EXCLUDED.author,
                        date = EXCLUDED.date,
                        rating = EXCLUDED.rating,
                        warnings = EXCLUDED.warnings,
                        category = EXCLUDED.category,
                        status = EXCLUDED.status,
                        fandoms = EXCLUDED.fandoms,
                        relationships = EXCLUDED.relationships,
                        characters = EXCLUDED.characters,
                        tags = EXCLUDED.tags,
                        language = EXCLUDED.language,
                        words = EXCLUDED.words,
                        chapters = EXCLUDED.chapters,
                        comments = EXCLUDED.comments,
                        kudos = EXCLUDED.kudos,
                        bookmarks = EXCLUDED.bookmarks,
                        hits = EXCLUDED.hits,
                        collections = EXCLUDED.collections ;""".format(
            cols=', '.join(tuple(columns)), vals_str=vals_str), values)
        conn.commit()
    print(new_work)
    return new_work['date']


conn = None
try:
    # read the connection parameters
    params = config()
    # connect to the PostgreSQL server
    conn = psycopg2.connect(**params)
    cur = conn.cursor()
except (Exception, psycopg2.DatabaseError) as error:
    print(error)

# create the tables if they're not there yet
create_tables(cur)

page = urlopen(url)
soup = BeautifulSoup(page, 'html.parser')

# check how many pages there are
last_page = int(soup.find(
    "ol", {"class": "pagination actions"}).findAll("li")[-2].string)

for i in range(1, last_page + 1):
    # we need to wait a long time between pages because otherwise AO3 complains
    time.sleep(7)
    print("On page " + str(i) + " of " + str(last_page))
    newurl = url + "?page=" + str(i)
    soup = BeautifulSoup(urlopen(newurl), 'html.parser')
    last_date = add_new_page(soup, cur, conn)

    # AO3 limits viewable pages to 5000
    # this means that if there are more than 100000 stories we need to look at the older ones as well
    # for this we use the latest date and filter for all stories that are at least that old
    # this will make us look at some stories twice probably but right now I doubt there is a better way
    # still, this could be prettified a little since there is a bit of duplicate code with the 2nd loop here
    if i == 5000 and soup.find("div", {"class": "flash notice"}):
        last_date = datetime.strptime(
            last_date, "%d %b %Y").strftime("%Y-%m-%d")
        print(last_date)
        filtered_url = f"{url}?commit=Sort+and+Filter&utf8=%E2%9C%93&work_search%5Bdate_to%5D={last_date}"
        soup = BeautifulSoup(urlopen(filtered_url), 'html.parser')
        new_last_page = int(soup.find(
            "ol", {"class": "pagination actions"}).findAll("li")[-2].string)
        for i in range(1, new_last_page + 1):
            time.sleep(7)
            print("On page " + str(i) + " of " + str(5000 + new_last_page))
            newurl = f"{url}?commit=Sort+and+Filter&page={i}&utf8=%E2%9C%93&work_search%5Bdate_to%5D={last_date}"
            soup = BeautifulSoup(urlopen(newurl), 'html.parser')
            add_new_page(soup, cur, conn)

# close communication with the PostgreSQL database server
cur.close()
if conn is not None:
    conn.close()
