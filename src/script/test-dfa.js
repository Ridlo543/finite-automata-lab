import { automaton } from "./automaton-drawer";
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

  if (dfa.finalStates.includes(currentState)) {
    document.getElementById(resultId).innerText = "Input accepted.";
  } else {
    document.getElementById(resultId).innerText = "Input rejected.";
  }
}
