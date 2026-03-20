$(document).ready(function () {

  $("#registerBtn").click(function () {
    var first_name = $("#first_name").val().trim();
    var last_name  = $("#last_name").val().trim();
    var username   = $("#username").val().trim();
    var email      = $("#email").val().trim();
    var password   = $("#password").val();
    var confirm    = $("#confirm_password").val();

    if (!first_name || !last_name || !username || !email || !password || !confirm) {
      showMsg("error", "// error: all_fields_required");
      return;
    }
    if (password !== confirm) {
      showMsg("error", "// error: passwords_do_not_match");
      return;
    }

    $("#registerBtn").text("Creating...").prop("disabled", true);

    $.ajax({
      url: "php/register.php",
      type: "POST",
      data: {
  first_name: first_name,
  last_name:  last_name,
  username:   username,
  email:      email,
  password:   password
},
      dataType: "json",
      success: function (res) {
        if (res.success) {
          showMsg("success", "// account_created → redirecting...");
          setTimeout(function () {
            window.location.href = "login.html";
          }, 1500);
        } else {
          showMsg("error", "// error: " + res.message);
          $("#registerBtn").text("Create Account →").prop("disabled", false);
        }
      },
      error: function () {
        showMsg("error", "// error: server_unreachable");
        $("#registerBtn").text("Create Account →").prop("disabled", false);
      }
    });
  });

  function showMsg(type, text) {
    var el = $("#msg");
    el.removeClass("alert-success alert-error")
      .addClass(type === "success" ? "alert-success" : "alert-error")
      .text(text).show();
  }

});