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
  const automatonType = "dfa";

  // Memperbarui konfigurasi automaton berdasarkan input form terbaru
  updateAutomatonFromForm(automatonType);
  console.log(automaton);

  const result = simulateDFA(inputString, automaton);
  document.getElementById(
    "dfaResult"
  ).innerText = `String (${inputString}): ${result}`;
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
