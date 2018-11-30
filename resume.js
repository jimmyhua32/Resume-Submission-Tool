(function () {

  const URL = "resume.php";
  const FIELDS = ["firstname", "lastname", "email", "jobtitle", "employer",
    "datestart", "dateend", "desc"];
  const NUM_CONTACT_FIELDS = 3;

  let jobCount = 1;

  window.addEventListener("load", initialize);

  function initialize() {
    $("mode-radio").addEventListener("input", changeDisplay);
    $("add-job").addEventListener("click", addJob);
    $("apply").onsubmit = function () {
      submitForm();
      return false;
    }
  }

  function changeDisplay() {
    let selected = qs('input[name="mode"]:checked').value;
    $("resume").classList.add("hidden");
    if (selected === "submission") {
      $("application").classList.remove("hidden");
      $("view").classList.add("hidden");
    } else {
      $("view").classList.remove("hidden");
      $("application").classList.add("hidden");
      updateResumes();
    }
  }

  function addJob() {
    let newJob = document.createElement("div");
    newJob.innerHTML = $("job1").innerHTML;
    jobCount++;
    newJob.classList.add("job");
    newJob.id = "job" + jobCount;
    $("work-history").appendChild(newJob);
  }

  function submitForm() {
    // add a check for valid parameters and alerting the user first
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

  function updateResumes() {
    let url = URL + "?type=all";
    fetch(url)
      .then(checkStatus)
      .then(JSON.parse)
      .then(parseResumes)
      .catch(showMessage);
  }

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
  }

  function getResume() {
    qs('input[name="mode"]:checked').checked = false;
    $("view").classList.add("hidden");
    $("resume").classList.remove("hidden");
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
  }

  function addEntry(parent, stringEntry) {
    let entry = document.createElement("p");
    entry.innerText = stringEntry;
    parent.appendChild(entry);
  }

  function successMessage(responseData) {
    showMessage(responseData);
  }

  function showMessage(message) {
    const MESSAGE_TIMEOUT = 2000;
    $("message").innerText = message;
    $("application").classList.add("hidden");
    $("view").classList.add("hidden");
    $("message").classList.remove("hidden");
    qs('input[name="mode"]:checked').checked = false;
    setTimeout(function () {
      $("message").classList.add("hidden");
    }, MESSAGE_TIMEOUT);
  }

  function getValuesFromNodeList(list) {
    let arr = [];
    for (let i = 0; i < list.length; i++) {
      arr.push(list[i].value);
    }
    return arr;
  }

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

  function addTableData(data) {
    let td = document.createElement("td");
    td.innerText = data;
    return td;
  }

  function qs(query) {
    return document.querySelector(query);
  }

  function $(id) {
    return document.getElementById(id);
  }
})();