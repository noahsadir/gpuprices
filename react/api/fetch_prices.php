<?php
$pricesList = scandir('../../../gpu_prices/prices/');
// DIR www/gpuprices.noahsadir.io/public_html/api/
// --> www/gpuprices.noahsadir.io/public_html/
// --> www/gpuprices.noahsadir.io/
// --> www/
// --> www/gpu_prices/
// --> www/gpu_prices/prices/

$output = '{';

//TODO: Make operations safer; script makes lots of assumptions

//Go through each item in prices directory
foreach ($pricesList as $priceFile){
  //Ignore dot files
  if ($priceFile != "." && $priceFile != ".."){
    //Get contents of JSON file
    $priceJson = file_get_contents('../../../gpu_prices/prices/'.$priceFile);

    //Remove enclosing brackets
    $priceJson = substr($priceJson, 1, -1);

    //Add to output string
    $output = $output.$priceJson.',';
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
