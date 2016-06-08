![Tagline Logo](/static/img/line-title.png)

Tagline is a web app by Drew Foreman that enables users to explore, discuss, and leave ‘digital graffiti’ on the urban landscape. Initial content from public art data, geocached landmarks scraped from the web, and audio accessed on the Freesounds API is curated according to user preferences and displayed via Google Maps. Users add comments, images, video, personal stories, historic knowledge, etc. to create a collective map of our city and urban experience. Know the story behind that intriguing mural? Tag it. Want to share a video from last night’s concert/protest/seminar? Tag it. Found the best burrito ever? Tag it. 

Why?
We already have many great apps to help us find new urban destinations, and many apps to help us get to those destinations as quickly as possible. Tagline strives to do the opposite. Instead of making user's interaction with the city more convenient or efficient, Tagline connects our virtual presence with the physical landscape to encourage a more curious and engaged relationship with the city.


## Table of Contents
* [Technologies used](#technologiesused)
* [How it works](#how)
* [Version 2.0](#v2)
* [Author](#author)


## <a name="technologiesused"></a>Technologies Used
* Python
* JavaScript + jQuery
* PostgreSQL + SQLAlchemy
* Flask
* Jinja
* AJAX + JSON
* HTML + CSS
* Bootstrap
* Google Maps API
* AWS Boto3
* Freesounds API

## <a name="how"></a>How it works

####Geolocation
Upon opening Tagline, the user's current location is pinpointed and the geographic coordinates of the map display are posted to the server. Tagged content that is located within the geographic area and matches the user's content preferences are mapped and displayed on the page.
![Geolocation](/graphics/comment.gif)

####Exploring
Clicking on the map markers or the tag blocks toggles the html display class so that users can see details, additional media, and discussion about each tagged place. Users can explore comment, or tag something of their own.
![Exploring](/graphics/explore.gif)

####Routing
Users can enter a destination to map a route via the Google Directions API.  Using the endpoint coordinates of each route segment, multiple bounding boxes are drawn and tagged content within those bounds is queried. 

![Routing](/graphics/route.gif)

####Tagging
An event listener on the map records the user's coordinates and this button triggers a modal window to add a new tag at the click location. Users can upload media, either from the local file system or via built-in camera if on mobile.  Using Boto3, Amazon’s Python SDK, the site communicates with Amazon S3 and generates a pre signed post allowing user media to be hosted in the cloud.  The user's new tag is stored in a PostgreSQL database and the page is updated to display the user's tag.

![Tagging](/graphics/add.gif)


## <a name="v2"></a>Version 2.0

Further features would focus on using machine learning to curate content for the individual user.  Addtionally, the project could be integrated with existing social media platforms such as Instagram to tie our current digital interactions back into the physical landscape and our understanding of our environment.

## <a name="author"></a>Author
Drew Foreman is a Software Engineer in San Francisco, CA.