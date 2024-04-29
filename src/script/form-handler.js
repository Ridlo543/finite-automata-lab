import { automaton } from "./automaton-drawer";

export function updateAutomatonFromForm() {
  const automataForm = document.getElementById("automataForm");
  automaton.states = automataForm.states.value.split(",").map((s) => s.trim());
  automaton.alphabet = automataForm.alphabet.value
    .split(",")
    .map((s) => s.trim());
  automaton.initialState = automataForm.initialState.value.trim();
  automaton.finalStates = automataForm.finalState.value
    .split(",")
    .map((s) => s.trim());
  automaton.transitions = getTransitionsFromForm(
    automaton.states,
    automaton.alphabet
  );
}

export function getTransitionsFromForm(states, alphabet) {
  let transitions = [];
  states.forEach((state) => {
    alphabet.forEach((symbol) => {
      let input = document.getElementById(`transition_${state}_${symbol}`);
      let nextStates =
        input && input.value ? input.value.split(",").map((s) => s.trim()) : [];
      if (nextStates.length) {
        transitions.push({ state, symbol, nextStates });
      }
    });
  });
  return transitions;
}

export function createTransitionInputs() {
  updateAutomatonConfig();
  const transitionsDiv = document.getElementById("transitionsDiv");
  transitionsDiv.innerHTML = generateTransitionTableHTML(
    automaton.states,
    automaton.alphabet
  );
}

export function updateAutomatonConfig() {
  automaton.states = document
    .getElementById("states")
    .value.split(",")
    .map((s) => s.trim());
  automaton.alphabet = document
    .getElementById("alphabet")
    .value.split(",")
    .map((s) => s.trim());
}

export function generateTransitionTableHTML(states, alphabet) {
  let tableHTML = `<table class="divide-y w-full rounded-lg divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State \\ Symbol</th>`;
  alphabet.forEach((symbol) => {
    tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">${symbol}</th>`;
  });
  tableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  states.forEach((state) => {
    tableHTML += `<tr><td class="border border-gray-300 px-6 py-3">${state}</td>`;
    alphabet.forEach((symbol) => {
      tableHTML += `<td class="border border-gray-300"><input id="transition_${state}_${symbol}" type="text" class="w-full border px-6 py-3" placeholder="Enter states separated by comma" /></td>`;
    });
    tableHTML += `</tr>`;
  });
  return (tableHTML += `</tbody></table>`);
}
