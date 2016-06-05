var map;

var newMarkersArray = [];

var allMarkersArray = [];


function initMap() {

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions:{strokeColor:'gray', strokeOpacity: 1.0, strokeWeight: 5}
  });

  var mapDiv = document.getElementById('map');
  map = new google.maps.Map(mapDiv, {
      zoom: 16,
      scrollwheel: true,
      zoomControl: true,
      panControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      styles: MAPSTYLES,
      mapTypeId: google.maps.MapTypeId.ROADS
  });

  var currentLocIcon = {
        path: fontawesome.markers.MAP_MARKER,
        strokeColor:'#29a3a3',
        fillColor: '#29a3a3',
        fillOpacity: 1,
        scale: 1.2
        }

  var addTagIcon = {
        path: fontawesome.markers.PLUS_CIRCLE,
        scale: 0.5,
        fillOpacity: 1,
        strokeColor:'#e65c00',
        fillColor: '#e65c00'
        }


  directionsDisplay.setMap(map);

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude);

        map.setCenter(pos);

        var geolocationMarker = createMarker(pos, currentLocIcon);

        google.maps.event.addListener(geolocationMarker, 'click', function(event){
          clearClickMarker();
          geolocationMarker.setIcon(addTagIcon);
          submitTag(position.coords.latitude, position.coords.latitude);
        })

        google.maps.event.addListener(map, 'click', function(event){
          geolocationMarker.setIcon(currentLocIcon);
        })
      }, function () {
          handleNoGeolocation(true);
      });

      // v|v|v|v|v|v|v|v| SHOW NEARBY POINTS UPON LOAD v|v|v|v|v|v|v|v|v|v|v|v|
      google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
        // delay this function so the map has time to load before getting bounds
        // shorten timeout but run again if still null after timeout. 
          var data = {
            'minLat' : map.getBounds().H['H'],
            'minLng' : map.getBounds().j['j'],
            'maxLat' : map.getBounds().H['j'],
            'maxLng' : map.getBounds().j['H'],
          };
          
          $.post('/tags-geolocation.json', data, function(nearby_tags) {
            displayTags(nearby_tags);
            $('.post-button').click(submitComment);
            $('div.card-img-overlay').click(function(){
              $(this).toggleClass('hidden-overlay');
            });
          });
      });
  } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
  }



  // v|v|v|v|v|v|v|v| ALLOW ADD NEW TAG FUNCTIONALITY ON MAP CLICK v|v|v|v|v|v|v|v|v|v|v|v|
  google.maps.event.addListener(map, 'click', function(event) {

    clearClickMarker();

    position = new google.maps.LatLng(event.latLng.lat(),event.latLng.lng())

    var newMarker = createMarker(position, addTagIcon)

    newMarkersArray.push(newMarker);

    // add media to Amazon S3 as it is uploaded
    $('input[type="file"]').change(function(){
          var file = this.files[0];
          getSignedRequest(file);
    });

    submitTag(position.lat(),position.lng());

    // clear add marker if clicked again (basically click on-click off)
    google.maps.event.addListener(newMarker, 'click', function(event){
      clearClickMarker();
    })
  });


// v|v|v|v|v|v|v|v| CALCULATE ROUTE AND DISPLAY TAGS ON PATH v|v|v|v|v|v|v|v|v|v|v|v|
  $('#get-route').click(function() {
      clearClickMarker();
      clearMarkers();
      // on directions search submission, find and display the path
      calcAndDisplayRoute(directionsService, directionsDisplay);

      data = {'origin': document.getElementById('origin').value,
              'destination': document.getElementById('destination').value
             }

      $.post('/tags.json', data, function(tags) { 
          displayTags(tags);
          $('.post-button').click(submitComment);
          $('div.card-img-overlay').click(function(){
              $(this).toggleClass('hidden-overlay');
            });
      });
  });
}

// v|v|v|v|v|v|v|v| CREATE THE MAP WHEN THE PAGE LOADS v|v|v|v|v|v|v|v|v|v|v|v|

google.maps.event.addDomListener(window, 'load', function(){
  initMap();
});




