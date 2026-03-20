<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit; 
}

require_once __DIR__ . '/../vendor/autoload.php';

// Accept both JSON and form data
$body = file_get_contents('php://input');
$data = json_decode($body, true);
if (!$data) $data = $_POST;

if (empty($data)) {
    echo json_encode(['success'=>false,'message'=>'Invalid request.']);
    exit;
}

$host = getenv('MYSQLHOST')     ?: 'localhost';
$user = getenv('MYSQLUSER')     ?: 'root';
$pass = getenv('MYSQLPASSWORD') ?: '';
$db   = getenv('MYSQLDATABASE') ?: 'railway';
$port = getenv('MYSQLPORT')     ?: '3306';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'DB failed: '.$e->getMessage()]);
    exit;
}

$first_name = trim($data['first_name'] ?? '');
$last_name  = trim($data['last_name']  ?? '');
$username   = trim($data['username']   ?? '');
$email      = trim($data['email']      ?? '');
$password   =      $data['password']   ?? '';

if (!$first_name||!$last_name||!$username||!$email||!$password) {
    echo json_encode(['success'=>false,'message'=>'All fields required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email=? OR username=? LIMIT 1');
$stmt->execute([$email, $username]);
if ($stmt->fetch()) {
    echo json_encode(['success'=>false,'message'=>'Email or username already taken.']);
    exit;
}

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt   = $pdo->prepare('INSERT INTO users (first_name,last_name,email,username,password) VALUES (?,?,?,?,?)');
try {
    $stmt->execute([$first_name,$last_name,$email,$username,$hashed]);
    echo json_encode(['success'=>true,'message'=>'Account created successfully.']);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Could not create account: '.$e->getMessage()]);
}
?>