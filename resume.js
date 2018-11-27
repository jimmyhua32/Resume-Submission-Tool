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
    if (selected === "submission") {
      $("application").classList.remove("hidden");
      $("view").classList.add("hidden");
    } else {
      $("view").classList.remove("hidden");
      $("application").classList.add("hidden");
    }
  }

  function addJob() {
    let newJob = document.createElement("div");
    newJob.innerHTML = $("job" + jobCount).innerHTML;
    jobCount++;
    newJob.classList.add("job");
    newJob.id = "job" + jobCount;
    $("work-history").appendChild(newJob);
  }

  function submitForm() {
    let parameters = [];
    for (let i = 0; i < NUM_CONTACT_FIELDS; i++) {
      parameters.push(getByName(FIELDS[i])[0].value);
    }
    for (let i = 0; i < FIELDS.length - NUM_CONTACT_FIELDS; i++) {
      parameters.push(getValuesFromNodeList(getByName(FIELDS[i])));
    }
    let application = new FormData();
    application.append("data", JSON.stringify(parameters));
    fetch(URL, { method: "POST", body: application })
      .then(checkStatus)
      .then(successMessage)
      .catch(showMessage);
  }

  function successMessage(responseData) {
    showMessage(responseData);
  }

  function showMessage(message) {
    $("message").innerText = message;
    $("application").classList.add("hidden");
    $("view").classList.add("hidden");
    $("message").classList.remove("hidden");
    // setTimeout(function () {
    //   $("message").classList.add("hidden");
    // }, 2000);
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

  function qs(query) {
    return document.querySelector(query);
  }

  function $(id) {
    return document.getElementById(id);
  }
})();