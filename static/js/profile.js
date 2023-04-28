function likePost() {
  console.log('ok');
  let domTarget = $('#posts');
  domTarget.remove();
  let html = '<div id="posts"></div>';
  $('#content').append(html);
  $.ajax('/api/posts?profile_id=' + $('#profile_id').attr("value"), {
    method: 'GET',
    dataType: 'json',
    success: getPosts,
    error: error
  });
}
function unlikePost() {
  let domTarget = $('#posts');
  domTarget.remove();
  let html = '<div id="posts"></div>';
  $('#content').append(html);
  $.ajax('/api/posts?profile_id=' + $('#profile_id').attr("value"), {
    method: 'GET',
    dataType: 'json',
    success: getPosts,
    error: error
  });
}

function createPost(post) {
  let domTarget = $('#posts');
  let html = '<div id="post" postid="' + post.id + '">' +
             '<p id="post-text">' + post.content + '</p>';
  if ($('#profile_id').attr("value") in post.likedBy) {
    html += '<p id="status" postid="' + post.id + '"><a href="#" id="unlike" postid="' + post.id + '">Unlike</a>' + '<a href="#" id="likes" postid="' + post.id + '">' + post.numLikes + '</a></p>';
  } else {
    html += '<p id="status" postid="' + post.id + '"><a href="#" id="like" postid="' + post.id + '">Like</a>' + '<a href="#" id="likes" postid="' + post.id + '">' + post.numLikes + '</a></p>';
  }
  domTarget.prepend(html);

  $('#likes[postid=' + post.id + ']').click(function() {
    event.preventDefault();
    console.log(post.likedBy);
  });


  $('#like[postid=' + post.id + ']').click(function() {
    event.preventDefault();
      $.ajax('/api/posts/' + post.id + '/like/', {
        method: 'POST',
	dataType: 'json',
	data: post.id,
        processData: false,
        contentType: false,
        success: likePost,
        error: error
      });
  });

  $('#unlike[postid=' + post.id + ']').click(function() {
    event.preventDefault();
      $.ajax('/api/posts/' + post.id + '/unlike/', {
        method: 'POST',
	dataType: 'json',
	data: post.id,
        processData: false,
        contentType: false,
        success: unlikePost,
        error: error
      });
  });


}

function getPosts(posts) {
  posts.forEach((post) => {
    createPost(post); 
  });
}

function error() {
  console.log('error');
  console.log($('#profile_id').val());
}

$(document).ready(function() {
  $('#create-post').click(function(evt) {
    let form = $('#post-form')[0];
    let data = new FormData(form);
    evt.preventDefault();
    $.ajax('/api/posts/', {
      method: 'POST',
      processData: false,
      contentType: false,
      dataType: 'json',
      data: data,
      success: createPost,
      error: error
    });
  });

  $.ajax('/api/posts?profile_id=' + $('#profile_id').attr("value"), {
    method: 'GET',
    dataType: 'json',
    success: getPosts,
    error: error
    
  });
});
