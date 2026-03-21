$(document).ready(function () {

  $('#registerBtn').click(function () {
    const first_name = $('#first_name').val().trim();
    const last_name  = $('#last_name').val().trim();
    const username   = $('#username').val().trim();
    const email      = $('#email').val().trim();
    const password   = $('#password').val();
    const confirm    = $('#confirm_password').val();

    if (!first_name || !last_name || !username || !email || !password || !confirm) {
      showMsg('error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      showMsg('error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showMsg('error', 'Password must be at least 6 characters.');
      return;
    }

    $('#registerBtn').text('Creating...').prop('disabled', true);

    $.ajax({
      url: 'php/register.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ first_name, last_name, username, email, password }),
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          showMsg('success', 'Account created! Redirecting to login...');
          setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } else {
          showMsg('error', res.message || 'Registration failed.');
          $('#registerBtn').text('Create Account').prop('disabled', false);
        }
      },
      error: function () {
        showMsg('error', 'Server error. Please try again.');
        $('#registerBtn').text('Create Account').prop('disabled', false);
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