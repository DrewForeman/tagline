var map;

var newMarkersArray = [];

var allMarkersArray = [];

var tagList;


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
            icon: '/static/marker-pink.png'
          });

          map.setCenter(pos);

          google.maps.event.addListener(geolocationMarker, 'click', function(event){
            clearClickMarker();
            geolocationMarker.setIcon('/static/add-icon.png');
            $('#tag-info-box').html(newTagHTML);
            addTagOnSubmit(position.coords.latitude, position.coords.latitude);
          })

          google.maps.event.addListener(map, 'click', function(event){
            geolocationMarker.setIcon('/static/marker-pink.png');
          })

      }, function () {
          handleNoGeolocation(true);
      });

       
      // v|v|v|v|v|v|v|v| SHOW NEARBY POINTS UPON LOAD v|v|v|v|v|v|v|v|v|v|v|v|
      google.maps.event.addListenerOnce(map, 'idle', function(){
        // delay this function so the map has time to load before getting bounds
        // shorten timeout but run again if still null after timeout. maybe want to change this into a named function. also define var for getbounds
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
              }, function(nearby_tags) {
                assignMarkers(nearby_tags);
                tagList = updateTagInfoList(nearby_tags);
                // $('#tag-info').html('<ul class="list-group">'+ tagList + '</ul>');
                $('#tag-info-box').html('<div class="media">'+ tagList + '</div>');

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

    newMarkersArray.push(newMarker);

    $('#tag-info-box').html(newTagHTML);

    $('input[type="file"]').change(function(){
          var file = this.files[0];
          getSignedRequest(file);
    });

    addTagOnSubmit(clickLat, clickLng);

    // clear add marker if clicked again (basically click on-click off)
    google.maps.event.addListener(newMarker, 'click', function(event){
      clearClickMarker();
      $('#tag-info-box').html('<div class="media">'+ tagList + '</div>');
    })
  });


// v|v|v|v|v|v|v|v| CALCULATE ROUTE AND DISPLAY TAGS ON PATH v|v|v|v|v|v|v|v|v|v|v|v|
  $('#get-route').click(function() {
      clearClickMarker();
      clearMarkers();
      // on directions search submission, find and display the path
      calcAndDisplayRoute(directionsService, directionsDisplay);

      $.post('/tags.json', {
          'origin': document.getElementById('origin').value,
          'destination': document.getElementById('destination').value
        }, 
        function(tags) { 
          assignMarkers(tags);
          tagList = updateTagInfoList(tags);
          $('#tag-info-box').html('<ul class="list-group">'+ tagList + '</ul>');
      });
  });

}

// v|v|v|v|v|v|v|v| CREATE THE MAP WHEN THE PAGE LOADS v|v|v|v|v|v|v|v|v|v|v|v|

google.maps.event.addDomListener(window, 'load', function(){
  initMap();
});









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

                      allMarkersArray.push(marker)

                      commentsHTML = createCommentsList(tag.comments)

                      htmlInfo = '<h4><b>' + tag.title +'</b></h4>'

                      media = tag.media

                      if (media[0]) {
                        var mediaObject;
                        for (var i = 0; i < media.length; i++){
                          mediaObject = media[i]
                          var mediaType = (mediaObject[(Object.keys(mediaObject))[0]]['media_type']);
                          var url = (mediaObject[(Object.keys(mediaObject))[0]]['url']);
                          if (mediaType === "image"){
                            var image = '<img style="width:300px;" src="'+url+'" alt="tag-image">'
                            htmlInfo += image
                          } else if (mediaType === "audio"){
                            var audio = '<audio controls><source src="'+url+'" >Your browser does not support the audio element.</audio>'
                            htmlInfo += audio
                          } else {
                            var video = '<video width="300" controls><source src="'+url+'" ></video>'
                            htmlInfo += video
                          }
                        }
                      } 

                      htmlInfo += '<div id="tagId" style="display:none">' + tag.tagId + '</div>' +
                          '<p>' + tag.artist +'<br>'+ tag.details + '</p>' +
                          '<textarea class="form-control" cols="35", rows="2", placeholder="Enter a comment:" id="user-comment"/><br>' +
                          '<input type="button" class="btn btn-default" value="Post" id="submit-comment"><br>' +
                          '<div id="user-comment-update"></div>' +
                          '<ul class="list-group" id="commentsField">' + commentsHTML + '</ul></p>'

                      bindInfo(marker, htmlInfo);
                  }
              }


