<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once '../vendor/autoload.php';
use Predis\Client as RedisClient;

function getRedis() {
    $redisUrl = getenv('REDIS_URL') ?: null;
    if ($redisUrl) return new RedisClient($redisUrl);
    return new RedisClient(['host'=>'127.0.0.1','port'=>6379]);
}

$action = $_POST['action'] ?? 'login';

if ($action === 'logout') {
    $token = $_POST['token'] ?? '';
    if ($token) {
        try { $redis = getRedis(); $redis->del("session:".$token); } catch(Exception $e) {}
    }
    echo json_encode(["status"=>"success"]);
    exit;
}

$host = getenv('MYSQLHOST')     ?: 'localhost';
$user = getenv('MYSQLUSER')     ?: 'root';
$pass = getenv('MYSQLPASSWORD') ?: '';
$db   = getenv('MYSQLDATABASE') ?: 'railway';
$port = getenv('MYSQLPORT')     ?: 3306;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo json_encode(["status"=>"error","message"=>"Database connection failed: ".$e->getMessage()]);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (!$username||!$password) {
    echo json_encode(["status"=>"error","message"=>"All fields required."]);
    exit;
}

$stmt = $pdo->prepare("SELECT id,first_name,last_name,username,email,password FROM users WHERE username=? OR email=?");
$stmt->execute([$username, $username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["status"=>"error","message"=>"Invalid credentials."]);
    exit;
}

if (!password_verify($password, $user['password'])) {
    echo json_encode(["status"=>"error","message"=>"Invalid credentials."]);
    exit;
}

$token = bin2hex(random_bytes(32));
try {
    $redis = getRedis();
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