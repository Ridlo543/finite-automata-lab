document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("regexTestButton")
    .addEventListener("click", testRegex);
});

function matchRegex(regex, testString) {
  return new RegExp(regex).test(testString);
}

function testRegex() {
  const pattern = document.getElementById("regexPattern").value;
  const testString = document.getElementById("regexInput").value;

  const resultDiv = document.getElementById("regexResult");
  const result = matchRegex(pattern, testString);

  if (result) {
    resultDiv.innerHTML = `String "${testString}": <span class="text-green-800 font-bold">Accepted</span>`;
    resultDiv.classList.remove("bg-red-100", "text-red-600");
    resultDiv.classList.add("bg-green-100", "text-green-600");
  } else {
    resultDiv.innerHTML = `String "${testString}": <span class="text-red-800 font-bold">Rejected</span>`;
    resultDiv.classList.remove("bg-green-100", "text-green-600");
    resultDiv.classList.add("bg-red-100", "text-red-600");
  }
}
