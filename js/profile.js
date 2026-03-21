$(document).ready(function () {

  const token = localStorage.getItem('guvi_token');

  // Auth guard — only token in localStorage
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Load everything from DB via profile.php
  $.ajax({
    url: 'php/profile.php?token=' + encodeURIComponent(token),
    type: 'GET',
    dataType: 'json',
    success: function (res) {
      if (!res.success || res.redirect) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
      }

      // User info from MySQL
      const u = res.user;
      $('#navGreet').text('Hello, ' + u.first_name);
      $('#sidebarName').text(u.first_name + ' ' + u.last_name);
      $('#sidebarUsername').text('@' + u.username);
      $('#sidebarEmail').text(u.email);
      $('#avatarInitials').text((u.first_name.charAt(0) + u.last_name.charAt(0)).toUpperCase());
      $('#v_first_name').text(u.first_name);
      $('#v_last_name').text(u.last_name);
      $('#v_username').text('@' + u.username);
      $('#v_email').text(u.email);

      // Profile details from MongoDB
      if (res.profile) {
        const p = res.profile;
        $('#v_age').text(p.age     || '—');
        $('#v_dob').text(p.dob     || '—');
        $('#v_contact').text(p.contact || '—');
        $('#v_gender').text(p.gender   || '—');
        $('#v_address').text(p.address || '—');
        // Pre-fill edit form
        $('#age').val(p.age     || '');
        $('#dob').val(p.dob     || '');
        $('#contact').val(p.contact || '');
        $('#gender').val(p.gender   || '');
        $('#address').val(p.address || '');
      }
    },
    error: function () {
      showMsg('error', 'Could not load profile. Please try again.');
    }
  });

  // Edit / Cancel
  $('#editBtn').click(function () {
    $('#viewMode').hide();
    $('#editMode').show();
  });

  $('#cancelBtn').click(function () {
    $('#editMode').hide();
    $('#viewMode').show();
  });

  // Save
  $('#saveBtn').click(function () {
    const payload = {
      token,
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
      data: JSON.stringify({ action: 'logout', token }),
      complete: function () {
        localStorage.clear();
        window.location.href = 'login.html';
      }
    });
  }
  $('#logoutBtn').click(doLogout);

  function showMsg(type, text) {
    $('#msgProfile')
      .removeClass('alert-success alert-error show')
      .addClass('alert-' + (type === 'success' ? 'success' : 'error') + ' show')
      .text(text);
    setTimeout(() => { $('#msgProfile').removeClass('show'); }, 3000);
  }

});