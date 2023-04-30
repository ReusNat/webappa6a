function likePost() {
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
  html += '<p id="status" postid="' + post.id + '"><a href="#" id="like" postid="' + post.id + '">Like</a>' + ' ' + '<a href="#" id="likes" data-bs-toggle="modal" data-bs-target="#likesModal" postid="' + post.id + '">' + post.numLikes + '</a></p>';
  html += '<div class="modal fade" id="likesModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">';
  html += '<div class="modal-dialog">';
  html += '<div class="modal-content">';
  html += '<div class="modal-header"><h1 class="modal-title fs-5" id="exampleModalLabel">Likes</h1>';
  html += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>';
  html += ' <div class="modal-body"></div>';
  html += '<div class="modal-footer">'
  html += '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';
  html += '</div></div></div></div>';
  if (post.numLikes == 0) {
    html = '<div id="post" postid="' + post.id + '">' +
           '<p id="post-text">' + post.content + '</p>';
    html += '<p id="status" postid="' + post.id + '"><a href="#" id="like" postid="' + post.id + '">Like</a>' + ' ' + '<a href="#" id="likes" postid="' + post.id + '">' + post.numLikes + '</a></p>';
  }

  post.likedBy.forEach((index) => {
    if (Number($('#curr_user').attr("value")) == index) {
      html = '<div id="post" postid="' + post.id + '">' +
             '<p id="post-text">' + post.content + '</p>';
      html += '<p id="status" postid="' + post.id + '"><a href="#" id="unlike" postid="' + post.id + '">Unlike</a>' + ' ' + '<a href="#" id="likes" data-bs-toggle="modal" data-bs-target="#likesModal" postid="' + post.id + '">' + post.numLikes + '</a></p>';
      html += '<div class="modal fade" id="likesModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">';
      html += '<div class="modal-dialog">';
      html += '<div class="modal-content">';
      html += '<div class="modal-header"><h1 class="modal-title fs-5" id="exampleModalLabel">Likes</h1>';
      html += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>';
      html += ' <div class="modal-body"></div>';
      html += '<div class="modal-footer">'
      html += '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';
      html += '</div></div></div></div>';
    }
  });
  domTarget.prepend(html);
  

  $('#likes[postid=' + post.id + ']').click(function() {
    event.preventDefault();
    $.ajax('/api/posts/' + post.id + '/likes/', {
        method: 'GET',
        dataType: 'json',
        processData: false,
        contentType: false,
        success: (likes) =>{
            let domTarget = $('.modal-body');
            likes.forEach((like) => {
                console.log(like);
                domTarget.append('<p id="likes-p">' + like + '</p><br>');
            });
            console.log(likes);
        },
        error: error
    });
  });


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
