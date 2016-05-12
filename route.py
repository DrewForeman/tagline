import os
import requests
import json

from planar import BoundingBox

from model import Landmark, connect_to_db

# from pprint import pprint

import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)


api_key = os.environ['GOOGLE_DIRECTIONS_API_KEY']

origin = '1523 8th St, Oakland, CA 94607'
destination = '1555 40th St, Emeryville, CA 94608'

def find_landmarks(origin, destination):
    """Returns list of landmarks along user's input route."""

    route_coordinates = find_route_coordinates(origin, destination)

    bbox = find_bounding_box(route_coordinates)

    return query_landmarks(bbox)


###### HELPER FUNCTIONS ##########################################

def find_route_coordinates(origin, destination):
    """Returns list of coordinates for segments of route path from Google Maps"""

    payload = {'origin': origin,
            'destination': destination,
            'key': api_key,
            'mode':'walking'
            }

    r = requests.get(
        "https://maps.googleapis.com/maps/api/directions/json",
        params=payload)

    directions = r.json()

    #unravel json to identify the route segments for route
    route_segments = directions['routes'][0]['legs'][0]['steps']

    #then identify the lat/long sequence for the segments
    s = 'start_location'
    e = 'end_location'

    route_segment_coords = [(segment[s]['lat'], segment[s]['lng']) for segment in route_segments] + [(segment[e]['lat'], segment[e]['lng'])]

    return route_segment_coords



def find_bounding_box(route_coordinates):
    """Returns rough bounding box for given route coordinates to help query landmarks along route.  
    

    Currently draws a rectangle around entire set of long/lat points. 
    Plan to upgrade to more sophisticated bounding box later on.
    """

    bbox = BoundingBox(route_coordinates)

    return bbox



def query_landmarks(bbox):
    """Returns list of landmark objects from database that fall within given bounding box."""

    # all_landmarks = Landmark.query.all()

    # landmarks = []

    # for landmark in all_landmarks:
    #     if bbox.contains_point((float(landmark.latitude), float(landmark.longitude))):
    #         landmarks.append(landmark)

    min_lat = bbox.min_point[0]
    min_lon = bbox.min_point[1]
    max_lat = bbox.max_point[0]
    max_lon = bbox.max_point[1]

    landmarks = Landmark.query.filter(Landmark.latitude >= min_lat, 
                                    Landmark.latitude <= max_lat,
                                    Landmark.longitude >= min_lon,
                                    Landmark.longitude <= max_lon).all()

    print len(landmarks)

    return landmarks



if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    print "Connected to DB."

















