"""Utility file to seed database using SF/Oakland public art data csv in seed_data/"""

import csv
import json

from sqlalchemy import func
from model import Tag, Media, Genre, TagGenre, User, UserGenre, Comment

from model import connect_to_db, db
from server import app


def load_genres():
    """Load list of starting genres from file"""

    print "Genres"

    Genre.query.delete()

    for row in open("seed_data/genres.txt"):
        row = row.rstrip()

        genre = Genre(genre=str(row))

        db.session.add(genre)
    db.session.commit()


def load_art_points_SF():
    """Load points from SF public art csv data into database"""

    print "Tags SF"

    Tag.query.delete()

    with open ("seed_data/SF_Civic_Art.csv") as csv_file:
        for row in csv.reader(csv_file):

            artist, created_at, patron, size, geometry, location, details, source, title = row[3:12]

            latitude = json.loads(geometry)['coordinates'][1]
            longitude = json.loads(geometry)['coordinates'][0]

            tag = Tag(latitude=latitude,
                          longitude=longitude,
                          title=title,
                          artist=artist,
                          details=details)

            db.session.add(tag)
            db.session.commit()

            tag_genre = TagGenre(tag_id=tag.tag_id,
                                 genre="art")

            db.session.add(tag_genre)

    db.session.commit()    



def load_art_points_Oakland():
    """Load points from Oakland public art csv data into database"""

    print "Tags Oakland"

    with open ("seed_data/Oakland_Civic_Art.csv") as csv_file:
        for row in csv.reader(csv_file):

            title, artist, artist_origin, year, temp_or_perm, in_or_out, media, media_detail, location, address = row

            #parse location information into latitude and longitude
            lat_long = location.split('\n')[-1][1:-1].split(", ")

            latitude = float(lat_long[0])
            longitude = float(lat_long[1])

            tag = Tag(latitude=latitude,
                          longitude=longitude,
                          title=title,
                          artist=artist,
                          details=media_detail)

            db.session.add(tag)
            db.session.commit()

            tag_genre = TagGenre(tag_id=tag.tag_id,
                                 genre="art")

            db.session.add(tag_genre)

    db.session.commit()  



def load_waymarks():
    """Load points from Waymark scraped txt file into database"""

    print "Waymark Murals SF"

    for row in open("seed_data/waymarks.txt"):
        row = row.rstrip()

        latitude, longitude, title, artist, details, media_url = row.split('|')

        tag = Tag(latitude=latitude,
                      longitude=longitude,
                      title=title,
                      artist=artist,
                      details=details)

        db.session.add(tag)
        db.session.commit()

        tag_genre = TagGenre(tag_id=tag.tag_id,
                                 genre="art")

        db.session.add(tag_genre)

        media = Media(tag_id = tag.tag_id,
                      media_url = media_url)

        db.session.add(media)

    db.session.commit()  



if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    load_genres()
    load_art_points_SF()
    load_art_points_Oakland()
    load_waymarks()
    

