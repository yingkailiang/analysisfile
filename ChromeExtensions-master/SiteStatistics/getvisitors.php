<?php
//log visitor

$myFile = "visitors.json";
$fh = fopen($myFile, 'r') or die("can't open file");

$string = fread($fh, filesize($myFile));
echo $string;

fclose($fh);
?>