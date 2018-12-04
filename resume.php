<?php
  error_reporting(E_ALL);
  
  /**
   * Name: Jimmy Hua
   * Date: November 26, 2018
   * Section: CSE 154 AC
   * 
   * This is the php file that acts as the webservice for the resume submission tool.
   * It updates the SQL server with information about the resumes and can send information
   * about each person's contact info and their work history to the client.
   * 
   * Web Service Details
   * ==============================================================================================
   * Required GET parameters:
   * - type
   *  - if type is "id", then id is also required
   * Required POST parameters:
   * - data
   * Output format:
   * - Plain text and JSON
   * Output Details:
   * - If the type parameter is set to "all", then every person's contact info and name in the SQL
   *   database is outputted as JSON.
   * - If the type parameter is set to "id", then the person's work history that corresponds with
   *   the id will be outputted as JSON.
   * - If the data parameter is set, then the SQL database is updated with the information given
   *   in the POST parameters (format must be in JSON).
   * - If the given GET/POST parameters are invalid or there is an issue with the data, a 400 error
   *   is issued.
   * - Else if there is an error with the connection, a 503 error is issued. 
   */
  
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
  
  /**
   * Verifies that the contact info given is in a valid format using regex.
   * @param {object} $data - the array containing information about the resume
   * @returns {boolean} - true if all the data is valid; false otherwise
   */
  function verify_data($data) {
    $matches = array();
    $first_match = preg_match("/[^a-z]+/i", $data["first_name"]);
    $last_match = preg_match("/[^a-z]+/i", $data["last_name"]);
    preg_match("/[a-z\d._-]+@[a-z\d._-]+\.[a-z]{2,5}$/i", $data["email"], $matches);
    return $first_match === 0 && $last_match === 0 && $matches[0] === $data["email"];
  }
  
  /**
   * Echos all the people who have submitted resumes from a SQL database.
   * @param {object} $db - the PDO object related to the SQl server
   */
  function get_all($db) {
    try {
      $rows = $db->query("SELECT * FROM People");
      $info = $rows->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($info);
    } catch (PDOException $ex) {
      send_pdoerror("Could not retrieve information from database");
    }
  }
  
  /**
   * Echos the work history from the given person's id from a SQL database.
   * @param {number} $id - the id of the resume to used
   * @param {object} $db - the PDO object related to the SQl server
   */
  function get_by_id($id, $db) {
    try {
      $sql = "SELECT * FROM Experience WHERE pid=:pid";
      $statement = $db->prepare($sql);
      $statement->execute(array("pid" => $id));
      $info = $statement->fetchAll(PDO::FETCH_ASSOC);
      if (empty($info)) {
        $sql = "DELETE FROM People WHERE id=:pid";
        $statement = $db->prepare($sql);
        $statement->execute(array("pid" => $id));
        send_error("Resume could not be found in database. Removing from database...");
      } else {
        echo json_encode($info);        
      }
    } catch (PDOException $ex) {
      send_pdoerror("Could not retrieve information from database");
    }
  }
  
  /**
   * Saves the given information about the resumes into the SQL database
   * @param {object} $data - the array containing all the relevant information
   * @param {object} $db - the PDO object related to the SQL database
   */
  function save_data($data, $db) {
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
      send_pdoerror("Failed to connect to database server");
    }
  }
  
  /**
   * Reformats the given data into an easier to parse associative array
   * @param {object} $data - the original array passed into the webserver
   * @returns {object} - the new reformatted array
   */
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
  
  /**
   * Establishes a connection to the SQL database and returns a PDO object.
   * @return {object} - the PDO object that is connected to the SQL database
   */
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
      send_pdoerror("Failed to connect to database");
    }
  }
  
  /**
   * Sends a 400 request error with the given message.
   * @param {string} $message - the messaage to be sent
   */
  function send_error($message) {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    die($message);
  }
  
  /**
   * Sends a 503 connection error with the given message.
   * @param {string} $message - the messaage to be sent
   */
  function send_pdoerror($message) {
    header("HTTP/1.1 503 Database Connection Error");
    header("Content-type: text/plain");
    die($message);
  }
?>