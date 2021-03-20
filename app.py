"""This Flask App using SQLAlchemy is a work in progress.

So far I only used it for quick creation of the json files.
Since I share the code on github pages I cannot use this app when sharing.
So this flask app is currently more or less unused.
"""
import json
from flask import Flask
from flask import jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, select, desc
from sqlalchemy.dialects.postgresql import ARRAY

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = ""  # todo: credentials :)
db = SQLAlchemy(app)


class Works(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    author = db.Column(db.String)
    date = db.Column(db.Date)
    rating = db.Column(db.String)
    warnings = db.Column(db.String)
    category = db.Column(db.String)
    status = db.Column(db.String)
    fandoms = db.Column(ARRAY(db.String))
    relationships = db.Column(ARRAY(db.String))
    characters = db.Column(ARRAY(db.String))
    tags = db.Column(ARRAY(db.String))
    language = db.Column(db.String)
    words = db.Column(db.Integer)
    chapters = db.Column(db.Integer)
    comments = db.Column(db.Integer)
    kudos = db.Column(db.Integer)
    bookmarks = db.Column(db.Integer)
    hits = db.Column(db.Integer)
    collections = db.Column(db.Integer)

    def __repr__(self):
        return f'<Work {self.id}>'


class ImportantDates(db.Model):
    date = db.Column(db.Date, nullable=False)
    value = db.Column(db.String, primary_key=True)

    def __repr__(self):
        return f'<ImportantDate {self.date}>'


@ app.route("/")
def index():
    return render_template("index.html")


@ app.route('/data/amount')
def get_amount():
    amount = Works.query.filter(Works.status == 'Complete Work').with_entities(
        Works.date, func.count(Works.date)).group_by(Works.date).all()
    data = list(
        map(lambda x: {'date': x[0].strftime("%d %b %Y"), 'value': x[1]}, amount))
    with open('./data/haikyuu/ficdates.json', 'w') as outfile:
        json.dump(data, outfile)
    return jsonify(data)


@ app.route('/data/iwaoi')
def get_iwaoi():
    amount = Works.query.filter(Works.status == 'Complete Work').filter(Works.relationships.contains('{Iwaizumi Hajime/Oikawa Tooru}')).with_entities(
        Works.date, func.count(Works.date)).group_by(Works.date).all()
    data = list(
        map(lambda x: {'date': x[0].strftime("%d %b %Y"), 'value': x[1]}, amount))
    with open('./data/haikyuu/iwaoi.json', 'w') as outfile:
        json.dump(data, outfile)
    return jsonify(data)


@ app.route('/data/importantdates')
def get_important_dates():
    dates = ImportantDates.query.all()
    data = list(
        map(lambda x: {'date': x.date.strftime("%d %b %Y"), 'value': x.value}, dates))
    return jsonify(data)


@ app.route('/data/chars')
def get_chars():
    session = db.session()
    query = select([func.unnest(Works.characters).label('chara'),
                    func.count().label('value')]).select_from(Works).group_by('chara').order_by(desc('value'))

    charas = session.execute(query).fetchall()
    data = list(
        map(lambda x: {'character': x[0], 'value': x[1]}, charas)
    )
    with open('./data/haikyuu/chars.json', 'w') as outfile:
        json.dump(data, outfile)
    return jsonify(data)


@ app.route('/data/ships')
def get_ships():
    session = db.session()
    query = select([func.unnest(Works.relationships).label('ship'),
                    func.count().label('value')]).select_from(Works).group_by('ship').order_by(desc('value'))

    ships = session.execute(query).fetchall()
    data = list(
        map(lambda x: {'ship': x[0], 'value': x[1]}, ships)
    )
    with open('./data/haikyuu/ships.json', 'w') as outfile:
        json.dump(data, outfile)
    return jsonify(data)


@ app.route('/data/tags')
def get_tags():
    session = db.session()
    query = select([func.unnest(Works.tags).label('tag'),
                    func.count().label('value')]).select_from(Works).group_by('tag').order_by(desc('value'))

    tags = session.execute(query).fetchall()
    data = list(
        map(lambda x: {'tag': x[0], 'value': x[1]}, tags)
    )
    with open('./data/haikyuu/tags.json', 'w') as outfile:
        json.dump(data, outfile)
    return jsonify(data)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
