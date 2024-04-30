import { automaton } from "../automaton-drawer";
import { minimizedAutomaton } from "./dfa-minimizer";

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("testButtonOriginal")
    .addEventListener("click", function () {
      testDFA(automaton, "testStringOriginal", "resultOriginal");
    });
  document
    .getElementById("testButtonMinimized")
    .addEventListener("click", function () {
      testDFA(minimizedAutomaton, "testStringMinimized", "resultMinimized");
    });
});

function testDFA(dfa, inputId, resultId) {
  if (!dfa) {
    document.getElementById(resultId).innerText = "DFA not defined.";
    return;
  }

  const inputString = document.getElementById(inputId).value;
  let currentState = dfa.initialState;

  for (let symbol of inputString) {
    let foundTransition = false;
    for (let transition of dfa.transitions) {
      if (transition.state === currentState && transition.symbol === symbol) {
        currentState = transition.nextStates[0];
        foundTransition = true;
        break;
      }
    }
    if (!foundTransition) {
      document.getElementById(resultId).innerText =
        "Input rejected: no valid transition for " + symbol;
      return;
    }
  }

  const resultElement = document.getElementById(resultId);

  if (dfa.finalStates.includes(currentState)) {
    resultElement.innerText = "Input accepted.";
    resultElement.className = "bg-green-100 text-green-700 p-2 rounded"; 
  } else {
    resultElement.innerText = "Input rejected.";
    resultElement.className = "bg-red-100 text-red-700 p-2 rounded"; 
  }
}
