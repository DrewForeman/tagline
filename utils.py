""" Helper functions for Flask server file. """


import boto3

from flask import Flask, Response, render_template, redirect, request, flash, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

from model import Tag, User, Comment, Media, Genre, TagGenre, UserGenre, connect_to_db, db

from route import api_key, find_tags_on_route, find_route_coordinates, find_bounding_box, query_tags



# def toggle_login(user_id):
#     """Check to see if user is in session to display login or name in navbar."""

#     if user_id:
#         user = User.query.filter_by(user_id = user_id).first()
#         name = user.name
#     else:
#         name = False

#     return name

def toggle_login(user_id):
    """Check to see if user is in session to display login or name in navbar."""

    if user_id:
        user = User.query.filter_by(user_id = user_id).first()
        # name = user.name
    else:
        user = False

    return user



def find_tags_for_user(user_id, query_results):
    """If logged in, return tags that match user preferences. 
    Else return all tags for location."""

    # if user_id:
    #     user_genres = UserGenre.query.filter(UserGenre.user_id == user_id).all() 
    #     genres_list = [user_genre.genre for user_genre in user_genres] 

    #     tags = [tag for tag in query_results if (set([genre.genre for genre in tag.genres]) & set(genres_list))]

    # else:
    #     tags = query_results
    tags = query_results

    return map_tag_details(tags)



def process_user_comment(tag_id, user_id, content):
    """If user logged in, add comment to db and return new comment. 
    Else, retun message to login."""

    if user_id:

        comment = add_comment_to_db(tag_id, user_id, content)

        newComment = {
            "tagId": comment.tag.tag_id,
            "username": comment.user.username,
            "avatar":comment.user.avatar,
            "content": comment.content,
            "time": comment.logged_at.strftime("%b %d %Y")
        }
        return newComment
    else:
        newComment = {"comment": "Not logged in."}
        return newComment



def process_login(user, password):
    """Log user in if registered and input password is correct"""
    if user:
        if password == user.password:
            session['user'] = user.user_id
            return {"name": user.name}
        else:
            return {"name": "not recognized"}
    else:
        return {"name": "not recognized"}



def register_user(name, username, password, genres, avatar):

    new_user = User(name=name, username=username, password=password, avatar=avatar)

    db.session.add(new_user)
    db.session.commit()

    session['user'] = new_user.user_id

    for genre in genres:
        user_genre = UserGenre(user_id=new_user.user_id, genre=genre)
        db.session.add(user_genre)
    db.session.commit()



##################### HELPER FUNCTIONS FOR HELPER FUNCTIONS #############################


def map_tag_details(queried_tags):
    """Create dictionary of tag info to pass to client as json"""

    tags = {
        tag.tag_id: {
        "tagId": tag.tag_id,
        "latitude": tag.latitude,
        "longitude": tag.longitude,
        "title": tag.title,
        "excerpt": ' '.join(tag.details.split()[:12]) + '...',
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


def get_signed_post():

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
    return post_info


def add_tag_to_db(latitude,longitude,title,artist,details,primary_image):
    """Update database with new tag"""

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

