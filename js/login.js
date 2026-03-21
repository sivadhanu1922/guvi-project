$(document).ready(function () {

  // Redirect if already logged in
  if (localStorage.getItem('guvi_token')) {
    window.location.href = 'profile.html';
  }

  $('#loginBtn').click(function () {
    const identifier = $('#username').val().trim();
    const password   = $('#password').val();

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
          // Store only the token — everything else comes from DB
          localStorage.setItem('guvi_token', res.token);
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
    $('#msg')
      .removeClass('alert-success alert-error show')
      .addClass('alert-' + (type === 'success' ? 'success' : 'error') + ' show')
      .text(text);
  }

});