import { automaton } from "../automaton-drawer";
import { updateAutomatonFromForm } from "./form-handler-test";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dfaTestButton").addEventListener("click", testDFA);
});

function simulateDFA(inputString, automaton) {
  let currentState = automaton.initialState;

  for (let symbol of inputString) {
    if (!automaton.alphabet.includes(symbol)) {
      return "String mengandung simbol yang tidak valid!";
    }
    if (
      automaton.transitions[currentState] &&
      automaton.transitions[currentState][symbol]
    ) {
      currentState = automaton.transitions[currentState][symbol];
    } else {
      return "Rejected";
    }
  }

  // Periksa apakah state akhir termasuk dalam daftar finalStates
  return automaton.finalStates.includes(currentState) ? "Accepted" : "Rejected";
}

function testDFA() {
  const inputString = document.getElementById("dfaInput").value;
  const resultDiv = document.getElementById("dfaResult");
  const automatonType = "dfa";

  updateAutomatonFromForm(automatonType);
  const result = simulateDFA(inputString, automaton);

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

function convertTransitions(transitionArray) {
  let transitionMap = {};
  transitionArray.forEach((transition) => {
    if (!transitionMap[transition.state]) {
      transitionMap[transition.state] = {};
    }
    transitionMap[transition.state][transition.symbol] =
      transition.nextStates[0];
  });
  return transitionMap;
}
