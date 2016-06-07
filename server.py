"""Flask structure for website."""

import os
import requests
import simplejson
import boto3
import json

from jinja2 import StrictUndefined

from flask import Flask, Response, render_template, redirect, request, flash, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

from model import Tag, User, Comment, Media, Genre, TagGenre, UserGenre, connect_to_db, db

# from modules.route import api_key, find_tags_on_route, find_route_coordinates, find_bounding_box, query_tags
from route import api_key, find_tags_on_route, find_route_coordinates, find_bounding_box, query_tags

# import modules.utils
import utils


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Raises an error rather than allowing jinja to fail silently.
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def landing():
    """Homepage. Allows user to search for desired route."""


    return render_template("landing.html")


@app.route('/home')
def homepage():
    """Homepage. Allows user to search for desired route."""

    user_id = session.get("user") 
    user = utils.toggle_login(user_id)

    return render_template("homepage.html", name=user, genres=Genre.query.all())



@app.route('/tags-geolocation.json', methods=["GET", "POST"])
def nearby_tags():
    """JSON information about the tags for given query."""
 
    min_lat = request.form.get('minLat');
    min_lng = request.form.get('minLng');
    max_lat = request.form.get('maxLat');
    max_lng = request.form.get('maxLng');

    query_results = Tag.query.filter(Tag.latitude >= min_lat, 
                                Tag.latitude <= max_lat,
                                Tag.longitude >= min_lng,
                                Tag.longitude <= max_lng).all()

    user_id = session.get("user") 
    tag_dict = utils.find_tags_for_user(user_id, query_results)
    
    return jsonify(tag_dict)


@app.route('/tags.json', methods=["GET", "POST"])
def tags():
    """JSON information about the tags for given query."""

    origin = request.form.get('origin')
    destination = request.form.get('destination')

    queried_tags = find_tags_on_route(origin, destination)

    tags = utils.map_tag_details(queried_tags)

    return jsonify(tags)


@app.route('/add-comment.json', methods=["GET","POST"])
def add_comment():
    """Add user's comment to db and update current page."""

    content = request.form.get('comment')
    tag_id = request.form.get('tagId')

    user_id = session.get("user")

    newComment = utils.process_user_comment(tag_id, user_id, content)

    return jsonify(newComment)



@app.route('/sign.json', methods=["POST"])
def sign_s3():
    """Generate a 'presigned post' to allow media upload to Amazon S3"""
    
    post_info = utils.get_signed_post()

    return jsonify(post_info)



@app.route('/new-tag.json', methods=["POST"])
def handle_add_tag():
    """Add user's new tag to db."""

    latitude=request.form.get('latitude'),
    longitude=request.form.get('longitude'),
    title=request.form.get('title'),
    artist=request.form.get('artist'),
    details=request.form.get('details'),
    audio_url=request.form.get('audio_url')
    primary_image=request.form.get('primary_image')
    video_url=request.form.get('video_url')
    genres=request.form.get('genres')

    tag = utils.add_tag_to_db(latitude,longitude,title,artist,details,primary_image)

    print tag

    if audio_url:
        utils.add_media_to_db(tag.tag_id,audio_url,"audio")

    if video_url:
        utils.add_media_to_db(tag.tag_id,video_url,"video")

    genres = genres.split(',')
    utils.add_genres_to_db(tag.tag_id, genres)

    new_tag = {
        "tagId": tag.tag_id,
        "latitude": tag.latitude,
        "longitude": tag.longitude,
        "title": tag.title,
        "excerpt": ' '.join(tag.details.split()[:15]) + '...',
        "artist": tag.artist,
        "details": tag.details,
        "primaryImage": tag.primary_image,
        "media": [{media.media_id : {"media_type":media.media_type,
                                     "url":media.media_url}} for media in tag.medias],
        "comments": []
    }
    
    return jsonify(new_tag)




@app.route('/login.json', methods=["POST"])
def handle_login():
    """Log user in if registered and input password is correct."""

    username = request.form.get('username')
    password = request.form.get('password')

    user = User.query.filter(User.username == username).first()

    currentUser = utils.process_login(user, password)
    return jsonify(currentUser)



@app.route('/register')
def register():
    """Show registration form for user."""

    return render_template("register.html", genres=Genre.query.all())



@app.route('/handle-registration', methods=["POST"])
def handle_registration():
    """Add new user to database and log user into site."""

    name = request.form.get('name')
    username = request.form.get('username')
    password = request.form.get('password')
    genres = request.form.getlist('genres')
    avatar = request.form.get('image_url')

    utils.register_user(name, username, password, genres, avatar)

    return redirect('/home')





if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run()