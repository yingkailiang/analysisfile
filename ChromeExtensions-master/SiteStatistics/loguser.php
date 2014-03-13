<?php
$json = $_GET["json"];
$site = $_GET["site"];

$myFile = $site.".json";
$fh = fopen($myFile, 'w') or die("can't open file");
fwrite($fh, $json);
fclose($fh);
?>