function createCommentsList(jsonComments) {

  if (jsonComments){
    var commentsHTML = ''
    var commentObject;
    for (var i = (jsonComments.length - 1); i >=0; i--){
        commentObject = jsonComments[i]
        var username = commentObject[(Object.keys(commentObject))[0]]['username']
        var date = commentObject[(Object.keys(commentObject))[0]]['time']
        var comment = commentObject[(Object.keys(commentObject))[0]]['content']
        commentsHTML += '<li class="list-group-item"><b>' + username + '</b> ' + date + 
                                     '</div><div class="comment-content">' + comment + '</div></li>'

    } return commentsHTML
  } else {
      return "Comments:"
    }
}

function updateTagInfoList(jsonTags) {
  var tagHTML = ''
  var keys = Object.keys(jsonTags)

  for (var i = 0; i <= (keys.length - 1); i++) {
      var title = jsonTags[keys[i]]['title']
      var details = jsonTags[keys[i]]['details']

      media = jsonTags[keys[i]]['media']

      if (media[0]) {
        var mediaObject;
        for (var i = 0; i < media.length; i++){
          mediaObject = media[i]
          var mediaType = (mediaObject[(Object.keys(mediaObject))[0]]['media_type']);
          var url = (mediaObject[(Object.keys(mediaObject))[0]]['url']);
          if (mediaType === "image"){
            var image = '<div class="media-left"><img class="media-object" src="'+url+'" alt="tag-image" style="width:64px;" class="thumbnail"></div>'
          } 
        }
      } else {
        var image = '<div class="media-left"><img class="media-object" src="/static/blank.png" alt="tag-image" style="width:64px;" class="thumbnail"></div>'
      }

      tagHTML += image +'<div class="media-body"><h4 class="media-heading">'+title+'</h4>'+details+'</div><br>'

    } return tagHTML
}



/** Defines marker click event listener and lists comments. */
function bindInfo(marker, htmlInfo){
        google.maps.event.addListener(marker, 'click', function() {

            clearClickMarker()

            $('#tag-info-box').html(htmlInfo);

            $('#submit-comment').click(function(){ submitComment();});

        });
    }


/** Adds new user comment to db and updates comment list on page
New comment disappears if unclicked, unless new search is made. Need to fix this. */
function submitComment () {
  console.log('comment added to db');

  $.post('/add-comment.json', {
    'comment': document.getElementById('user-comment').value, 
    'tagId': document.getElementById('tagId').innerHTML
  },
    function(newComment){

      if (newComment.comment === "Not logged in.") {
        $('#user-comment-update').html('Log in to leave a comment.')
        console.log('not logged in')
      } else {
        var htmlComment = ('<p><div class="comment-poster"><b>' + newComment.username + '</b> ' + newComment.loggedAt + 
                           '</div><div class="comment-content">' + newComment.content + '</div>');
        $('#user-comment-update').html(htmlComment);
      }
    
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
          newMarkersArray[0].setIcon('/static/circle.png');

          // genreVals = getGenreVals().split(',')
          // console.log(genreVals)

          genreVals = getGenreVals().toString()
          console.log(genreVals)

          data = {'latitude': lat,
                  'longitude': lng,
                  'title': $('#add-title').val(),
                  'artist': $('#add-artist').val(),
                  'details': $('#add-details').val(),
                  'media_url': $('#add-media-url').val(),
                  'audio_url': $('#audio_url').val(),
                  'image_url': $('#image_url').val(),
                  'video_url': $('#video_url').val(),
                  'genres': genreVals
                  }

          $.post('/new-tag.json',data,function(newTag){ 
                                  newTagInfoHTML = (                 
                                                  // '<img src=tag.mediaUrl alt="tag" style="width:150px;" class="thumbnail">' + 
                                                  '<p><b>' + newTag.title +'</b></p>' + 
                                                  '<div id="tagId" style="display:none">' + newTag.tagId + '</div>' +
                                                  '<p>' + newTag.details + '</p>' +
                                                  '<textarea class="form-control" cols="35", rows="2", placeholder="Enter a comment:" id="user-comment"/><br>' +
                                                  '<input type="submit" value="Post" id="submit-comment">' +
                                                  '<div id="user-comment-update"></div>' +
                                                  '<div id="commentsField"></div></p>'
                                                  )

                                  $('#tag-info').html(newTagInfoHTML);
                                  console.log('new tag added to db')

                                  $('#submit-comment').click(function(){ 
                                    submitComment();
                                  });

                                })
        });
}

