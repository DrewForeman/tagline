var markersArray = [];


  function initMap() {

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions:{strokeColor:'#ffff33', strokeOpacity: 1.0}
    });

    var mapDiv = document.getElementById('map');
    var map = new google.maps.Map(mapDiv, {
        center: {lat: 37.7749, lng: -122.4194},
        zoom: 13,
        scrollwheel: true,
        zoomControl: true,
        panControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        styles: MAPSTYLES,
        mapTypeId: google.maps.MapTypeId.ROADS
    });

    // var markersArray = [];

    directionsDisplay.setMap(map);

    // eventually, attach this marker to the user's current location
    // var marker = new google.maps.Marker({
    //     position: {lat: 37.788780, lng: -122.411885},
    //     map: map,
    //     icon: '/static/point.png'
    // });


// v|v|v|v|v|v|v|v| CODE BELOW ALLOWS USER TO ADD NEW TAG ON MAP CLICK v|v|v|v|v|v|v|v|v|v|v|v|
    google.maps.event.addListener(map, 'click', function(event) {

      clearOverlays()

      var clickLat = event.latLng.lat();
      var clickLng = event.latLng.lng();

      var newMarker = new google.maps.Marker({
          position: new google.maps.LatLng(clickLat,clickLng), 
          map: map
      });

      markersArray.push(newMarker);

      // map.setZoom(16);
      // map.setCenter(newMarker.getPosition());

      newTagHTML = (  
        '<b>Add a new tag</b><br>' +  
        'Title: <input type="text", name="title", id="add-title"/><br>' +
        'Artist:<input type="text", name="artist", id="add-artist"/><br>' +
        'Details:<textarea name="details", cols="35", rows="5", id="add-details"/><br>' +
        'Image Url:<input type="text", name="image_url", id="add-image-url"/><br>' +
        '<input type="submit" value="Tag it" id="submit-tag"/>'
        );

      $('#tag-info').html(newTagHTML);

      console.log(clickLat + "," + clickLng)

      // on submit, update db w new info, should also eventually switch sidebar to show info about new landmark
      $('#submit-tag').click(function(){
        console.log('clicked submit button');
        markersArray[0].setIcon('/static/point3.png');

        $.post('/new-tag.json',{
                              'latitude': clickLat,
                              'longitude': clickLng,
                              'title': $('#add-title').val(),
                              'artist': $('#add-artist').val(),
                              'details': $('#add-details').val(),
                              'image_url': $('#add-image-url').val()
                              },function(newTag){ 
                                newTagInfoHTML = (                 
                                                  // '<img src=tag.imageUrl alt="tag" style="width:150px;" class="thumbnail">' + 
                                                '<p><b>Title: </b>' + newTag.title +'</p>' + 
                                                '<div id="tagId" style="display:none">' + newTag.landmarkId + '</div>' +
                                                '<div id="allComments" style="display:none">' + newTag.comments + '</div>' +
                                                '<p><b>Details: </b>' + newTag.details + '</p>' +
                                                '<br>Enter a comment: <input type="text" id="user-comment">' +
                                                '<input type="submit" value="Post" id="submit-comment">' +
                                                '<div id="user-comment-update"></div>' +
                                                '<div id="commentsField"></div>' + 'placeholder comments</p>'
                                                )

                                $('#tag-info').html(newTagInfoHTML);
                                console.log('new tag added to db')


                                $('#submit-comment').click(function(){ 
                                  submitComment();
                                });

                              })
      });
    });
// ^|^|^|^|^|^|^| CODE ABOVE ALLOWS USER TO ADD NEW TAG ON MAP CLICK ^|^|^|^|^|^|^|^|


// v|v|v|v|v|v|v|v| CODE BELOW GIVES ROUTE AND TAGS ON PATH v|v|v|v|v|v|v|v|v|v|v|v|
    $('#submit').click(function() {

        clearOverlays()
        // on directions search submission, find and display the path
        calcAndDisplayRoute(directionsService, directionsDisplay);

        // also request and add markers for tags along path (bbox function and query happening in Flask route)
        $.post('/tags.json', {
            'origin': document.getElementById('origin').value,
            'destination': document.getElementById('destination').value
          }, 
          function(tags) {
            var tag, marker, htmlInfo;
            for (var key in tags) {
                tag = tags[key];

                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(tag.latitude, tag.longitude),
                    map: map,
                    title: tag.title,
                    icon: '/static/point3.png',
                    opacity: 0.6
                });

                htmlInfo = (
                    // '<img src=tag.imageUrl alt="tag" style="width:150px;" class="thumbnail">' + 
                    '<p><b>Title: </b>' + tag.title +'</p>' + 
                    '<div id="tagId" style="display:none">' + tag.landmarkId + '</div>' +
                    '<div id="allComments" style="display:none">' + tag.comments + '</div>' +
                    '<p><b>Details: </b>' + tag.details + '</p>' +
                    '<br>Enter a comment: <input type="text" id="user-comment">' +
                    '<input type="submit" value="Post" id="submit-comment">' +
                    '<div id="user-comment-update"></div>' +
                    '<div id="commentsField"></div>' + 'placeholder comments</p>'
                    );

                // this will bind the marker to the html containing info about the tag (which will appear in the sidebar on click)
                bindInfo(marker, htmlInfo);
            }
        })

    });


// add if clause in function to handle no image? (would need to divide up divs)
    function bindInfo(marker, htmlInfo){
        google.maps.event.addListener(marker, 'click', function() {
            $('#tag-info').html(htmlInfo);

            var commentsField = $('#commentsField');
            var allComments = $('#allComments').html().split(',');

            for (var i = 0; i < allComments.length; i++) {
              commentsField.append('<div class="comment">' + allComments[i] + '</div>');
            }

            $('#submit-comment').click(function(){ submitComment();});

        });
    }
// ^|^|^|^|^|^|^|^|^|^| CODE ABOVE GIVES ROUTE AND TAGS ON PATH ^|^|^|^|^|^|^|^|^|^|^|^|^|^|^|^|^|^
  }


// v|v|v|v|v|v|v|v|v|v|v|v|v| HELPER FUNCTIONS v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|


function clearOverlays() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}


function submitComment () {
  console.log('this worked');
// post comment info to json route, update db, send relevant jsonified stuff back to be rendered in the html
  $.post('/add-comment.json', {
    'comment': document.getElementById('user-comment').value, 
    'landmarkId': document.getElementById('tagId').innerHTML
  },
    function(newComment){

      var htmlComment = ('<p>' + newComment.content + newComment.username + newComment.loggedAt + '</p>');
      // update comments w user comment
      $('#user-comment-update').html(htmlComment);
    });
}


function calcAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status){
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else{ 
            window.alert('Directions request failed');
        }
    });
}

