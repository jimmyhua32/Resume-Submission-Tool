<?php
  error_reporting(E_ALL);
  ini_set("display_errors", 1);
  
  $db = connect_to_db();

  if (isset($_POST["data"])) {
    $data = reformat_data(json_decode($_POST["data"]));
    if (verify_data($data)) {
      save_data($data, $db);
      header("Content-type: text/plain");
      echo "Resume successfully submitted!";
    } else {
      send_error("There seems to be an issue with data given");
    }
  } else if (isset($_GET["type"])) {
    header("Content-type: application/json");
    $type = $_GET["type"];
    if ($type === "all") {
      get_all($db);
    } else if ($type === "id") {
      if (isset($_GET["id"])) {
        get_by_id($_GET["id"], $db);
      } else {
        send_error("id parameter is required when type is set to \"id\"");
      }
    } else {
      send_error("Could not identify GET parameter \"type\" (must be id or all)");
    }
  } else {
    send_error("Could not find any POST or GET parameters");
  }
  
  function verify_data($data) {
    $matches = array();
    $first_match = preg_match("/[^a-z]+/i", $data["first_name"]);
    $last_match = preg_match("/[^a-z]+/i", $data["last_name"]);
    preg_match("/[a-z\d._-]+@[a-z\d._-]+\.[a-z]{2,5}$/i", $data["email"], $matches);
    return $first_match === 0 && $last_match === 0 && $matches[0] === $data["email"];
  }
  
  function get_all($db) {
    try {
      $rows = $db->query("SELECT * FROM People");
      $info = $rows->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($info);
    } catch (PDOException $ex) {
      send_error("Could not retrieve information from database");
    }
  }
  
  function get_by_id($id, $db) {
    try {
      $sql = "SELECT * FROM Experience WHERE id=:pid";
      $statement = $db->prepare($sql);
      $statement->execute(array("pid" => $id));
      $info = $statement->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($info);
    } catch (PDOException $ex) {
      send_error("Could not retrieve information from database");
    }
  }
  
  function save_data($data, $db) {
    $id;
    try {
      $sql = "INSERT INTO People (first_name, last_name, email) " .
             " VALUES ( :first_name, :last_name, :email );";
      $statement = $db->prepare($sql);
      $parameters = array("first_name" => $data["first_name"],
                          "last_name" => $data["last_name"],
                          "email" => $data["email"]);
      $statement->execute($parameters);
      $id = $db->lastInsertId();
      for ($i = 0; $i < count($data["job_title"]); $i++) {
        $sql = "INSERT INTO Experience (pid, job_title, employer, date_start, date_end, descr) " .
               " VALUES ( :pid, :job_title, :employer, :date_start, :date_end, :descr );";
        $statement = $db->prepare($sql);
        $parameters = array("pid" => $id,
                            "job_title" => $data["job_title"][$i],
                            "employer" => $data["employer"][$i],
                            "date_start" => $data["date_start"][$i],
                            "date_end" => $data["date_end"][$i],
                            "descr" => $data["descr"][$i]);
        $statement->execute($parameters);
      }
    } catch (PDOException $ex) {
      send_error("Failed to connect to database server");
    }
  }
  
  function reformat_data($data) {
    $fields = array("first_name", "last_name", "email", "job_title", "employer", "date_start", 
                    "date_end", "descr");
    $formatted_data = array();
    for ($i = 0; $i < count($fields); $i++) {
      if (is_string($data[$i])) {
        $formatted_data[$fields[$i]] = trim($data[$i]);
      } else {
        $formatted_data[$fields[$i]] = $data[$i];      
      }
    }
    return $formatted_data;
  }
  
  function connect_to_db() {
    $host = "localhost";
    $port = "3306";
    $dbname = "resumes";
    $user = "root";
    $password = "";
    $ds = "mysql:host={$host}:{$port};dbname={$dbname};charset=utf8";
    try {
      $db = new PDO($ds, $user, $password);
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      return $db;
    } catch (PDOException $ex) {
      send_error("Failed to connect to database");
    }
  }
  
  function send_error($message) {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    die($message);
  }
?>