// figure out how to make this not be hardcoded
newTagHTML = (  
        '<h4>Add a new tag</h4>' +  
        '<input type="text" class="form-control" name="title" placeholder="Title" id="add-title"/><br>' +
        '<input type="text" class="form-control" name="artist" placeholder="Artist" id="add-artist"/><br>' +
        '<textarea name="details" class="form-control" cols="35" rows="5" placeholder="Details" id="add-details"/><br>' +
        '<input type="text" class="form-control" name="media_url" placeholder="Media URL" id="add-media-url"/><br>' +
        '<span id="audioSpace"><label for="audio"><span class="btn btn-default">Add Audio</span></label><input type="file" style="visibility: hidden; position: absolute;" accept="video/*;capture=camcorder" id="audio"></span>' +
        '<span id="imageSpace"><label for="image"><span class="btn btn-default">Add Image</span></label><input type="file" style="visibility: hidden; position: absolute;" accept="image/*;capture=camcorder" id="image"></span>' +
        '<span id="videoSpace"><label for="video"><span class="btn btn-default">Add Video</span></label><input type="file" style="visibility: hidden; position: absolute;" accept="video/*;capture=camcorder" id="video"></span><br><br>' +
        '<div class="btn-group" data-toggle="buttons">' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="architecture" value="architecture">architecture</label>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="art" value="art">art</label>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="audio" value="audio">audio</label>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="curiosities" value="curiosities">curiosities</label><br>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="food" value="food">food</label>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="history" value="history">history</label>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="politics" value="politics">politics</label>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="sports" value="sports">sports</label><br>' +
          '<label class="btn btn-default"><input type="checkbox" name="genres" id="stories" value="stories">stories</label>' +
        '</div><br><br>'+
        '<input type="submit" class="btn btn-primary" value="Tag it" id="submit-tag"/>' +
        '<input type="hidden" id="image_url">' +
        '<input type="hidden" id="audio_url">' +
        '<input type="hidden" id="video_url">' 
        );


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
          $('#audioSpace').html('<audio id="audio-preview" controls><source src="'+url+'" ></audio>');
        } else if (file.type.split('/')[0] === 'image'){
          document.getElementById("image_url").value = url;
          $('#imageSpace').html('<img style="width:300px;" src="'+url+'" id="image-preview">');
        } else {
          document.getElementById("video_url").value = url;
          $('#videoSpace').html('<video width="300" id="video-preview" controls><source src="'+url+'" ></video>');
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


// use this to get the list of genres added to TagGenre and UserGenre db and 

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

// ###### REEXAMINE POTENTIAL USE FOR THIS FUNCTION
// function zip(arrays) {
//     return arrays[0].map(function(_,i){
//         return arrays.map(function(array){return array[i]})
//     });
// }







