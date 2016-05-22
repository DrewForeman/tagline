""""Helper function for scraping Landmark data from Waymarking.com

Redirect output to a txt file for use in seed_data"""


import os
import requests


from bs4 import BeautifulSoup as bs
import lxml



# url = "http://www.waymarking.com/cat/details.aspx?f=1&guid=415fa40f-0783-4cab-acad-d2381bd86ffd&lat=37.77493&lon=-122.419416&t=3&id=san%20francisco%20ca&r=10&st=2"

url = 'http://www.waymarking.com/cat/details.aspx?f=1&guid=415fa40f-0783-4cab-acad-d2381bd86ffd&lat=37.77493&lon=-122.419416&t=3&id=san%20francisco%20ca&wo=True&p=2&r=10&sg=7c00b348-6495-47b0-9cd9-9b636341b279&st=2'


def scrape_waymarks(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36'}

    response = requests.get(url, headers= headers)
    soup = bs(response.text, "lxml")

    links = soup.select('.wmd_namebold > a')
    links = links[1::2]
    links = [link['href'] for link in links]

    for link in links:
        response = requests.get(link, headers= headers)
        soup = bs(response.text, "lxml")

        # Do some messy parsing and decoding to extract coordinates and other landmark details
        coords = soup.select('#wm_coordinates')[0].get_text().encode('ascii','ignore').replace('.','').split()

        latitude = float('.'.join([coords[1], coords[2]]))
        longitude = -(float('.'.join([coords[4], coords[5]])))

        title = soup.select('#wm_name')[0].get_text().split(' - ')[0].encode('ascii', 'replace').strip()
        artist = soup.select('#Table1')[0].get_text('|', strip=True).split('|')[5]
        # details = soup.select('#Table1')[0].get_text('|', strip=True).split('|')[7]
        details = soup.select('#wm_quickdesc')[0].get_text().split(': ')[1]
        image_url = soup.select('.wm_photo > a > img')[0]['src']

        print "{}|{}|{}|{}|{}|{}".format(latitude, longitude, title, artist, details, image_url)


scrape_waymarks(url)

