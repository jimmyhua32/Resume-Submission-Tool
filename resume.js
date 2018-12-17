(function () {
  "use strict";

  // url to the resume API
  const URL = "resume.php";
  // All the fields that can be submitted to the API
  const FIELDS = ["firstname", "lastname", "email", "jobtitle", "employer",
    "datestart", "dateend", "desc"];
  // The number of contact information fields
  const NUM_CONTACT_FIELDS = 3;

  let jobCount = 1;

  window.addEventListener("load", initialize);

  /**
   * Initializes the state of the resume submitter by adding clicking functionality to various
   * buttons and checking for form input.
   */
  function initialize() {

    $("mode-radio").addEventListener("input", changeDisplay);
    $("add-job").addEventListener("click", addJob);
    $("apply").onsubmit = function () {
      submitForm();
      return false;
    };
  }

  /**
   * Switches the menu view depending on which radio button was selected.
   */
  function changeDisplay() {
    let selected = qs('input[name="mode"]:checked').value;
    $("resume").classList.add("hidden");
    if (selected === "submission") {
      $("application").classList.remove("hidden");
      $("view").classList.add("hidden");
    } else {
      updateResumes();
    }
  }

  /**
   * Adds another section to work history so users can add another job.
   */
  function addJob() {
    let newJob = document.createElement("div");
    newJob.innerHTML = $("job1").innerHTML;
    jobCount++;
    newJob.classList.add("job");
    newJob.id = "job" + jobCount;
    let removeButton = document.createElement("button");
    removeButton.innerText = "Remove this job";
    newJob.appendChild(removeButton);
    removeButton.addEventListener("click", removeJob);
    $("work-history").appendChild(newJob);
  }

  function removeJob() {
    this.parentElement.innerHTML = "";
    jobCount--;  
  }
  /**
   * Submits the resume form and sends a POST request to the API with the information given.
   */
  function submitForm() {
    let parameters = [];
    for (let i = 0; i < NUM_CONTACT_FIELDS; i++) {
      parameters.push(getByName(FIELDS[i])[0].value);
    }
    for (let i = NUM_CONTACT_FIELDS; i < FIELDS.length; i++) {
      parameters.push(getValuesFromNodeList(getByName(FIELDS[i])));
    }
    $("apply").reset();
    let application = new FormData();
    application.append("data", JSON.stringify(parameters));
    fetch(URL, { method: "POST", body: application })
      .then(checkStatus)
      .then(successMessage)
      .catch(showMessage);
  }

  /**
   * Performs a fetch request to get all the names of the people who have submitted resumes.
   */
  function updateResumes() {
    let url = URL + "?type=all";
    fetch(url)
      .then(checkStatus)
      .then(JSON.parse)
      .then(parseResumes)
      .catch(showMessage);
  }

  /**
   * Populates the table of resumes with the resumes given by the GET request with people's
   * first and last names and email.
   * Adds an event listener so that any row that is double clicked is shown as a full
   * resume.
   * @param {object} responseData - JSON object containing the relevant data
   */
  function parseResumes(responseData) {
    $("people").innerHTML = "";
    for (let i = 0; i < responseData.length; i++) {
      let row = document.createElement("tr");
      row.id = responseData[i].id;
      row.appendChild(addTableData(responseData[i]["first_name"]));
      row.appendChild(addTableData(responseData[i]["last_name"]));
      row.appendChild(addTableData(responseData[i]["email"]));
      row.addEventListener("dblclick", getResume);
      $("people").appendChild(row);
    }
    $("view").classList.remove("hidden");
    $("application").classList.add("hidden");
  }

  /**
   * Performs a GET request to get the work experience of the selected resume.
   */
  function getResume() {
    let info = this.querySelectorAll("td");
    $("resume-name").innerText = info[0].innerText + " " + info[1].innerText;
    $("resume-email").innerText = info[2].innerText;
    let url = URL + "?type=id&id=" + this.id;
    fetch(url)
      .then(checkStatus)
      .then(JSON.parse)
      .then(showResume)
      .catch(showMessage);
  }

  /**
   * Populates the resume view with the work history and contact information for the selected
   * resume using the given information.
   * @param {object} responseData - The JSON object containing the relevant data
   */
  function showResume(responseData) {
    $("resume-work-history").innerHTML = "";
    for (let i = 0; i < responseData.length; i++) {
      let work = document.createElement("article");
      let jobNum = document.createElement("h4");
      jobNum.innerText = "Job #" + (i + 1);
      work.appendChild(jobNum);
      addEntry(work, "Job Title: " + responseData[i]["job_title"]);
      addEntry(work, "Employer: " + responseData[i]["employer"]);
      addEntry(work, "Date Start: " + responseData[i]["date_start"]);
      addEntry(work, "Date End: " + responseData[i]["date_end"]);
      addEntry(work, "Job Description: " + responseData[i]["descr"]);
      work.classList.add("job-listing");
      $("resume-work-history").appendChild(work);
    }
    $("view").classList.add("hidden");
    $("resume").classList.remove("hidden");
  }

  /**
   * Appends a paragraph element to a given parent node with the given text
   * @param {object} parent - The parent node 
   * @param {string} stringEntry - The text to be inserted
   */
  function addEntry(parent, stringEntry) {
    let entry = document.createElement("p");
    entry.innerText = stringEntry;
    parent.appendChild(entry);
  }

  /**
   * Displays the API's success message on the submission of a resume
   * @param {string} responseData - text to be displayed 
   */
  function successMessage(responseData) {
    showMessage(responseData);
  }

  /**
   * Displays a given message for a period of time. Hides all other views when this happens.
   * @param {string} message - the message to be displayed
   */
  function showMessage(message) {
    const MESSAGE_TIMEOUT = 2000; // length of time messages are displayed
    $("message").innerText = message;
    $("application").classList.add("hidden");
    $("view").classList.add("hidden");
    $("resume").classList.add("hidden");
    $("message").classList.remove("hidden");
    qs('input[name="mode"]:checked').checked = false;
    setTimeout(function () {
      $("message").classList.add("hidden");
    }, MESSAGE_TIMEOUT);
  }

  /**
   * Collects all the values from a NodeList and puts it into an array.
   * @param {object} list - NodeList containing the values 
   * @returns {object} - The array containing the NodeList values
   */
  function getValuesFromNodeList(list) {
    let arr = [];
    for (let i = 0; i < list.length; i++) {
      arr.push(list[i].value);
    }
    return arr;
  }

  /**
   * Returns an array of elements by their name
   * @param {string} name - The name of the element 
   * @returns {object} -an array of elements
   */
  function getByName(name) {
    return document.getElementsByName(name);
  }

  /**
 * Helper function to return the response's result text if successful, otherwise
 * returns the rejected Promise result with an error status and corresponding text
 * @param {object} response - response to check for success/error
 * @returns {object} - valid result text if response was successful, otherwise rejected
 *                     Promise result
 */
  function checkStatus(response) {
    const OK = 200;
    const ERROR = 300;
    let responseText = response.text();
    if (response.status >= OK && response.status < ERROR || response.status === 0) {
      return responseText;
    } else {
      return responseText.then(Promise.reject.bind(Promise));
    }
  }

  /**
   * Creates a table row with the given data
   * @param {string} data - the information the table row will contain
   * @returns {object} - the table row generated
   */
  function addTableData(data) {
    let td = document.createElement("td");
    td.innerText = data;
    return td;
  }

  /**
   * Helper function that returns the first element given by the query
   * @param {string} query - Query for the element
   * @returns {object} - the element given by the query 
   */
  function qs(query) {
    return document.querySelector(query);
  }

  /**
   * Helper function that returns an array of the given elements designated by the query
   * @param {String} query - Query for the element
   * @returns {object} - an array of the selected elements
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Helper function to find an element by its id
   * @param {string} id - The id of the element
   * @returns {object} - the element given by the id
   */
  function $(id) {
    return document.getElementById(id);
  }
})();