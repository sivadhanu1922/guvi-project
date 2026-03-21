$(document).ready(function () {

  if (localStorage.getItem('guvi_token')) {
    window.location.href = 'profile.html';
  }

  $('#loginBtn').click(function () {
    var identifier = $('#username').val().trim();
    var password   = $('#password').val();

    if (!identifier || !password) {
      showMsg('error', 'Please fill in all fields.');
      return;
    }

    $('#loginBtn').text('Signing in...').prop('disabled', true);

    $.ajax({
      url: 'php/login.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ identifier, password }),
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          localStorage.setItem('guvi_token',      res.token);
          localStorage.setItem('guvi_user_id',    res.user_id);
          localStorage.setItem('guvi_username',   res.username);
          localStorage.setItem('guvi_email',      res.email);
          localStorage.setItem('guvi_first_name', res.first_name);
          localStorage.setItem('guvi_last_name',  res.last_name);
          window.location.href = 'profile.html';
        } else {
          showMsg('error', res.message || 'Invalid credentials.');
          $('#loginBtn').text('Sign In').prop('disabled', false);
        }
      },
      error: function () {
        showMsg('error', 'Server error. Please try again.');
        $('#loginBtn').text('Sign In').prop('disabled', false);
      }
    });
  });

  function showMsg(type, text) {
    $('#msg').removeClass('alert-success alert-error show')
      .addClass('alert-' + (type === 'success' ? 'success' : 'error') + ' show')
      .text(text);
  }

});