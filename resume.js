(function () {

  let jobCount = 1;

  window.addEventListener("load", initialize);

  function initialize() {
    $("mode-radio").addEventListener("click", changeDisplay);
    $("add-job").addEventListener("click", addJob);
  }

  function changeDisplay() {
    let selected = qs('input[name="mode"]:checked').value;
    if (selected === "submission") {
      $("application").classList.remove("hidden");
    } else {
      $("application").classList.add("hidden");
    }
  }

  function addJob() {
    let newJob = document.createElement("div");
    // for (let i = 0; i < $("job" + jobCount).childNodes.length; i++) {
    //   newJob.appendChild($("job" + jobCount).childNodes[i]);
    // }
    newJob.innerHTML = $("job" + jobCount).innerHTML;
    jobCount++;
    newJob.classList.add("job");
    newJob.id = "job" + jobCount;
    $("work-history").appendChild(newJob);
  }

  function qs(query) {
    return document.querySelector(query);
  }

  function $(id) {
    return document.getElementById(id);
  }
})();