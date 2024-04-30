// nfa-test.js

import { automaton } from "../automaton-drawer";
import { updateAutomatonFromForm } from "./form-handler-test";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nfaTestButton").addEventListener("click", testNFA);
});

function simulateNFA(inputString, automaton) {
  let currentStates = [automaton.initialState];
  for (let symbol of inputString) {
    let nextStates = [];
    for (let state of currentStates) {
      let transitions = automaton.transitions[state][symbol];
      if (transitions) {
        nextStates = nextStates.concat(transitions);
      }
    }
    currentStates = nextStates;
  }
  return currentStates.some((state) => automaton.finalStates.includes(state))
    ? "Accepted"
    : "Rejected";
}

function testNFA() {
  const inputString = document.getElementById("nfaInput").value;
  const resultDiv = document.getElementById("nfaResult");
  const automatonType = "nfa";

  updateAutomatonFromForm(automatonType);
  const result = simulateNFA(inputString, automaton);

  if (result === "Accepted") {
    resultDiv.innerHTML = `String "${inputString}": <span class="text-green-800 font-bold">Accepted</span>`;
    resultDiv.classList.remove("bg-red-100", "text-red-600");
    resultDiv.classList.add("bg-green-100", "text-green-600");
  } else {
    resultDiv.innerHTML = `String "${inputString}": <span class="text-red-800 font-bold">Rejected</span>`;
    resultDiv.classList.remove("bg-green-100", "text-green-600");
    resultDiv.classList.add("bg-red-100", "text-red-600");
  }
}

function convertTransitionsNFA(transitionArray) {
  let transitionMap = {};
  transitionArray.forEach((transition) => {
    if (!transitionMap[transition.state]) {
      transitionMap[transition.state] = {};
    }
    transitionMap[transition.state][transition.symbol] = transition.nextStates;
  });
  return transitionMap;
}
