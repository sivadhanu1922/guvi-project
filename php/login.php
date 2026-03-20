<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once '../vendor/autoload.php';
use Predis\Client as RedisClient;

$action = $_POST['action'] ?? 'login';

if ($action === 'logout') {
    $token = $_POST['token'] ?? '';
    if ($token) {
        try { $redis = new RedisClient(); $redis->del("session:".$token); } catch(Exception $e) {}
    }
    echo json_encode(["status"=>"success"]);
    exit;
}

$host = getenv('MYSQLHOST') ?: 'mysql.railway.internal';
$user = getenv('MYSQLUSER') ?: 'root';
$pass = getenv('MYSQLPASSWORD') ?: 'GGbxdtChSRHZipDvwMMvfnhOwUDfcUCD';
$db   = getenv('MYSQLDATABASE') ?: 'railway';
$port = getenv('MYSQLPORT') ?: 3306;

$conn = new mysqli($host, $user, $pass, $db,(int) $port);
if ($conn->connect_error) { echo json_encode(["status"=>"error","message"=>"DB error."]); exit; }

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (!$username||!$password) { echo json_encode(["status"=>"error","message"=>"All fields required."]); exit; }

$stmt = $conn->prepare("SELECT id,first_name,last_name,username,email,password FROM users WHERE username=? OR email=?");
$stmt->bind_param("ss",$username,$username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows===0) {
    echo json_encode(["status"=>"error","message"=>"Invalid credentials."]);
    $stmt->close(); $conn->close(); exit;
}
$user = $result->fetch_assoc();
$stmt->close(); $conn->close();

if (!password_verify($password, $user['password'])) {
    echo json_encode(["status"=>"error","message"=>"Invalid credentials."]);
    exit;
}

$token = bin2hex(random_bytes(32));
try {
    $redis = new RedisClient();
    $redis->setex("session:".$token, 86400, json_encode([
        "user_id"    => $user['id'],
        "username"   => $user['username'],
        "email"      => $user['email'],
        "first_name" => $user['first_name'],
        "last_name"  => $user['last_name']
    ]));
} catch(Exception $e) {
    echo json_encode(["status"=>"error","message"=>"Session error: ".$e->getMessage()]);
    exit;
}

echo json_encode([
    "status"     => "success",
    "token"      => $token,
    "user_id"    => $user['id'],
    "username"   => $user['username'],
    "email"      => $user['email'],
    "first_name" => $user['first_name'],
    "last_name"  => $user['last_name']
]);
?>