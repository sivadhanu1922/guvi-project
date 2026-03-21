$(document).ready(function () {

  var token      = localStorage.getItem('guvi_token');
  var user_id    = localStorage.getItem('guvi_user_id');
  var firstName  = localStorage.getItem('guvi_first_name') || '';
  var lastName   = localStorage.getItem('guvi_last_name')  || '';
  var username   = localStorage.getItem('guvi_username')   || '';
  var email      = localStorage.getItem('guvi_email')      || '';

  if (!token || !user_id) {
    window.location.href = 'login.html';
    return;
  }

  // Fill sidebar
  $('#navGreet').text('Hello, ' + firstName);
  $('#sidebarName').text(firstName + ' ' + lastName);
  $('#sidebarUsername').text('@' + username);
  $('#sidebarEmail').text(email);
  $('#avatarInitials').text((firstName.charAt(0) + lastName.charAt(0)).toUpperCase());

  // Fill account info
  $('#v_first_name').text(firstName);
  $('#v_last_name').text(lastName);
  $('#v_username').text('@' + username);
  $('#v_email').text(email);

  // Load profile from MongoDB
  $.ajax({
    url: 'php/profile.php?token=' + encodeURIComponent(token),
    type: 'GET',
    dataType: 'json',
    success: function (res) {
      if (res.redirect) { localStorage.clear(); window.location.href = 'login.html'; return; }
      if (res.success && res.profile) {
        var p = res.profile;
        $('#v_age').text(p.age     || '—');
        $('#v_dob').text(p.dob     || '—');
        $('#v_contact').text(p.contact || '—');
        $('#v_gender').text(p.gender   || '—');
        $('#v_address').text(p.address || '—');
        $('#age').val(p.age     || '');
        $('#dob').val(p.dob     || '');
        $('#contact').val(p.contact || '');
        $('#gender').val(p.gender   || '');
        $('#address').val(p.address || '');
      }
    },
    error: function () { showMsg('error', 'Could not load profile data.'); }
  });

  // Edit / Cancel
  $('#editBtn').click(function () { $('#viewMode').hide(); $('#editMode').show(); });
  $('#cancelBtn').click(function () { $('#editMode').hide(); $('#viewMode').show(); });

  // Save
  $('#saveBtn').click(function () {
    var payload = {
      token:   token,
      age:     $('#age').val().trim(),
      dob:     $('#dob').val(),
      contact: $('#contact').val().trim(),
      gender:  $('#gender').val(),
      address: $('#address').val().trim()
    };

    if (!payload.age || !payload.dob || !payload.contact || !payload.gender || !payload.address) {
      showMsg('error', 'Please fill in all fields.');
      return;
    }

    $('#saveBtn').text('Saving...').prop('disabled', true);

    $.ajax({
      url: 'php/profile.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          $('#v_age').text(payload.age);
          $('#v_dob').text(payload.dob);
          $('#v_contact').text(payload.contact);
          $('#v_gender').text(payload.gender);
          $('#v_address').text(payload.address);
          showMsg('success', 'Profile updated successfully.');
          $('#editMode').hide();
          $('#viewMode').show();
        } else {
          showMsg('error', res.message || 'Update failed.');
        }
        $('#saveBtn').text('Save Changes').prop('disabled', false);
      },
      error: function () {
        showMsg('error', 'Server error. Please try again.');
        $('#saveBtn').text('Save Changes').prop('disabled', false);
      }
    });
  });

  // Logout
  function doLogout() {
    $.ajax({
      url: 'php/login.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ action: 'logout', token: token }),
      complete: function () { localStorage.clear(); window.location.href = 'login.html'; }
    });
  }
  $('#logoutBtn').click(doLogout);

  function showMsg(type, text) {
    $('#msgProfile').removeClass('alert-success alert-error show')
      .addClass('alert-' + (type === 'success' ? 'success' : 'error') + ' show')
      .text(text);
    setTimeout(function () { $('#msgProfile').removeClass('show'); }, 3000);
  }

});