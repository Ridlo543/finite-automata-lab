import { automaton } from "../automaton-drawer";
import { updateAutomatonFromForm } from "./form-handler-test";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("enfaTestButton").addEventListener("click", testENFA);
});

function simulateENFA(inputString, automaton) {
  let currentStates = [automaton.initialState];

  for (let symbol of inputString) {
    if (!automaton.alphabet.includes(symbol) && symbol !== "ε") {
      return "String contains invalid symbols!";
    }

    let nextStates = [];
    for (let state of currentStates) {
      // Ambil transisi untuk simbol saat ini dan epsilon (jika ada)
      let symbolTransitions = automaton.transitions[state][symbol] || [];
      let epsilonTransitions = automaton.transitions[state]["ε"] || [];

      // Periksa apakah transisi adalah array atau single state, lalu concat
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
  updateAutomatonFromForm("enfa"); // Asumsi Anda telah memperbarui `automaton` berdasarkan input

  const result = simulateENFA(inputString, automaton);
  document.getElementById(
    "enfaResult"
  ).innerText = `String (${inputString}): ${result}`;
}
