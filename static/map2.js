var map;

var newMarkersArray = [];

var allMarkersArray = [];

// var tagList;


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
        strokeColor:'#5cb85c',
        fillColor: '#5cb85c',
        fillOpacity: 1,
        scale: 1.2
        }

  var addTagIcon = {
        path: fontawesome.markers.PLUS_CIRCLE,
        scale: 0.5,
        fillOpacity: 0.6
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
      google.maps.event.addListenerOnce(map, 'idle', function(){
        // delay this function so the map has time to load before getting bounds
        // shorten timeout but run again if still null after timeout. maybe want to change this into a named function. also define var for getbounds
        setTimeout(function(){
          data = {
            'minLat' : map.getBounds().H['H'],
            'minLng' : map.getBounds().j['j'],
            'maxLat' : map.getBounds().H['j'],
            'maxLng' : map.getBounds().j['H'],
          }
          
          $.post('/tags-geolocation.json', data, function(nearby_tags) {
            displayTags(nearby_tags);
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

    position = new google.maps.LatLng(event.latLng.lat(),event.latLng.lng())

    var newMarker = createMarker(position, addTagIcon)

    newMarkersArray.push(newMarker);

    // $('#tag-info-box').html(addNewTagDiv);

    // add media to Amazon S3 as it is uploaded
    $('input[type="file"]').change(function(){
          var file = this.files[0];
          getSignedRequest(file);
    });

    submitTag(position.lat(),position.lng());

    // clear add marker if clicked again (basically click on-click off)
    google.maps.event.addListener(newMarker, 'click', function(event){
      clearClickMarker();
      // $('#tag-info-box').html('<div class="media">'+ tagList + '</div>');
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
      });
  });

}

// v|v|v|v|v|v|v|v| CREATE THE MAP WHEN THE PAGE LOADS v|v|v|v|v|v|v|v|v|v|v|v|

google.maps.event.addDomListener(window, 'load', function(){
  initMap();
});









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


/** Clears markers from prior query. */
function clearMarkers() {
  for (var i = 0; i < allMarkersArray.length; i++ ) {
    allMarkersArray[i].setMap(null);
  }
  allMarkersArray.length = 0;
}

/** Provides toggle on-off capability for new tag markers. */
function clearClickMarker() {
  for (var i = 0; i < newMarkersArray.length; i++ ) {
    newMarkersArray[newMarkersArray.length - 1].setMap(null);
  }
  newMarkersArray.length = 0;
}


// v|v|v|v|v|v|v HELPER FUNCTIONS AND VARIABLES TO GENERATE AND DISPLAY QUERIED TAGS v|v|v|v|v|v|v|v|v|

/** Display all markers and information for queried tags. 
Includes sidebar list of all tags + sidebar info for each indiv tag on marker click. */
function displayTags(queriedTags){
  var infoDiv = ''
  assignMarkers(queriedTags);
}


/** Create marker for each tag returned in query and bind related tag information. */
function assignMarkers(tags){

  $('#tag-div-2').html(''); //empty the divs for new tags
  $('#tag-div-3').html('');

  var count = 0;  //set up a count of the tags so it knows which page column to append to

  var tag, marker;
  for (var key in tags) {

      count++;

      tag = tags[key];

      pos = new google.maps.LatLng(tag.latitude, tag.longitude)
      marker = createMarker(pos, 
                           {path: fontawesome.markers.CIRCLE,
                            scale: 0.5,
                            strokeColor:'#0099cc',
                            strokeOpacity: 0.5,
                            fillColor: '#0099cc',
                            fillOpacity: 0.5
                           }, 
                           tag.title)

      allMarkersArray.push(marker) //need to add to array so it can be emptied upon next query

      buildTagDisplayDiv(tag)

      bindMarkerInfo(marker, infoDiv, tag, count);
  }
}


/** Create marker at given location. */
function createMarker(position, icon, title=null){
  marker = new google.maps.Marker({
                          position: position,
                          map: map,
                          title: title,
                          icon: icon
                      });
  return marker
}


/** Build div displaying all information for tag. */
function buildTagDisplayDiv(tag){
  infoDiv = ''

  createDisplayBase(tag);
  addDetailsToDiv(tag);
  addMediaToDiv(tag);
  addCommentsToDiv(tag);
}

/** Create basic image and title display that shows on load. */
function createDisplayBase(tag){
  infoDiv = '<div class="card card-inverse">';
  if (tag.primaryImage) {
    infoDiv += '<img class="card-img" src="'+tag.primaryImage+'" alt="Card image" style="width: 100%;">' +
               '<div class="card-img-overlay" style="background-color: rgba(51,51,51,0.7);" data-toggle="collapse" data-target="#'+tag.tagId+'">' +
               '<h4 class="card-title">'+tag.title+'</h4>' +
               '<p class="card-text">'+tag.excerpt+'</p>' + 
               // '<p class="card-text"><small>Last updated'+tag.recent_comment_time+'</small></p>' +
               '</div>'
  } else {
    infoDiv += '<div class="card-block" data-toggle="collapse" data-target="#'+tag.tagId+'" style="background-color: rgba(51,51,51,0.7);">' +
               '<h4 class="card-title">'+tag.title+'</h4>' +
               '<p class="card-text">'+tag.excerpt+'</p>' +
               '</div>'
  }
}


// TO DO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// fix this function so that alt media objects are inserted into the dropdown- 
// maybe thumbnails above the comments window?


/** Add tag media to div. Multiple media items are possible. */
function addMediaToDiv(tag){
  var media = tag.media;
  if (media[0]) {
    infoDiv += '<li class="list-group-item">'
    for (var i = 0; i < media.length; i++){
      for (var key in media[i]){
        mediaObject = media[i][key]
      }
      if (mediaObject.media_type === "image"){    //link not working
        infoDiv += '<a href="'+mediaObject.url+'" target="_blank">' +
                   '<img src="'+mediaObject.url+'" alt="Resized image" title="Click to view" border="2" width="64" height="64" hspace="2" /></a>'
      } 
      else if (mediaObject.media_type === "audio"){
        infoDiv += '<audio controls><source src="'+mediaObject.url+'" >Your browser does not support the audio element.</audio>'
      } else { //experiment to see how this lo
        infoDiv += '<video width="100%" controls><source src="'+mediaObject.url+'" ></video>'
      }
    } infoDiv += '</li>'
  } 
}


/** Add tag details to display div to collapse open on click. */
function addDetailsToDiv(tag) {
  infoDiv += '<div data-toggle="collapse" id="'+tag.tagId+'" class="collapse" aria-expanded="false">' +
            '<ul class="list-group list-group-flush drop-text" id="details-'+tag.tagId+'">' +
            '<li class="list-group-item"><div>'
  
  if (tag.artist){ 
      infoDiv += tag.artist + '<br><br>'
  }

  infoDiv += tag.details +'</div></li>' 
}


// TO DO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// fix this so users can leave media. 

/** Add tag comments to sidebar div ordered by date. */
function addCommentsToDiv(tag) {

  // new comment form 
  infoDiv += '<li class="list-group-item">' +
             '<div class="input-group input-group-lg">' +
             '<input type="text" class="form-control" placeholder="Say something..." aria-describedby="basic-addon1" id="new-comment-'+tag.tagId+'">' +
             '<i class="fa fa-microphone" aria-hidden="true"></i>' +
             '<i class="fa fa-picture-o" aria-hidden="true"></i>' +
             '<i class="fa fa-video-camera" aria-hidden="true"></i>' +
             '<button type="submit" class="btn btn-secondary btn-sm pull-right" style="margin-top:4px;" id="submit-comment-'+tag.tagId+'">Post</button>' +
             '</div>' +
             '</li>'

  // comments display
  var comments = tag.comments;

  if (comments){
    var commentsList = ''
    var comment, username, date, content;

    for (var i = (comments.length - 1); i >=0; i--){
      for (var key in comments[i]){
        comment = comments[i][key]
      } commentsList += '<li class="list-group-item">' +
                        '<div class="media">' +
                        '<div class="media-left">' + //something is wrong w avatar
                        '<a href="#"><img class="media-object" src="'+comment.avatar+'" alt="user-avatar"></a>' +
                        '</div>' +
                        '<div class="media-body">' +
                        '<b>'+ comment.username +'</b><span class="card-text"><small class="text-muted">  '+comment.time+'</small></span><br>' + comment.content + 
                        '</div>' +
                        '</div>' +
                        '</li>'
    } infoDiv += commentsList 
  } infoDiv += '</ul></div></div></div>'
}


/** Bind marker and related info, add to page and attach event listener to submit comments. */
function bindMarkerInfo(marker, infoDiv, tag, count){

  if (count % 2 === 0){
    $('#tag-div-3').append(infoDiv);
  } else{
    $('#tag-div-2').append(infoDiv);
  }

  function submitComment (evt) {

    var id = this.id.split('-')[2];
    var comment = $('#new-comment-'+id).val();

    $.post('/add-comment.json', 
      {'comment': comment, 'tagId': id}, 
      updateCommentsList);
  }

  function updateCommentsList(newComment){

    var tagId = newComment.tagId;

    $('#details-'+tagId+' li:eq(1)').after(
              '<li class="list-group-item">' +
              '<div class="media">' +
              '<div class="media-left">' + 
              '<a href="#"><img class="media-object" src="'+newComment.avatar+'" alt="user-avatar"></a>' +
              '</div>' +
              '<div class="media-body">' +
              '<b>'+ newComment.username +'</b><span class="card-text"><small class="text-muted">  '+newComment.time+'</small></span><br>' + newComment.content + 
              '</div>' +
              '</div>' +
              '</li>'
          );
  }

  $('.btn.btn-secondary.btn-sm.pull-right').click(submitComment);

  // on click of marker, tag display scrolls open/closed
  google.maps.event.addListener(marker, 'click', function() {
      clearClickMarker()
      $('#'+tag.tagId).collapse('toggle');
      // marker.setIcon({path: fontawesome.markers.CIRCLE,
      //                 scale: 0.5,
      //                 strokeColor:'#0099cc',
      //                 strokeOpacity: 0.5,
      //                 fillColor: '#0099cc',
      //                 fillOpacity: 1
      //                })
    });
}


// v|v|v|v|v|v|v HELPER FUNCTIONS FOR DISPLAYING ROUTE v|v|v|v|v|v|v|v|v|

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


// v|v|v|v|v|v|v|v HELPER FUNCTIONS & VARIABLES FOR ADDING TAGS v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|

/** Adds new tag to db on submission and displays on page. */
function submitTag(lat, lng){
  $('#submit-tag').click(function(){

      data = {'latitude': lat,
              'longitude': lng,
              'title': $('#add-title').val(),
              'artist': $('#add-artist').val(),
              'details': $('#add-details').val(),
              'audio_url': $('#audio_url').val(),
              'primary_image': $('#image_url').val(),
              'video_url': $('#video_url').val(),
              'genres': getGenreVals().toString()
              }

      $.post('/new-tag.json', data, function(newTag){ 
        newTagMarker = createMarker(newMarkersArray[0].position, 
                                    {path: fontawesome.markers.CIRCLE,
                                      scale: 0.5,
                                      strokeColor:'#0099cc',
                                      strokeOpacity: 0.5,
                                      fillColor: '#0099cc',
                                      fillOpacity: 0.5
                                    },  
                                    newTag.title) 
        clearClickMarker()
        buildTagDisplayDiv(newTag)
        bindMarkerInfo(newTagMarker, infoDiv)
      })
  });
}

// v|v|v|v|v|v|v|v|v|v|v|v|v| FUNCTIONS FOR ADDING MEDIA TO AMAZON S3 v|v|v|v|v|v|v|v|v|v|v|v|v|v|v|v


function uploadFile(file, s3Data, url){

  var xhr = new XMLHttpRequest();
  xhr.open("POST", s3Data.url);
  xhr.setRequestHeader('x-amz-acl', 'public-read');

  var postData = new FormData();
  for(key in s3Data.fields){
    postData.append(key, s3Data.fields[key]);
  }
  postData.append('file', file);

  xhr.onreadystatechange = function() {
    if(xhr.readyState === 4){
      if(xhr.status === 200 || xhr.status === 204){     

        if (file.type.split('/')[0] === 'audio'){
          document.getElementById("audio_url").value = url;
          $('#audioSpace').html('<audio style="width:160px; margin:8px; vertical-align: middle;" id="audio-preview" controls><source src="'+url+'" ></audio>');
        } else if (file.type.split('/')[0] === 'image'){
          document.getElementById("image_url").value = url;
          $('#imageSpace').html('<img style="max-width:150px; margin:8px;" src="'+url+'" class="img-thumbnail" id="image-preview">');
          console.log('added image')
        } else {
          document.getElementById("video_url").value = url;
          $('#videoSpace').html('<video width="150" style="margin:8px; vertical-align: middle;" id="video-preview" controls><source src="'+url+'" ></video>');
        }
      }
      else{
        alert("Could not upload file.");
      }
    }
  };
  xhr.send(postData);
}


function getSignedRequest(file){
  var fileInfo = {'file_name':file.name,'file_type':file.type}
  $.post('/sign.json', fileInfo, function(postInfo){
    uploadFile(file, postInfo.data, postInfo.url);
  })
}


// HELPER FUNCTION FOR COLLECTING GENRE PREFERENCES FROM MULI-CHECKBOX FORM

function getGenreVals() {
  var checkbox_value = "";
    $(":checkbox").each(function () {
        var ischecked = $(this).is(":checked");
        if (ischecked) {
            checkbox_value += $(this).val() + ",";
        }
    });
    return checkbox_value
  }












