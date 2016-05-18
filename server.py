"""Flask structure for urbex website."""

import os
import requests
# import json
import simplejson

from jinja2 import StrictUndefined

from flask import Flask, render_template, redirect, request, flash, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

from model import Tag, User, Comment, Media, Genre, TagGenre, UserGenre, connect_to_db, db

from route import api_key, find_landmarks, find_route_coordinates, find_bounding_box, query_landmarks


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Raises an error rather than allowing jinja to fail silently.
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage. Allows user to search for desired route."""

    # add ability to create genres list in html inside JS file from dynamic query

    # genres = Genre.query.all()
    # genre_list = [genre.genre for genre in genres]
    # return render_template("homepage.html", genres=genres)

    return render_template("homepage.html")


@app.route('/tags-geolocation.json', methods=["GET", "POST"])
def nearby_tags():
    """JSON information about the tags for given query."""
 
    min_lat = request.form.get('minLat');
    min_lng = request.form.get('minLng');
    max_lat = request.form.get('maxLat');
    max_lng = request.form.get('maxLng');

    found_tags = Tag.query.filter(Tag.latitude >= min_lat, 
                                Tag.latitude <= max_lat,
                                Tag.longitude >= min_lng,
                                Tag.longitude <= max_lng).all()

    nearby_tags = {
        tag.tag_id: {
        "tagId": tag.tag_id,
        "latitude": tag.latitude,
        "longitude": tag.longitude,
        "title": tag.title,
        "artist": tag.artist,
        "details": tag.details,
        "mediaUrl": [media.media_url for media in tag.medias],
        "comments": [{comment.comment_id : {"username":comment.user.username, 
                                           "time":comment.logged_at.strftime("%b %d %Y"), 
                                           "content":comment.content}} for comment in tag.comments]
                                           
        } for tag in found_tags
    }
    return jsonify(nearby_tags)


@app.route('/tags.json', methods=["GET", "POST"])
def tags():
    """JSON information about the tags for given query."""
 
    origin = request.form.get('origin')
    destination = request.form.get('destination')

    tags = {
        tag.tag_id: {
        "tagId": tag.tag_id,
        "latitude": tag.latitude,
        "longitude": tag.longitude,
        "title": tag.title,
        "artist": tag.artist,
        "details": tag.details,
        "mediaUrl": [media.media_url for media in tag.medias],
        "comments": [{comment.comment_id : {"username":comment.user.username, 
                                           "time":comment.logged_at.strftime("%b %d %Y"), 
                                           "content":comment.content}} for comment in tag.comments]
        
        } for tag in find_landmarks(origin, destination)
    }
    return jsonify(tags)


@app.route('/add-comment.json', methods=["GET","POST"])
def add_comment():
    """Add user's comment to db and update current page."""

    content = request.form.get('comment')
    tag_id = request.form.get('tagId')

    user_id = session.get("user")

    if user_id:
        comment = Comment(tag_id=tag_id,
                          user_id=user_id,
                          content=content)
        db.session.add(comment)
        db.session.commit()

        newComment = {
            "username": comment.user.username,
            "content": comment.content,
            "loggedAt": comment.logged_at.strftime("%b %d %Y")
        }
        return jsonify(newComment)
    else:
        newComment = {"comment": "Not logged in."}
        return jsonify(newComment)




@app.route('/new-tag.json', methods=["POST"])
def handle_add_tag():
    """Add user's new tag to db."""

    latitude=request.form.get('latitude'),
    longitude=request.form.get('longitude'),
    title=request.form.get('title'),
    artist=request.form.get('artist'),
    details=request.form.get('details'),
    media_url=request.form.get('media_url')
    genres=request.form.get('genres')

    genres = genres.split(',')

    tag = Tag(latitude=latitude,
                    longitude=longitude,
                    title=title,
                    artist=artist,
                    details=details,
                )

    db.session.add(tag)
    db.session.commit()

    media = Media(tag_id=tag.tag_id,
                  media_url=media_url)

    db.session.add(media)
    db.session.commit()

    for genre in genres[:-1]:
        tag_genre = TagGenre(tag_id=tag.tag_id, genre=genre)
        db.session.add(tag_genre)
    db.session.commit()

    newTag = {
            "tagId": tag.tag_id,
            "title": tag.title,
            "artist": tag.artist,
            "details": tag.details,
            "mediaURL": media.media_url
    }
    
    return jsonify(newTag)



@app.route('/login.json', methods=["POST"])
def handle_login():
    """Log user in if registered and input password is correct."""

    username = request.form.get('username')
    password = request.form.get('password')

    user = User.query.filter(User.username == username).first()

    if user:
        if password == user.password:
            session['user'] = user.user_id
            currentUser = {"username": user.username}
            return jsonify(currentUser)
        else:
            currentUser = {"username": "not recognized"}
            return jsonify(currentUser)
    else:
        currentUser = {"username": "not recognized"}
        return jsonify(currentUser)



@app.route('/register')
def register():
    """Show registration form for user."""

    # get list of all genre objects
    genres = Genre.query.all()

    return render_template("register.html", genres=genres)



@app.route('/handle-registration', methods=["POST"])
def handle_registration():
    """Add new user to database and log user into site."""

    name = request.form.get('name')
    username = request.form.get('username')
    password = request.form.get('password')
    genres = request.form.getlist('genres')
    print genres

    new_user = User(name=name, username=username, password=password)

    db.session.add(new_user)
    db.session.commit()

    session['user'] = new_user.user_id

    for genre in genres:
        user_genre = UserGenre(user_id=new_user.user_id, genre=genre)
        db.session.add(user_genre)
    db.session.commit()

    return redirect('/')






if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run()