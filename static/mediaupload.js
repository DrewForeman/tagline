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

