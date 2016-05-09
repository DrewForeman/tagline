"""Flask structure for urbex website."""

import os
import requests
import json

from jinja2 import StrictUndefined

from flask import Flask, render_template, redirect, request, flash, session 
from flask_debugtoolbar import DebugToolbarExtension

from model import Landmark, connect_to_db, db

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



@app.route('/route', methods=["POST"])
def show_route_landmarks():
    """Shows points of interest along user's searched route."""

    origin = request.form.get('origin')
    destination = request.form.get('destination')

    #want this to return a list of landmark objects that will be passed to the template
    route_landmarks = find_landmarks(origin, destination)

    # boogers


    return render_template("route.html", route_landmarks=route_landmarks)


@app.route('/route/<int:landmark_id>')
def landmark_details(landmark_id):
    """Show detailed information for selected landmark."""

    #get the landmark object with that id to be passed into the info template
    landmark = Landmark.query.filter_by(landmark_id=landmark_id).first()

    return render_template("landmark_info.html", landmark=landmark)





if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run()