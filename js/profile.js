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

  // Topbar session
  $("#sessionToken").text(token.substring(0, 16) + "...");

  // Sidebar
  $("#sidebarName").text(firstName + " " + lastName);
  $("#sidebarUsername").html('<span>@</span>' + username);
  $("#sidebarEmail").text(email);

  var initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  $("#avatarInitials").text(initials);

  // View fields — account info
  $("#v_first_name").text(firstName);
  $("#v_last_name").text(lastName);
  $("#v_username").text("@" + username);
  $("#v_email").text(email);

  // Load MongoDB profile
  $.ajax({
    url: "php/profile.php",
    type: "POST",
    data: { action: "get", token: token, user_id: user_id },
    dataType: "json",
    success: function (res) {
      if (res.status === "success" && res.profile) {
        var p = res.profile;
        $("#v_age").text(p.age || "—");
        $("#v_dob").text(p.dob || "—");
        $("#v_contact").text(p.contact || "—");
        $("#v_gender").text(p.gender || "—");
        $("#v_address").text(p.address || "—");
        $("#age").val(p.age || "");
        $("#dob").val(p.dob || "");
        $("#contact").val(p.contact || "");
        $("#gender").val(p.gender || "");
        $("#address").val(p.address || "");
      }
    },
    error: function () {
      showMsg("error", "Could not load profile data.");
    }
  });

  // Edit
  $("#editBtn").click(function () {
    $("#viewMode").hide();
    $("#editMode").fadeIn(200);
  });

  // Cancel
  $("#cancelBtn").click(function () {
    $("#editMode").hide();
    $("#viewMode").fadeIn(200);
  });

  // Save
  $("#saveBtn").click(function () {
    var data = {
      action: "update", token: token, user_id: user_id,
      age:     $("#age").val().trim(),
      dob:     $("#dob").val(),
      contact: $("#contact").val().trim(),
      gender:  $("#gender").val(),
      address: $("#address").val().trim()
    };

    if (!data.age || !data.dob || !data.contact || !data.gender || !data.address) {
      showMsg("error", "// error: all_fields_required");
      return;
    }

    $("#saveBtn").text("Saving...").prop("disabled", true);

    $.ajax({
      url: "php/profile.php",
      type: "POST",
      data: data,
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          $("#v_age").text(data.age);
          $("#v_dob").text(data.dob);
          $("#v_contact").text(data.contact);
          $("#v_gender").text(data.gender);
          $("#v_address").text(data.address);
          showMsg("success", "// profile_updated successfully");
          $("#editMode").hide();
          $("#viewMode").fadeIn(200);
        } else {
          showMsg("error", res.message || "Update failed.");
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
      data: { action: "logout", token: token },
      dataType: "json",
      complete: function () {
        localStorage.clear();
        window.location.href = "login.html";
      }
    });
  }
  $("#logoutBtn").click(doLogout);
  $("#navLogout").click(function(e){ e.preventDefault(); doLogout(); });

  function showMsg(type, text) {
    var el = $("#msgProfile");
    el.removeClass("alert-success alert-error")
      .addClass(type === "success" ? "alert-success" : "alert-error")
      .text(text).show();
    setTimeout(function () { el.fadeOut(); }, 3500);
  }

});