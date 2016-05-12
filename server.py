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


@app.route('/tags.json', methods=["GET", "POST"])
def tags():
    """JSON information about the tags for given query."""
    
    # HOW DO I GET THE INFO FROM THE HTML?
    origin = request.form.get('origin')
    destination = request.form.get('destination')

    print "made it to json route"


    tags = {
        tag.landmark_id: {
        "tagId": tag.landmark_id,
        "latitude": tag.latitude,
        "longitude": tag.longitude,
        "title": tag.title,
        "artist": tag.artist,
        "details": tag.details,
        "imageUrl": tag.image_url
        }
        for tag in find_landmarks(origin, destination)
    }

    return jsonify(tags)



# @app.route('/tags', methods=["POST"])
# def show_route_landmarks():
#     """Shows points of interest along user's searched route."""

#     origin = request.form.get('origin')
#     destination = request.form.get('destination')

#     route_landmarks = find_landmarks(origin, destination)

#     return render_template("route.html", route_landmarks=route_landmarks)



# @app.route('/route/<int:landmark_id>')
# def landmark_details(landmark_id):
#     """Show detailed information for selected landmark."""

#     landmark = Landmark.query.filter_by(landmark_id=landmark_id).first()

#     return render_template("landmark_info.html", landmark=landmark)



# @app.route('/login')
# def login():
#     """Show login form for user. Redirect if not yet registered."""

#     return render_template("login.html")



# @app.route('/handle-login', methods=["POST"])
# def handle_login():
#     """Log user in and redirect back to homepage."""

#     username = request.form.get('username')
#     password = request.form.get('password')

#     user = User.query.filter(User.username == username).first()

#     if user:
#         if password == user.password:
#             session['user'] = user.user_id
#             flash(("Welcome {}").format(user.username))
#             return redirect('/')
#         else:
#             flash("Password is incorrect.")
#             return redirect('/login')
#     else:
#         flash("Unknown username. Register to get started.")
#         return redirect('/register')



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



# @app.route('/handle-comment', methods=["POST"])
# def handle_comment():
#     """Add user's comment to db and update current page if user is logged in.
#     If not logged in, flash notification to log in."""

#     content = request.form.get('comment')
#     landmark_id = request.form.get('landmark_id')

#     user_id = session.get('user')

#     if user_id:
#         comment = Comment(landmark_id=landmark_id,
#                           user_id=user_id,
#                           content=content)
#         db.session.add(comment)
#         db.session.commit()
#         return redirect('/route/' + landmark_id)
#     else:
#         flash("Must be logged in to leave a comment.")
#         return redirect('/route/' + landmark_id)


# FIX THIS ROUTE TO HANDLE NEW TAG

# @app.route('/handle-add-tag', methods=["POST"])
# def handle_add_tag():
#     """Add user's new tag to db and route to new tag page."""


#     # figure out how to get lat/lon from map on form page
#     latitude = 
#     longitude = 

#     title = request.form.get('title')
#     aritst = request.form.get('artist')
#     details = request.form.get('details')
#     image_url = request.form.get('image_url')

#     landmark = Landmark(latitude=latitude,
#                         longitude=longitude,
#                         title=title,
#                         artist=artist,
#                         details=details,
#                         image_url=image_url
#                         )

#     db.session.add(landmark)

#     # also update new db table for user created places w user_id, landmark_id, logged_at

#     db.session.commit()
#     return redirect('/route/' + landmark.landmark_id)



if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run()