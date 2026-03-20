$(document).ready(function () {

  var token   = localStorage.getItem("guvi_token");
  var user_id = localStorage.getItem("guvi_user_id");

  if (!token || !user_id) {
    window.location.href = "login.html";
    return;
  }

  var firstName = localStorage.getItem("guvi_first_name") || "";
  var lastName  = localStorage.getItem("guvi_last_name")  || "";
  var username  = localStorage.getItem("guvi_username")   || "";
  var email     = localStorage.getItem("guvi_email")      || "";

  // Navbar
  $("#navGreet").text("Hello, " + firstName);
  $("#sessionToken").text(token.substring(0, 16) + "...");

  // Sidebar
  $("#sidebarName").text(firstName + " " + lastName);
  $("#sidebarUsername").html('<span>@</span>' + username);
  $("#sidebarEmail").text(email);
  $("#avatarInitials").text((firstName.charAt(0) + lastName.charAt(0)).toUpperCase());

  // Account info view
  $("#v_first_name").text(firstName);
  $("#v_last_name").text(lastName);
  $("#v_username").text("@" + username);
  $("#v_email").text(email);

  // Load profile from MongoDB via GET
  $.ajax({
    url: "php/profile.php?token=" + encodeURIComponent(token),
    type: "GET",
    dataType: "json",
    success: function (res) {
      if (res.success && res.profile) {
        var p = res.profile;
        $("#v_age").text(p.age     || "—");
        $("#v_dob").text(p.dob     || "—");
        $("#v_contact").text(p.contact || "—");
        $("#v_gender").text(p.gender   || "—");
        $("#v_address").text(p.address || "—");
        // Pre-fill edit form
        $("#age").val(p.age     || "");
        $("#dob").val(p.dob     || "");
        $("#contact").val(p.contact || "");
        $("#gender").val(p.gender   || "");
        $("#address").val(p.address || "");
      }
      if (res.redirect) {
        localStorage.clear();
        window.location.href = "login.html";
      }
    },
    error: function () {
      showMsg("error", "// error: could_not_load_profile");
    }
  });

  // Edit button
  $("#editBtn").click(function () {
    $("#viewMode").hide();
    $("#editMode").fadeIn(200);
  });

  // Cancel button
  $("#cancelBtn").click(function () {
    $("#editMode").hide();
    $("#viewMode").fadeIn(200);
  });

  // Save button
  $("#saveBtn").click(function () {
    var payload = {
      token:   token,
      age:     $("#age").val().trim(),
      dob:     $("#dob").val(),
      contact: $("#contact").val().trim(),
      gender:  $("#gender").val(),
      address: $("#address").val().trim()
    };

    if (!payload.age || !payload.dob || !payload.contact || !payload.gender || !payload.address) {
      showMsg("error", "// error: all_fields_required");
      return;
    }

    $("#saveBtn").text("Saving...").prop("disabled", true);

    $.ajax({
      url: "php/profile.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
      success: function (res) {
        if (res.success) {
          $("#v_age").text(payload.age);
          $("#v_dob").text(payload.dob);
          $("#v_contact").text(payload.contact);
          $("#v_gender").text(payload.gender);
          $("#v_address").text(payload.address);
          showMsg("success", "// profile_updated successfully");
          $("#editMode").hide();
          $("#viewMode").fadeIn(200);
        } else {
          showMsg("error", "// error: " + res.message);
        }
        $("#saveBtn").text("Save Changes").prop("disabled", false);
      },
      error: function () {
        showMsg("error", "// error: server_unreachable");
        $("#saveBtn").text("Save Changes").prop("disabled", false);
      }
    });
  });

  // Logout
  function doLogout() {
    $.ajax({
      url: "php/login.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ action: "logout", token: token }),
      dataType: "json",
      complete: function () {
        localStorage.clear();
        window.location.href = "login.html";
      }
    });
  }
  $("#logoutBtn").click(doLogout);
  $("#navLogout").click(function (e) { e.preventDefault(); doLogout(); });

  function showMsg(type, text) {
    var el = $("#msgProfile");
    el.removeClass("alert-success alert-error")
      .addClass(type === "success" ? "alert-success" : "alert-error")
      .text(text).show();
    setTimeout(function () { el.fadeOut(); }, 3500);
  }

});