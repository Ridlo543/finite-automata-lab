import { automaton } from "../automaton-drawer";
import { updateAutomatonFromForm } from "./form-handler-test";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("enfaTestButton").addEventListener("click", testENFA);
});

function simulateENFA(inputString, automaton) {
  let currentStates = [automaton.initialState];

  for (let symbol of inputString) {
    if (!automaton.alphabet.includes(symbol) && symbol !== "eps") {
      return "String contains invalid symbols!";
    }

    let nextStates = [];
    for (let state of currentStates) {
      // Ambil transisi untuk simbol saat ini dan epsilon (jika ada)
      let symbolTransitions = automaton.transitions[state][symbol] || [];
      let epsilonTransitions = automaton.transitions[state]["eps"] || [];

      nextStates = nextStates.concat(
        symbolTransitions instanceof Array
          ? symbolTransitions
          : [symbolTransitions]
      );
      nextStates = nextStates.concat(
        epsilonTransitions instanceof Array
          ? epsilonTransitions
          : [epsilonTransitions]
      );
    }

    // Menghapus duplikasi state untuk iterasi selanjutnya
    currentStates = Array.from(new Set(nextStates));
  }

  // Cek apakah salah satu dari keadaan saat ini merupakan keadaan akhir
  return currentStates.some((state) => automaton.finalStates.includes(state))
    ? "Accepted"
    : "Rejected";
}

function testENFA() {
  const inputString = document.getElementById("enfaInput").value;
  const resultDiv = document.getElementById("enfaResult");

  updateAutomatonFromForm("enfa");
  const result = simulateENFA(inputString, automaton);

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
