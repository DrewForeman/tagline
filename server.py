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

from route import api_key, find_landmarks, find_route_coordinates, find_bounding_box, query_landmarks


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Raises an error rather than allowing jinja to fail silently.
app.jinja_env.undefined = StrictUndefined


# @app.route('/test')
# def test():
#     """page for trying out html in browser."""

#     return render_template("test.html")



@app.route('/')
def index():
    """Homepage. Allows user to search for desired route."""

    user_id = session.get("user") 

    if user_id:
        user = User.query.filter_by(user_id = user_id).first()
        name = user.name
    else:
        name = False

    genres = Genre.query.all()

    return render_template("test.html", name=name, genres=genres)



@app.route('/tags-geolocation.json', methods=["GET", "POST"])
def nearby_tags():
    """JSON information about the tags for given query."""
 
    min_lat = request.form.get('minLat');
    min_lng = request.form.get('minLng');
    max_lat = request.form.get('maxLat');
    max_lng = request.form.get('maxLng');

    # if logged in, show the user tags according to preference, else show them everything
    user_id = session.get("user") 

    if user_id:
        user_genres = UserGenre.query.filter(UserGenre.user_id == user_id).all() #get objects for all user-genre pairs in db
        genres_list = [user_genre.genre for user_genre in user_genres] #get list of genre ids

        all_found_tags = Tag.query.filter(Tag.latitude >= min_lat, 
                                    Tag.latitude <= max_lat,
                                    Tag.longitude >= min_lng,
                                    Tag.longitude <= max_lng).limit(9).all()

        # this list comprehension works but does not seem as efficient as possible
        queried_tags = [tag for tag in all_found_tags if (set([genre.genre for genre in tag.genres]) & set(genres_list))]

    else:
        queried_tags = Tag.query.filter(Tag.latitude >= min_lat, 
                                    Tag.latitude <= max_lat,
                                    Tag.longitude >= min_lng,
                                    Tag.longitude <= max_lng).limit(7).all()

    tag_dict = map_tag_details(queried_tags)
    
    return jsonify(tag_dict)



@app.route('/tags.json', methods=["GET", "POST"])
def tags():
    """JSON information about the tags for given query."""

    origin = request.form.get('origin')
    destination = request.form.get('destination')

    queried_tags = find_landmarks(origin, destination)

    tags = map_tag_details(queried_tags)

    return jsonify(tags)


@app.route('/add-comment.json', methods=["GET","POST"])
def add_comment():
    """Add user's comment to db and update current page."""

    content = request.form.get('comment')
    tag_id = request.form.get('tagId')

    user_id = session.get("user")

    if user_id:

        comment = add_comment_to_db(tag_id, user_id, content)

        newComment = {
            "tagId": comment.tag.tag_id,
            "username": comment.user.username,
            "avatar":comment.user.avatar,
            "content": comment.content,
            "time": comment.logged_at.strftime("%b %d %Y")
        }
        return jsonify(newComment)
    else:
        newComment = {"comment": "Not logged in."}
        return jsonify(newComment)



@app.route('/sign.json', methods=["POST"])
def sign_s3():
  """Generate a 'presigned post' to allow media upload to Amazon S3"""

  S3_BUCKET ='tag-media'
  file_name = request.form.get('file_name')
  file_type = request.form.get('file_type')

  s3 = boto3.client('s3')

  presigned_post = s3.generate_presigned_post(
    Bucket = S3_BUCKET,
    Key = file_name,
    Fields = {"acl": "public-read", "Content-Type": file_type},
    Conditions = [{"acl": "public-read"},{"Content-Type": file_type}],
    ExpiresIn = 3600
  )
  post_info = {'data': presigned_post,
               'url': 'https://{}.s3.amazonaws.com/{}'.format(S3_BUCKET, file_name)
               }

  return jsonify(post_info)



@app.route('/new-tag.json', methods=["POST"])
def handle_add_tag():
    """Add user's new tag to db."""

    latitude=request.form.get('latitude'),
    longitude=request.form.get('longitude'),
    title=request.form.get('title'),
    artist=request.form.get('artist'),
    details=request.form.get('details'),
    # media_url=request.form.get('media_url')
    audio_url=request.form.get('audio_url')
    primary_image=request.form.get('primary_image')
    video_url=request.form.get('video_url')
    genres=request.form.get('genres')

    tag = add_tag_to_db(latitude,longitude,title,artist,details)

    if audio_url:
        add_media_to_db(tag.tag_id,audio_url,"audio")
    # if image_url:
    #     add_media_to_db(tag.tag_id,image_url,"image")
    if video_url:
        add_media_to_db(tag.tag_id,video_url,"video")

    genres = genres.split(',')
    add_genres_to_db(tag.tag_id, genres)

    newTag = {
            "tagId": tag.tag_id,
            "title": tag.title,
            "artist": tag.artist,
            "details": tag.details,
            "primary_image": tag.primary_image,
            "media": [{media.media_id : {"media_type":media.media_type,
                                     "url":media.media_url}} for media in tag.medias]
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
            currentUser = {"name": user.name}
            return jsonify(currentUser)
        else:
            currentUser = {"name": "not recognized"}
            return jsonify(currentUser)
    else:
        currentUser = {"name": "not recognized"}
        return jsonify(currentUser)



@app.route('/register')
def register():
    """Show registration form for user."""

    genres = Genre.query.all()

    return render_template("register.html", genres=genres)



@app.route('/handle-registration', methods=["POST"])
def handle_registration():
    """Add new user to database and log user into site."""

    name = request.form.get('name')
    username = request.form.get('username')
    password = request.form.get('password')
    genres = request.form.getlist('genres')
    avatar = request.form.get('image_url')

    new_user = User(name=name, username=username, password=password, avatar=avatar)

    db.session.add(new_user)
    db.session.commit()

    session['user'] = new_user.user_id

    for genre in genres:
        user_genre = UserGenre(user_id=new_user.user_id, genre=genre)
        db.session.add(user_genre)
    db.session.commit()

    return redirect('/')

##################### HELPER FUNCTIONS #############################


def map_tag_details(queried_tags):
    """Create dictionary of tag info to pass to client as json"""

    tags = {
        tag.tag_id: {
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
        "comments": [{comment.comment_id : {"username":comment.user.username, 
                                            "avatar":comment.user.avatar,
                                            "time":comment.logged_at.strftime("%b %d %Y"), 
                                            "content":comment.content}} for comment in tag.comments]
        
        } for tag in queried_tags
    }
    return tags



def add_comment_to_db(tag_id, user_id, content):
    """Update database with new comment"""

    comment = Comment(tag_id=tag_id,
                          user_id=user_id,
                          content=content)
    db.session.add(comment)
    db.session.commit()

    return comment


def add_tag_to_db(latitude,longitude,title,artist,details):
    """Update database with new tag"""

    print '************ entered server add tag'

    tag = Tag(latitude=latitude,
                    longitude=longitude,
                    title=title,
                    artist=artist,
                    details=details,
                    primary_image=primary_image
                )

    db.session.add(tag)
    db.session.commit()

    return tag



def add_media_to_db(tag_id,media_url,media_type):
    """Update database with new media info for tag.
    One tag may have multiple media files"""

    media = Media(tag_id=tag_id,
                  media_url=media_url,
                  media_type=media_type)

    db.session.add(media)
    db.session.commit()


def add_genres_to_db(tag_id, genres):
    """Update database with genre information.
    One tag may have mulitple genres."""

    for genre in genres[:-1]:
        tag_genre = TagGenre(tag_id=tag_id, genre=genre)
        db.session.add(tag_genre)
    db.session.commit()



if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run()