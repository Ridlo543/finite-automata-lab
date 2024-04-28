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

  const result = matchRegex(pattern, testString);
  document.getElementById(
    "regexResult"
  ).innerText = `String (${testString}): ${result}`;
}
