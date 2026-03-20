<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once '../vendor/autoload.php';

$host = getenv('MYSQLHOST');
$user = getenv('MYSQLUSER');
$pass = getenv('MYSQLPASSWORD');
$db   = getenv('MYSQLDATABASE');
$port = getenv('MYSQLPORT') ?: 3306;

$conn = new mysqli($host, $user, $pass, $db, (int)$port);
if ($conn->connect_error) {
    echo json_encode(["status"=>"error","message"=>"Database connection failed."]);
    exit;
}

$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name']  ?? '');
$username   = trim($_POST['username']   ?? '');
$email      = trim($_POST['email']      ?? '');
$password   = $_POST['password']        ?? '';

if (!$first_name||!$last_name||!$username||!$email||!$password) {
    echo json_encode(["status"=>"error","message"=>"All fields are required."]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status"=>"error","message"=>"Invalid email address."]);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE username=? OR email=?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(["status"=>"error","message"=>"Username or email already exists."]);
    $stmt->close(); $conn->close(); exit;
}
$stmt->close();

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO users (first_name,last_name,username,email,password) VALUES (?,?,?,?,?)");
$stmt->bind_param("sssss", $first_name, $last_name, $username, $email, $hashed);

if ($stmt->execute()) {
    echo json_encode(["status"=>"success","message"=>"Registration successful."]);
} else {
    echo json_encode(["status"=>"error","message"=>"Registration failed."]);
}
$stmt->close(); $conn->close();
?>