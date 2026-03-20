$(document).ready(function () {

  $("#registerBtn").click(function () {
    var first_name = $("#first_name").val().trim();
    var last_name = $("#last_name").val().trim();
    var username = $("#username").val().trim();
    var email = $("#email").val().trim();
    var password = $("#password").val();
    var confirm_password = $("#confirm_password").val();

    if (!first_name || !last_name || !username || !email || !password || !confirm_password) {
      showMsg("error", "Please fill in all fields.");
      return;
    }

    if (password !== confirm_password) {
      showMsg("error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      showMsg("error", "Password must be at least 6 characters.");
      return;
    }

    $("#registerBtn").text("Creating...").prop("disabled", true);

    $.ajax({
      url: "php/register.php",
      type: "POST",
      data: {
        first_name: first_name,
        last_name: last_name,
        username: username,
        email: email,
        password: password
      },
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          showMsg("success", "Account created! Redirecting to login...");
          setTimeout(function () {
            window.location.href = "login.html";
          }, 1500);
        } else {
          showMsg("error", res.message);
          $("#registerBtn").text("Create Account").prop("disabled", false);
        }
      },
      error: function () {
        showMsg("error", "Server error. Please try again.");
        $("#registerBtn").text("Create Account").prop("disabled", false);
      }
    });
  });

  function showMsg(type, text) {
    var el = $("#msg");
    el.removeClass("alert-success alert-error").addClass(type === "success" ? "alert-success" : "alert-error");
    el.text(text).show();
  }

});