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

    directionsDisplay.setMap(map);

    // eventually, attach this marker to the user's current location
    // var marker = new google.maps.Marker({
    //     position: {lat: 37.788780, lng: -122.411885},
    //     map: map,
    //     icon: '/static/point.png'
    // });


    $('#submit').click(function() {
        // on directions search submission, find and display the path
        calcAndDisplayRoute(directionsService, directionsDisplay);

        // also request and add markers for tags along path (bbox function and query happening in Flask route)
        $.post('/tags.json', {
            'origin': document.getElementById('origin').value,
            'destination': document.getElementById('destination').value
          }, 
          function(tags) {
            var tag, marker, html;
            for (var key in tags) {
                tag = tags[key];

                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(tag.latitude, tag.longitude),
                    map: map,
                    title: tag.title,
                    icon: '/static/point3.png',
                    opacity: 0.6
                });

                html = (
                    // '<img src=tag.imageUrl alt="tag" style="width:150px;" class="thumbnail">' + 
                    '<p><b>Title: </b>' + tag.title +'</p>' +
                    '<div id="tagId" style="visibility: hidden">' + tag.landmarkId + '</div>' +
                    '<p><b>Details: </b>' + tag.details + '</p>' +
                    '<p><b>Comments: </b>' + 
                    '<br>Enter a comment: <input type="text" id="user-comment">' +
                    '<input type="submit" value="Post" id="submit-comment">' +
                    // '<input type="hidden" value="tag.landmarkId" id="tagId">' +
                    '<div id="user-comment-update"></div>' +
                    tag.comments + 'placeholder comments</p>');

                // this will bind the marker to the html containing info about the tag (which will appear in the sidebar on click)
                bindInfo(marker, html);
            }
        })


// PROBLEM SPOT ########################
      // $('#submit-comment').click(function(){
      //   console.log('this worked');
      // // post comment info to json route, update db, send relevant jsonified stuff back to be rendered in the html
      //   $.post('/add-comment.json', {
      //     'comment': document.getElementById('user-comment'), 
      //     'landmarkId': tag.tagId // tag is not defined. how do I pass the tag id into the flask route?
      //   },
      //     function(newComment){

      //       var htmlComment = ('<p>' + newComment.content + newComment.username + newComment.loggedAt + '</p>');
      //       // update comments w user comment
      //       $('#user-comment-update').html(htmlComment);
      //     });
      // });
// #######################################
    });



// add if clause in function to handle no image? (would need to divide up divs)
    function bindInfo(marker, html){
        google.maps.event.addListener(marker, 'click', function() {
            $('#tag-info').html(html);

            $('#submit-comment').click(function(){
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
            });

        });
    }


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

