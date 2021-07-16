<?php
//Location of prices list
$pricesList = scandir('../../../gpu_prices/prices/');

$fromTime = $_GET['from'];
$interval = $_GET['interval'];

//Set defaults for interval & from-time
if (!isset($interval)) {
  $interval = 0;
} else {
  $interval = intval($interval);
}

if (!isset($fromTime)) {
  $fromTime = 0;
} else {
  $fromTime = intval($fromTime);
}

$output = '{';

$lastTime = 0;

//Go through each item in prices directory
foreach ($pricesList as $priceFile){
  //Ignore dot files
  if ($priceFile != "." && $priceFile != ".."){

    //See if file name is numeric (should be milliseconds value)
    if (intval(explode(".", $priceFile)[0])) {

      //Get time value of file
      $timeValue = intval(explode(".", $priceFile)[0]);

      //Check if time value matches interval and start date criteria
      if ($lastTime + $interval <= $timeValue && $timeValue >= $fromTime) {

        //Get contents of JSON file
        $priceJson = file_get_contents('../../../gpu_prices/prices/'.$priceFile);

        //Remove enclosing brackets
        $priceJson = substr($priceJson, 1, -1);

        //Add to output string
        $output = $output.$priceJson.',';

        $lastTime = $timeValue;
      }
    }
  }
}

//Remove extra comma from JSON string
if (substr($output,-1) == ","){
  $output = substr($output, 0, -1);
}

//Close string and echo as JSON
$output = $output.'}';

header('Content-Type: application/json');
echo $output;
 ?>
