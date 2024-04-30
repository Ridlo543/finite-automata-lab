// form-handler-test
import { automaton } from "../automaton-drawer";

const initializedListeners = {};

export function attachChangeListeners(automatonType) {
  if (initializedListeners[automatonType]) {
    return; // Jika listener sudah dipasang, tidak perlu memasang lagi
  }

  document
    .getElementById(automatonType + "States")
    .addEventListener("change", () => {
      updateAutomatonConfig(automatonType);
      createTransitionInputs(automatonType);
    });

  document
    .getElementById(automatonType + "Alphabet")
    .addEventListener("change", () => {
      updateAutomatonConfig(automatonType);
      createTransitionInputs(automatonType);
    });

  initializedListeners[automatonType] = true; // Tandai bahwa listener untuk tipe ini telah dipasang
}

document.querySelectorAll("[data-automaton-type]").forEach((button) => {
  button.addEventListener("click", function () {
    const automatonType = this.getAttribute("data-automaton-type");
    switch (automatonType) {
      case "dfa":
      case "nfa":
      case "enfa":
        updateAutomatonFromForm(automatonType);
        attachChangeListeners(automatonType);
        break;
      case "regex":
        break;
      default:
        console.error("Unknown automaton type");
    }
  });
});

// Pilih automaton berdasarkan ID yang aktif
export function updateAutomatonFromForm(automatonType) {
  const automataForm = document.getElementById(automatonType + "States");
  automaton.states = automataForm.value.split(",").map((s) => s.trim());
  automaton.alphabet = document
    .getElementById(automatonType + "Alphabet")
    .value.split(",")
    .map((s) => s.trim());
  automaton.initialState = document
    .getElementById(automatonType + "InitialState")
    .value.trim();
  automaton.finalStates = document
    .getElementById(automatonType + "FinalStates")
    .value.split(",")
    .map((s) => s.trim());
  automaton.transitions = getTransitionsFromForm(
    automaton.states,
    automaton.alphabet,
    automatonType
  );
}

export function getTransitionsFromForm(states, alphabet, automatonType) {
  let transitions = {};
  states.forEach((state) => {
    transitions[state] = {};
    alphabet.forEach((symbol) => {
      let inputId = `transition_${automatonType}_${state}_${symbol}`;
      let inputElement = document.getElementById(inputId);
      if (inputElement) {
        // Untuk NFA, bisa jadi ada banyak next states, pisahkan dengan koma
        let nextStates = inputElement.value.split(",").map((s) => s.trim());
        transitions[state][symbol] =
          nextStates.length > 1 ? nextStates : nextStates[0];
      }
    });
  });
  return transitions;
}

export function createTransitionInputs(automatonType) {
  updateAutomatonConfig(automatonType);
  const transitionsDiv = document.getElementById(
    automatonType + "TransitionsDiv"
  );
  transitionsDiv.innerHTML = generateTransitionTableHTML(
    automaton.states,
    automaton.alphabet,
    automatonType
  );
}

export function updateAutomatonConfig(automatonType) {
  automaton.states = document
    .getElementById(automatonType + "States")
    .value.split(",")
    .map((s) => s.trim());
  automaton.alphabet = document
    .getElementById(automatonType + "Alphabet")
    .value.split(",")
    .map((s) => s.trim());
}

export function generateTransitionTableHTML(states, alphabet, automatonType) {
  let tableHTML = `<table class="divide-y w-full rounded-lg divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State \\ Symbol</th>`;
  alphabet.forEach((symbol) => {
    tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">${symbol}</th>`;
  });
  tableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  states.forEach((state) => {
    tableHTML += `<tr><td class="border border-gray-300 px-6 py-3">${state}</td>`;
    alphabet.forEach((symbol) => {
      tableHTML += `<td class="border border-gray-300"><input id="transition_${automatonType}_${state}_${symbol}" type="text" class="w-full border px-6 py-3" placeholder="Enter states separated by comma" /></td>`;
    });
    tableHTML += `</tr>`;
  });
  return (tableHTML += `</tbody></table>`);
}
