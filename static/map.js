var map;

var markersArray = [];



  function initMap() {

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions:{strokeColor:'#FFFFFF', strokeOpacity: 1.0, strokeWeight: 5}
    });

    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
        // center: {lat: 37.7749, lng: -122.4194},
        zoom: 16,
        scrollwheel: true,
        zoomControl: true,
        panControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        styles: MAPSTYLES,
        mapTypeId: google.maps.MapTypeId.ROADS
    });

    directionsDisplay.setMap(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude);

            var geolocationMarker = new google.maps.Marker({
              map: map,
              position: pos,
              icon: '/static/point3.png'
            });

            map.setCenter(pos);

            google.maps.event.addListener(geolocationMarker, 'click', function(event){
              clearClickMarker();
              geolocationMarker.setIcon('/static/add-icon.png');
              $('#tag-info').html(newTagHTML);
              addTagOnSubmit(position.coords.latitude, position.coords.latitude);
            })

            google.maps.event.addListener(map, 'click', function(event){
              geolocationMarker.setIcon('/static/point3.png');
            })

        }, function () {
            handleNoGeolocation(true);
        });

         
// v|v|v|v|v|v|v|v| SHOW NEARBY POINTS UPON LOAD v|v|v|v|v|v|v|v|v|v|v|v|
        google.maps.event.addListenerOnce(map, 'idle', function(){
          // delay this function so the map has time to load before getting bounds
          setTimeout(function(){
              minLat = map.getBounds().H['H'];
              minLng = map.getBounds().j['j'];
              maxLat = map.getBounds().H['j'];
              maxLng = map.getBounds().j['H'];
              
              $.post('/tags-geolocation.json', {
                  'minLat': minLat,
                  'minLng': minLng,
                  'maxLat': maxLat,
                  'maxLng': maxLng,
                }, function(nearby_tags) {assignMarkers(nearby_tags);
              });
          },3000);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }


// v|v|v|v|v|v|v|v| ALLOW ADD NEW TAG FUNCTIONALITY ON MAP CLICK v|v|v|v|v|v|v|v|v|v|v|v|
    google.maps.event.addListener(map, 'click', function(event) {

      clearClickMarker();

      var clickLat = event.latLng.lat();
      var clickLng = event.latLng.lng();

      var newMarker = new google.maps.Marker({
          position: new google.maps.LatLng(clickLat,clickLng), 
          map: map,
          icon: '/static/add-icon.png'
      });

      markersArray.push(newMarker);

      $('#tag-info').html(newTagHTML);

      addTagOnSubmit(clickLat, clickLng);

      // clear add marker if clicked again (basically click on-click off)
      google.maps.event.addListener(newMarker, 'click', function(event){
      clearClickMarker();
      $('#tag-info').html("");
    })

    });


// v|v|v|v|v|v|v|v| CALCULATE ROUTE AND DISPLAY TAGS ON PATH v|v|v|v|v|v|v|v|v|v|v|v|
    $('#get-route').click(function() {

        clearClickMarker()
        // on directions search submission, find and display the path
        calcAndDisplayRoute(directionsService, directionsDisplay);

        $.post('/tags.json', {
            'origin': document.getElementById('origin').value,
            'destination': document.getElementById('destination').value
          }, 
          function(tags) {assignMarkers(tags);
        });

    });


// v|v|v|v|v|v|v|v| CREATE THE MAP WHEN THE PAGE LOADS v|v|v|v|v|v|v|v|v|v|v|v|

google.maps.event.addDomListener(window, 'load', function() {
  console.log(map.getBounds());
});
  }



// v|v|v|v|v|v|v|v|v|v|v|v|v| HELPER FUNCTIONS v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|
// v|v|v|v|v|v|v|v|v|v|v|v|v| HELPER FUNCTIONS v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|
// v|v|v|v|v|v|v|v|v|v|v|v|v| HELPER FUNCTIONS v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|


/** If no geolocation, sets default map center and raises error flag. */
function handleNoGeolocation(errorFlag) {
    var content;

    if (errorFlag) {
        content = "Error: The Geolocation service failed.";
    } else {
        content = "Error: Your browser doesn't support geolocation.";
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(37.7749, -122.4194),
        content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}


/** Provides toggle on-off capability for new tag markers. */
function clearClickMarker() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}


