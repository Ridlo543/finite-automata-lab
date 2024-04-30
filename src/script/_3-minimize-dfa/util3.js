import { automaton } from "../automaton-drawer";
import { updateAutomatonConfig, createTransitionInputs } from "../form-handler";
import { minimizedAutomaton } from "./dfa-minimizer";
import examples from "./3-example.json";

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("exampleButton")) return;

  document
    .getElementById("exampleButton")
    .addEventListener("click", fillExampleDataDFA3);

  if (!document.getElementById("resetButton")) return;
  document
    .getElementById("resetButton")
    .addEventListener("click", resetFormAndGraphs);
});
function fillExampleDataDFA3() {
  const exampleData = examples[Math.floor(Math.random() * examples.length)];

  document.getElementById("states").value = exampleData.states;
  document.getElementById("alphabet").value = exampleData.alphabet;
  document.getElementById("initialState").value = exampleData.initialState;
  document.getElementById("finalState").value = exampleData.finalStates.join(","); // Gabungkan array ke string

  updateAutomatonConfig();
  createTransitionInputs();

  // Mengisi transisi berdasarkan contoh
  for (const [state, transitions] of Object.entries(exampleData.transitions)) {
    for (const [symbol, nextStateArray] of Object.entries(transitions)) {
      const transitionId = `transition_${state}_${symbol}`;
      document.getElementById(transitionId).value = nextStateArray.join(","); // Gabungkan array ke string
    }
  }
}


function resetFormAndGraphs() {
  // Mengosongkan semua input di form
  document.getElementById("states").value = "";
  document.getElementById("alphabet").value = "";
  document.getElementById("initialState").value = "";
  document.getElementById("finalState").value = "";
  const transitionsDiv = document.getElementById("transitionsDiv");
  if (transitionsDiv) {
    transitionsDiv.innerHTML = ""; // Menghapus isi div transisi
  }

  const testDfaContent = document.getElementById("testDfaContent");
  if (testDfaContent) {
    testDfaContent.classList.add("hidden");
  }

  // Mengosongkan div grafik DFA asli dan yang diminimalkan
  const graphResult = document.getElementById("graphResult");
  if (graphResult) {
    graphResult.innerHTML = "";
  }
  const minimizedGraphDiv = document.getElementById("minimizedGraph");
  if (minimizedGraphDiv) {
    minimizedGraphDiv.innerHTML = "";
  }
  const equivalenceSteps = document.getElementById("equivalenceSteps");
  if (equivalenceSteps) {
    equivalenceSteps.innerHTML = "";
  }
  const tableFillingSteps = document.getElementById("tableFillingSteps");
  if (tableFillingSteps) {
    tableFillingSteps.innerHTML = "";
  }

  // Reset automaton properties without reassigning it
  automaton.states = [];
  automaton.alphabet = [];
  automaton.transitions = [];
  automaton.initialState = "";
  automaton.finalStates = [];

  // Reset minimizedAutomaton if it exists
  if (minimizedAutomaton) {
    minimizedAutomaton.states = [];
    minimizedAutomaton.alphabet = [];
    minimizedAutomaton.transitions = [];
    minimizedAutomaton.initialState = "";
    minimizedAutomaton.finalStates = [];
  }
}
