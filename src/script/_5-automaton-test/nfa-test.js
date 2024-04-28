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
  const automatonType = "nfa";

  updateAutomatonFromForm(automatonType);

  // Memanggil fungsi simulasi NFA yang sudah diadaptasi
  const result = simulateNFA(inputString, automaton);
  document.getElementById(
    "nfaResult"
  ).innerText = `String (${inputString}): ${result}`;
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
