function confirmPost() {
    domTarget = $('#post-confirm');
    domTarget.append('<h2>Post Created</h2>');
}

function error() {
  console.log('error');
  console.log($('#profile_id').val());
}

$(document).ready(function() {
  $('#create-post').click(function(evt) {
    console.log('button pressed');
    let form = $('#post-form')[0];
    let data = new FormData(form);
    evt.preventDefault();
    $.ajax('/api/posts/', {
      method: 'POST',
      processData: false,
      contentType: false,
      dataType: 'json',
      data: data,
      success: confirmPost,
      error: error
    });
});
