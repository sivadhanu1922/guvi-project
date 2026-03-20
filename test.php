<?php
echo "<pre>";
echo "PHP Version: " . phpversion() . "\n\n";
echo "PDO Drivers: ";
print_r(PDO::getAvailableDrivers());
echo "\nLoaded Extensions: ";
print_r(get_loaded_extensions());
echo "</pre>";
?>