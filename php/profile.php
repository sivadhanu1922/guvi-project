<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once '../vendor/autoload.php';
use Predis\Client as RedisClient;
use MongoDB\Client as MongoClient;

$token   = $_POST['token']   ?? '';
$user_id = $_POST['user_id'] ?? '';
$action  = $_POST['action']  ?? 'get';

if (!$token||!$user_id) {
    echo json_encode(["status"=>"error","message"=>"Unauthorized."]);
    exit;
}

try {
    $redisUrl = getenv('REDIS_URL') ?: null;
    $redis = $redisUrl ? new RedisClient($redisUrl) : new RedisClient(['host'=>'127.0.0.1','port'=>6379]);
    $session = $redis->get("session:".$token);
    if (!$session) {
        echo json_encode(["status"=>"error","message"=>"Session expired."]);
        exit;
    }
} catch(Exception $e) {
    echo json_encode(["status"=>"error","message"=>"Session error: ".$e->getMessage()]);
    exit;
}

try {
    $mongoUri = getenv('MONGO_URL') ?: getenv('MONGODB_URL') ?: 'mongodb://127.0.0.1:27017';
    $mongo = new MongoClient($mongoUri);
    $col   = $mongo->guvi_db->profiles;
} catch(Exception $e) {
    echo json_encode(["status"=>"error","message"=>"MongoDB error: ".$e->getMessage()]);
    exit;
}

if ($action === 'get') {
    $profile = $col->findOne(["user_id"=>$user_id]);
    if ($profile) {
        echo json_encode(["status"=>"success","profile"=>[
            "age"     => $profile['age']     ?? '',
            "dob"     => $profile['dob']     ?? '',
            "contact" => $profile['contact'] ?? '',
            "gender"  => $profile['gender']  ?? '',
            "address" => $profile['address'] ?? ''
        ]]);
    } else {
        echo json_encode(["status"=>"success","profile"=>null]);
    }
} elseif ($action === 'update') {
    $age     = trim($_POST['age']     ?? '');
    $dob     = trim($_POST['dob']     ?? '');
    $contact = trim($_POST['contact'] ?? '');
    $gender  = trim($_POST['gender']  ?? '');
    $address = trim($_POST['address'] ?? '');

    if (!$age||!$dob||!$contact||!$gender||!$address) {
        echo json_encode(["status"=>"error","message"=>"All fields required."]);
        exit;
    }

    $col->updateOne(
        ["user_id"=>$user_id],
        ['$set'=>["user_id"=>$user_id,"age"=>$age,"dob"=>$dob,
                  "contact"=>$contact,"gender"=>$gender,"address"=>$address,
                  "updated_at"=>date('Y-m-d H:i:s')]],
        ["upsert"=>true]
    );
    echo json_encode(["status"=>"success","message"=>"Profile updated."]);
} else {
    echo json_encode(["status"=>"error","message"=>"Invalid action."]);
}
?>