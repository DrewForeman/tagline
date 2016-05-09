import os
import requests
import json

from planar import BoundingBox

from pprint import pprint


api_key = os.environ['GOOGLE_DIRECTIONS_API_KEY']

# origin = '1523 8th St, Oakland, CA 94607'
# destination = '1555 40th St, Emeryville, CA 94608'

def find_landmarks(origin, destination):
    """Returns list of landmarks along user's input route."""

    find_route_coordinates(origin, destination)

    route_coordinates = route_segment_coords
    find_bounding_box(route_coordinates)

    ##query function goes here



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
    

    Currently draws a rectangle around entire set of points. 
    Plan to upgrade to more sophisticated bounding box later on.
    """

    bbox = BoundingBox(route_coordinates)

    return bbox


def query_landmarks(bbox):

