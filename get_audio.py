""""Helper function for gathering data from Freesound API.

Redirect output to a txt file for use in seed_data.py"""


import os
import requests
import json


api_key = os.environ['FREESOUND_CLIENT_SECRET']

def get_audio():
    """gets audio for coords"""


    payload = {'filter': 'is_geotagged:1 geotag:"Intersects(-122.524682 37.729133 -122.373322 37.814785)"',
            'token': api_key,
            'fields': "name,geotag,description,previews",
            'page_size':'60'
            }


    r = requests.get(
        "http://www.freesound.org/apiv2/search/text/",
        params=payload)

    response_info = r.json()

    all_tags = response_info['results']

    for tag in all_tags:
        latitude = tag['geotag'].split()[0]
        longitude = tag['geotag'].split()[1]
        title = tag['name']
        details = tag['description'].encode('ascii','ignore')
        audio_url  = tag['previews']['preview-lq-mp3']
    
        print "{}|{}|{}|{}|{}".format(latitude, longitude, title, details, audio_url)


get_audio()



