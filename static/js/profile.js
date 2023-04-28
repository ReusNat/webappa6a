function likePost(post) {
  let postTarget = $('#post[postid=' + post.id + ']');
  let linkTarget = $('#status[postid=' + post.id + ']');
  linkTarget.remove();

  let html = '<p id="status" postid="' + post.id + '"><a href="#" id="unlike" postid="' + post.id + '">Unlike</a> ' + post.likes + '</p>';
  postTarget.append(html);

  $('#unlike[postid=' + post.id + ']').click(function() {
    event.preventDefault();
      $.ajax('/api/posts/' + post.id + '/unlike/', {
        method: 'POST',
	dataType: 'json',
        processData: false,
        contentType: false,
        success: unlikePost,
        error: error
      });
  });
}

function unlikePost(post) {
  let postTarget = $('#post[postid=' + post.id + ']');
  let linkTarget = $('#status[postid=' + post.id + ']');
  linkTarget.remove();

  let html = '<p id="status" postid="' + post.id + '"><a href="#" id="like" postid="' + post.id + '">Like</a> ' + post.likes + '</p>';
  postTarget.append(html);

  $('#like[postid=' + post.id + ']').click(function() {
    event.preventDefault();
      $.ajax('/api/posts/' + post.id + '/like/', {
        method: 'POST',
	dataType: 'json',
        processData: false,
        contentType: false,
        success: likePost,
        error: error
      });
  });
}

function createPost(post) {
  let domTarget = $('#posts');
  let html = '<div id="post" postid="' + post.id + '">' +
             '<p id="post-text">' + post.content + '</p>';
  html += '<p id="status" postid="' + post.id + '"><a href="#" id="like" postid="' + post.id + '">Like</a> ' + post.likes + '</p>';
  domTarget.prepend(html);


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

  $.ajax('/api/posts?profile_id=' + $('#profile_id').attr("value") , {
    method: 'GET',
    dataType: 'json',
    success: getPosts,
    error: error
    
  });
});
