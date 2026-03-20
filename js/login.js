$(document).ready(function () {

  // Redirect if already logged in
  if (localStorage.getItem("guvi_token")) {
    window.location.href = "profile.html";
  }

  $("#loginBtn").click(function () {
    var username = $("#username").val().trim();
    var password = $("#password").val();

    if (!username || !password) {
      showMsg("error", "Please fill in all fields.");
      return;
    }

    $("#loginBtn").text("Signing in...").prop("disabled", true);

    $.ajax({
      url: "php/login.php",
      type: "POST",
      data: {
        username: username,
        password: password
      },
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          // Store token and user info in localStorage
          localStorage.setItem("guvi_token", res.token);
          localStorage.setItem("guvi_user_id", res.user_id);
          localStorage.setItem("guvi_username", res.username);
          localStorage.setItem("guvi_email", res.email);
          localStorage.setItem("guvi_first_name", res.first_name);
          localStorage.setItem("guvi_last_name", res.last_name);

          showMsg("success", "Login successful! Redirecting...");
          setTimeout(function () {
            window.location.href = "profile.html";
          }, 1000);
        } else {
          showMsg("error", res.message);
          $("#loginBtn").text("Sign In").prop("disabled", false);
        }
      },
      error: function () {
        showMsg("error", "Server error. Please try again.");
        $("#loginBtn").text("Sign In").prop("disabled", false);
      }
    });
  });

  function showMsg(type, text) {
    var el = $("#msg");
    el.removeClass("alert-success alert-error").addClass(type === "success" ? "alert-success" : "alert-error");
    el.text(text).show();
  }

});