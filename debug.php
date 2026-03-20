<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

echo json_encode([
    'method'  => $_SERVER['REQUEST_METHOD'],
    'body'    => file_get_contents('php://input'),
    'post'    => $_POST,
    'php_ver' => phpversion()
]);
?>