// util.js
import { automaton } from "./automaton-drawer";
import { updateAutomatonConfig, createTransitionInputs } from "./form-handler";
import { minimizedAutomaton } from "./dfa-minimizer";

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("exampleButton")) return;

  document
    .getElementById("exampleButton")
    .addEventListener("click", fillExampleData);

  if (!document.getElementById("resetButton")) return;
  document
    .getElementById("resetButton")
    .addEventListener("click", resetFormAndGraphs);
});

function fillExampleData() {
  const exampleData = {
    states: "A,B,C,D,E,F,G,H",
    alphabet: "0,1",
    initialState: "A",
    finalStates: "E",
    transitions: {
      A: { 0: "C", 1: "D" },
      B: { 0: "H", 1: "D" },
      C: { 0: "F", 1: "E" },
      D: { 0: "E", 1: "F" },
      E: { 0: "A", 1: "E" },
      F: { 0: "F", 1: "B" },
      G: { 0: "E", 1: "F" },
      H: { 0: "F", 1: "E" },
    },
  };

  // Mengisi formulir dengan data contoh
  document.getElementById("states").value = exampleData.states;
  document.getElementById("alphabet").value = exampleData.alphabet;
  document.getElementById("initialState").value = exampleData.initialState;
  document.getElementById("finalState").value = exampleData.finalStates;

  // Memanggil fungsi untuk mengupdate automaton config dan membuat input transisi
  updateAutomatonConfig();
  createTransitionInputs();

  // Mengisi transisi berdasarkan contoh
  for (const [state, transitions] of Object.entries(exampleData.transitions)) {
    for (const [symbol, nextState] of Object.entries(transitions)) {
      const transitionId = `transition_${state}_${symbol}`;
      document.getElementById(transitionId).value = nextState;
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

  // Mengosongkan div grafik DFA asli dan yang diminimalkan
  const graphResult = document.getElementById("graphResult");
  if (graphResult) {
    graphResult.innerHTML = "";
  }
  const minimizedGraphDiv = document.getElementById("minimizedGraphDiv");
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

export function isFormDataValid(automaton) {
  // Periksa apakah states, alphabet, initial state, dan final states diisi
  if (
    !automaton.states.length ||
    !automaton.alphabet.length ||
    !automaton.initialState ||
    !automaton.finalStates.length
  ) {
    return false;
  }
  // Periksa apakah setiap transisi memiliki state tujuan
  for (const transition of automaton.transitions) {
    if (!transition.nextStates.every((state) => state)) {
      return false;
    }
  }
  return true;
}
