
// v|v|v|v|v|v|v HELPER FUNCTIONS AND VARIABLES TO GENERATE AND DISPLAY QUERIED TAGS v|v|v|v|v|v|v|v|v|

/** Display all markers and information for queried tags. 
Includes sidebar list of all tags + sidebar info for each indiv tag on marker click. */
function displayTags(queriedTags){
  var infoDiv = ''
  assignMarkers(queriedTags);
}


/** Create marker for each tag returned in query and bind related tag information. */
function assignMarkers(tags){

  //empty the divs for new tags
  $('#tag-div-1').html(
                  '<div class="card card-inverse" style="background-color: #333; border-color: #333;">' +
                  '<div class="card-block">' +
                  '<p class="card-title" style="font-family:BlowBrush; font-size:100px; line-height: 78%; letter-spacing: 2px;" >TAg some-<br>thing:</p>' +
                  '<p class="card-text">Share your thoughts, stories, knowledge. Make your mark on the city.</p>' +
                  '<p class="subtext small-text">Add your location to the map and...</p>' +
                  '<button class="btn btn-success-outline" style="color: white;" data-toggle="modal" data-target="#myModal">Tag it!</button>' +
                  '</div>' +
                  '</div>'
                  ); 
  $('#tag-div-2').html(''); 
  $('#tag-div-3').html('');

  var counter = 0;  //set up a count of the tags so it knows to which page column to append the tag div

  var tag, marker;
  for (var key in tags) {

      counter++;
      if (counter > 3) {
        counter = 1;
      }

      tag = tags[key];

      pos = new google.maps.LatLng(tag.latitude, tag.longitude)
      marker = createMarker(pos, 
                           {path: fontawesome.markers.CIRCLE,
                            scale: 0.5,
                            strokeColor:'black',
                            strokeOpacity: 0.5,
                            fillColor: 'black',
                            fillOpacity: 0.5
                           }, 
                           tag.title)

      allMarkersArray.push(marker) //need to add to array so it can be emptied upon next query

      buildTagDisplayDiv(tag)

      bindMarkerInfo(marker, infoDiv, tag, counter);
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
               '<div class="card-img-overlay" style="background-color: rgba(51,51,51,0.4);" data-toggle="collapse" data-target="#'+tag.tagId+'" id="img-toggle-'+tag.tagId+'">' +
               // '<div class="card-img-overlay" style="background-color: rgba(255,255,255,0.4);" data-toggle="collapse" data-target="#'+tag.tagId+'" id="img-toggle-'+tag.tagId+'">' +
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
                   '<img src="'+mediaObject.url+'" alt="img-thumbnail" title="Click to view" border="2" width="64" height="64" hspace="2" /></a>'
      } 
      else if (mediaObject.media_type === "audio"){
        infoDiv += '<audio style="width:100%; vertical-align: middle;" controls><source src="'+mediaObject.url+'">Your browser does not support the audio element.</audio>'
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
            '<li class="list-group-item"><div><h5>'+tag.title+'</h5>'
  
  if (tag.artist){ 
      infoDiv += tag.artist + '<br><br>'
  }

  infoDiv += tag.details +'</div></li>' 
}


// TO DO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// fix this so users can leave media as well

/** Add tag comments to div ordered by date. */
function addCommentsToDiv(tag) {

  // new comment form 
  infoDiv += '<li class="list-group-item" id="add-comment-'+tag.tagId+'">' +
             '<form class="form input-group input-group-lg" id="comment-form-'+tag.tagId+'">' +
             '<input type="text" class="form-control" placeholder="Say something..." aria-describedby="basic-addon1" id="new-comment-'+tag.tagId+'">' +
             // '<input type="file" id="file-'+tag.tagId+'" accept="image/*" >' +
             '<i class="fa fa-microphone" aria-hidden="true"></i>' +
             '<i class="fa fa-picture-o" aria-hidden="true"></i>' +
             '<i class="fa fa-video-camera" aria-hidden="true"></i>' +
             '<button type="button" class="btn btn-secondary btn-sm pull-right post-button" style="margin-top:4px;" id="submit-comment-'+tag.tagId+'">' +
             'Post</button>' +
             '</form>' +
             '</li>' +
             '</ul>'

  // comments display
  var comments = tag.comments;

  if (comments){
    var commentsList = '<ul class="list-group list-group-flush drop-text" id="all-comments-'+tag.tagId+'" style="overflow-y: scroll; max-height:350px;">'
    var comment, username, date, content;

    for (var i = (comments.length - 1); i >=0; i--){
      for (var key in comments[i]){
        comment = comments[i][key]
      } commentsList += '<li class="list-group-item comment-list">' +
                        '<div class="media">' +
                        '<div class="media-left">' + 
                        // '<a href="#"><img class="media-object" src="'+comment.avatar+'" alt="user-avatar"></a>' +
                        '</div>' +
                        '<div class="media-body">' +
                        // '<b>'+ comment.username +'</b><span class="card-text"><small class="text-muted">  '+comment.time+
                        comment.username +'<span class="card-text"><small class="text-muted">  '+comment.time+
                        '</small></span><br><span class="small-text">'+comment.content+'</span>' + 
                        '</div>' +
                        '</div>' +
                        '</li>'
    } infoDiv += commentsList 
  } infoDiv += '</ul></div></div></div>'
}


/** Bind marker and related info, add to page and attach event listener to submit comments. */
function bindMarkerInfo(marker, infoDiv, tag, counter){
  
  if (counter === 0){
    $('#tag-div-2').prepend(infoDiv);
  } else if (counter === 1){
    $('#tag-div-2').append(infoDiv);
  } else if (counter === 2){
    $('#tag-div-3').append(infoDiv);
  } else {
    $('#tag-div-1').append(infoDiv);
  }

  // on click of marker, tag display scrolls open/closed
  google.maps.event.addListener(marker, 'click', function() {
      clearClickMarker()
      $('#'+tag.tagId).collapse('toggle');
      $('#img-toggle-'+tag.tagId).toggleClass('hidden-overlay');

      // marker.setIcon({path: fontawesome.markers.CIRCLE,    
      //                 scale: 0.5,
      //                 strokeColor:'#0099cc',
      //                 strokeOpacity: 0.5,
      //                 fillColor: '#0099cc',
      //                 fillOpacity: 1
      //                })
    });
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

  $('#all-comments-'+tagId).prepend(
            '<li class="list-group-item">' +
            '<div class="media">' +
            '<div class="media-left">' + 
            // '<a href="#"><img class="media-object" src="'+newComment.avatar+'" alt="user-avatar"></a>' +
            '</div>' +
            '<div class="media-body">' +
            '<b>'+ newComment.username +'</b><span class="card-text"><small class="text-muted">  '+
            newComment.time+'</small></span><br><span class="small-text">'+newComment.content+'</span>' + 
            '</div>' +
            '</div>' +
            '</li>'
        );
  // console.log($('#comment-form-'+tagId)[0])
  $('#comment-form-'+tagId)[0].reset(); 
}


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
                                      strokeColor:'#e65c00',
                                      strokeOpacity: 0.5,
                                      fillColor: '#e65c00',
                                      fillOpacity: 0.5
                                    },  
                                    newTag.title) 
        clearClickMarker()
        buildTagDisplayDiv(newTag)
        bindMarkerInfo(newTagMarker, infoDiv, newTag, 0)
        $('#add-tag-form')[0].reset();
        $('#myModal').modal('hide');
        $('.genre').removeClass('active');
      })
  });
}



