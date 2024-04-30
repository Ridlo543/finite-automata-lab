import regexExamples from "./2-example.json";

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("exampleRegexButton")
    .addEventListener("click", fillExampleRegex);
  document
    .getElementById("resetRegexButton")
    .addEventListener("click", resetRegexForm);
});

function fillExampleRegex() {
  const example =
    regexExamples[Math.floor(Math.random() * regexExamples.length)];
  document.getElementById("regexPattern").value = example.pattern;
}

function resetRegexForm() {
  const formRegex = document.getElementById("formRegex");
  const nfaResult = document.getElementById("nfaResult");
  const graphRegexNFA = document.getElementById("graphRegexNFA");

  if (formRegex) formRegex.reset();
  if (nfaResult) nfaResult.innerHTML = "";
  if (graphRegexNFA) graphRegexNFA.innerHTML = "";
}
