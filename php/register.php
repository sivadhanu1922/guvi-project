<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once '../vendor/autoload.php';

$host = getenv('MYSQLHOST')     ?: 'localhost';
$user = getenv('MYSQLUSER')     ?: 'root';
$pass = getenv('MYSQLPASSWORD') ?: '';
$db   = getenv('MYSQLDATABASE') ?: 'railway';
$port = getenv('MYSQLPORT')     ?: 3306;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo json_encode(["status"=>"error","message"=>"DB failed: ".$e->getMessage()]);
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

$stmt = $pdo->prepare("SELECT id FROM users WHERE username=? OR email=?");
$stmt->execute([$username, $email]);
if ($stmt->rowCount() > 0) {
    echo json_encode(["status"=>"error","message"=>"Username or email already exists."]);
    exit;
}

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT INTO users (first_name,last_name,username,email,password) VALUES (?,?,?,?,?)");
if ($stmt->execute([$first_name, $last_name, $username, $email, $hashed])) {
    echo json_encode(["status"=>"success","message"=>"Registration successful."]);
} else {
    echo json_encode(["status"=>"error","message"=>"Registration failed."]);
}
?>