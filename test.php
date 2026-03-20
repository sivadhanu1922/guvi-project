<?php
echo json_encode([
    "php_version" => phpversion(),
    "extensions"  => get_loaded_extensions(),
    "pdo_drivers" => PDO::getAvailableDrivers()
]);
?>