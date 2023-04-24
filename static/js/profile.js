function createPost(post) {
  let domTarget = $('#posts');
  let html = '<div id="post" postid="' + post.id + '">';
  html += '<p id="post-text">' + post.content + '</p>' +
	  '<button id="like" postid="' + post.id + '">Like</button>';
  domTarget.prepend(html);
}

function error() {
  console.log('error');
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

  $.ajax('/api/posts/', {
    method: 'GET',
    dataType: 'json',
    success: getPosts,
    error: error
    
  });
});
