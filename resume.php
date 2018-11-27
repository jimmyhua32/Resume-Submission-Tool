<?php
  error_reporting(E_ALL);
  
  $fields = array("firstname", "lastname", "email", "jobtitle", "employer", "datestart", 
                    "dateend", "desc");
  if (isset($_POST["data"])) {
    $data = reformat_data(json_decode($_POST["data"], $fields));
    if (verify_data($data)) {
      
    } else {
      send_error("There seems to be an issue with data given");
    }
  } else {
    send_error("Could not find any POST or GET parameters");
  }
  
  function reformat_data($data, $fields) {
    $formatted_data = array();
    for ($i = 0; $i < count($fields); $i++) {
      $formatted_data[$fields[$i]] = $data[$i];
    }
    return $formatted_data;
  }
  
  function send_error($message) {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    die($message);
  }
?>