/** Creates tag markers and attaches db queried info. */
function assignMarkers(tags){

                  var tag, marker, htmlInfo;
                  for (var key in tags) {
                      tag = tags[key];

                      marker = new google.maps.Marker({
                          position: new google.maps.LatLng(tag.latitude, tag.longitude),
                          map: map,
                          title: tag.title,
                          icon: '/static/circle.png',
                          opacity: 0.6
                      });

                      // commentInf = zip(tag.comments, tag.usernames, tag.times)

                      htmlInfo = (
                          // '<img src=tag.imageUrl alt="tag" style="width:150px;" class="thumbnail">' + 
                          '<p><b>Title: </b>' + tag.title +'</p>' + 
                          '<div id="tagId" style="display:none">' + tag.landmarkId + '</div>' +
                          '<div id="allComments" style="display:none">' + tag.comments + '</div>' +
                          '<div id="commentUsernames" style="display:none">' + tag.usernames + '</div>' +
                          '<div id="commentTimes" style="display:none">' + tag.times + '</div>' +
                          '<p><b>Details: </b>' + tag.details + '</p>' +
                          '<br>Enter a comment: <input type="text" id="user-comment">' +
                          '<input type="submit" value="Post" id="submit-comment">' +
                          '<div id="user-comment-update"></div>' +
                          '<div id="commentsField"></div>' + '</p>'
                          );

                      // this will bind the marker to the html containing info about the tag (which will appear in the sidebar on click)
                      bindInfo(marker, htmlInfo);
                  }
              }


/** Defines marker click event listener and lists comments. */
function bindInfo(marker, htmlInfo){
        google.maps.event.addListener(marker, 'click', function() {

            clearClickMarker()

            $('#tag-info').html(htmlInfo);

            var commentsField = $('#commentsField');
            var allComments = $('#allComments').html().split(',');
            var commentUsernames = $('#commentUsernames').html().split(',');
            var commentTimes = $('#commentTimes').html().split(',');


            for (var i = (allComments.length - 1); i >= 0; i--) {
              commentsField.append('<div class="comment"><b>' + commentUsernames[i] + '</b> ' + commentTimes[i] + 
                                   '</div><div class="comment-content">' + allComments[i] + '</div></div>');
            }

            $('#submit-comment').click(function(){ submitComment();});

        });
    }


/** Adds new user comment to db and updates comment list on page
New comment disappears if unclicked, unless new search is made. Need to fix this. */
function submitComment () {
  console.log('comment added to db');

  $.post('/add-comment.json', {
    'comment': document.getElementById('user-comment').value, 
    'landmarkId': document.getElementById('tagId').innerHTML
  },
    function(newComment){

      var htmlComment = ('<p><div class="comment-poster"><b>' + newComment.username + '</b> ' + newComment.loggedAt + 
                         '</div><div class="comment-content">' + newComment.content + '</div>');
      $('#user-comment-update').html(htmlComment);
    });
}


/** Uses Google's directions service to display user input route. */
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


/** Adds new tag to db on submission and displays on page. */
function addTagOnSubmit(lat, lng){
  $('#submit-tag').click(function(){
          console.log('clicked submit button');
          markersArray[0].setIcon('/static/circle.png');

          $.post('/new-tag.json',{
                                'latitude': lat,
                                'longitude': lng,
                                'title': $('#add-title').val(),
                                'artist': $('#add-artist').val(),
                                'details': $('#add-details').val(),
                                'image_url': $('#add-image-url').val()
                                },function(newTag){ 
                                  newTagInfoHTML = (                 
                                                    // '<img src=tag.imageUrl alt="tag" style="width:150px;" class="thumbnail">' + 
                                                  '<p><b>Title: </b>' + newTag.title +'</p>' + 
                                                  '<div id="tagId" style="display:none">' + newTag.landmarkId + '</div>' +
                                                  // '<div id="allComments" style="display:none">' + newTag.comments + '</div>' +
                                                  '<p><b>Details: </b>' + newTag.details + '</p>' +
                                                  '<br>Enter a comment: <input type="text" id="user-comment">' +
                                                  '<input type="submit" value="Post" id="submit-comment">' +
                                                  '<div id="user-comment-update"></div>' +
                                                  '<div id="commentsField"></div>' + '</p>'
                                                  )

                                  $('#tag-info').html(newTagInfoHTML);
                                  console.log('new tag added to db')

                                  $('#submit-comment').click(function(){ 
                                    submitComment();
                                  });

                                })
        });
}


newTagHTML = (  
        '<b>Add a new tag</b><br>' +  
        '<input type="text", name="title", placeholder="Title" id="add-title"/><br>' +
        '<input type="text", name="artist", placeholder="Artist" id="add-artist"/><br>' +
        '<textarea name="details", cols="35", rows="5", placeholder="Details" id="add-details"/><br>' +
        '<input type="text", name="image_url", placeholder="Image" id="add-image-url"/><br>' +
        '<input type="submit" value="Tag it" id="submit-tag"/>'
        );

// ###### REEXAMINE POTENTIAL USE FOR THIS FUNCTION
// function zip(arrays) {
//     return arrays[0].map(function(_,i){
//         return arrays.map(function(array){return array[i]})
//     });
// }




google.maps.event.addDomListener(window, 'load', function(){
  initMap();
});


