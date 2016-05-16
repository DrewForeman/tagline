"""Flask structure for urbex website."""

import os
import requests
# import json
import simplejson

from jinja2 import StrictUndefined

from flask import Flask, render_template, redirect, request, flash, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

from model import Landmark, User, Comment, connect_to_db, db

from route import api_key, find_landmarks, find_route_coordinates, find_bounding_box, query_landmarks


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Raises an error rather than allowing jinja to fail silently.
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage. Allows user to search for desired route."""

    return render_template("homepage.html")


@app.route('/tags-geolocation.json', methods=["GET", "POST"])
def nearby_tags():
    """JSON information about the tags for given query."""
 
    min_lat = request.form.get('minLat');
    min_lng = request.form.get('minLng');
    max_lat = request.form.get('maxLat');
    max_lng = request.form.get('maxLng');

    found_tags = Landmark.query.filter(Landmark.latitude >= min_lat, 
                                Landmark.latitude <= max_lat,
                                Landmark.longitude >= min_lng,
                                Landmark.longitude <= max_lng).all()

    nearby_tags = {
        tag.landmark_id: {
        "landmarkId": tag.landmark_id,
        "latitude": tag.latitude,
        "longitude": tag.longitude,
        "title": tag.title,
        "artist": tag.artist,
        "details": tag.details,
        "imageUrl": tag.image_url,
        "comments": [comment.content for comment in tag.comments],
        "usernames": [comment.user.username for comment in tag.comments],
        "times": [comment.logged_at.strftime("%b %d %Y") for comment in tag.comments]
        # [{comment.comment_id : {"username":comment.user.username, 
        #                                    "time":comment.logged_at, 
        #                                    "content":comment.content}} for comment in tag.comments]
                                           
        }
        for tag in found_tags
    }

    return jsonify(nearby_tags)


@app.route('/tags.json', methods=["GET", "POST"])
def tags():
    """JSON information about the tags for given query."""
 
    origin = request.form.get('origin')
    destination = request.form.get('destination')

    tags = {
        tag.landmark_id: {
        "landmarkId": tag.landmark_id,
        "latitude": tag.latitude,
        "longitude": tag.longitude,
        "title": tag.title,
        "artist": tag.artist,
        "details": tag.details,
        "imageUrl": tag.image_url,
        "comments": [comment.content for comment in tag.comments],
        "usernames": [comment.user.username for comment in tag.comments],
        "times": [comment.logged_at.strftime("%b %d %Y") for comment in tag.comments]
        # [{comment.comment_id : {"username":comment.user.username, 
        #                                    "time":comment.logged_at, 
        #                                    "content":comment.content}} for comment in tag.comments]
        
        }
        for tag in find_landmarks(origin, destination)
    }

    return jsonify(tags)


@app.route('/add-comment.json', methods=["GET","POST"])
def add_comment():
    """Add user's comment to db and update current page."""

    content = request.form.get('comment')
    landmark_id = request.form.get('landmarkId')

    user_id = session.get('user')

    user_id = session.get("user_id")

    if user_id:
        comment = Comment(landmark_id=landmark_id,
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
    image_url=request.form.get('image_url')

    tag = Landmark(latitude=latitude,
                    longitude=longitude,
                    title=title,
                    artist=artist,
                    details=details,
                    image_url=image_url
                        )

    db.session.add(tag)
    db.session.commit()
    # also update new db table for user created places w user_id, landmark_id, logged_at

    newTag = {
            "landmarkId": tag.landmark_id,
            "title": tag.title,
            "artist": tag.artist,
            "details": tag.details,
            "imageURL": tag.image_url
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



# @app.route('/register')
# def register():
#     """Show registration form for user."""

#     return render_template("register.html")



# @app.route('/handle-registration', methods=["POST"])
# def handle_registration():
#     """Add new user to database and log user into site."""

#     username = request.form.get('username')
#     password = request.form.get('password')

#     new_user = User(username=username, password=password)

#     db.session.add(new_user)
#     db.session.commit()

#     session['user'] = new_user.user_id

#     flash(("Welcome {}. You have been registered and logged in.").format(new_user.username))
#     return redirect('/')






if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run()