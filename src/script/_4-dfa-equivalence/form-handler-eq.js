document.addEventListener("DOMContentLoaded", () => {
  // Handle the form interactions for DFA 1
  setupFormHandlers(
    "automataForm1",
    "states1",
    "alphabet1",
    "initialState1",
    "finalState1",
    "transitionsDiv1"
  );

  // Handle the form interactions for DFA 2
  setupFormHandlers(
    "automataForm2",
    "states2",
    "alphabet2",
    "initialState2",
    "finalState2",
    "transitionsDiv2"
  );
});

function setupFormHandlers(
  formId,
  statesId,
  alphabetId,
  initialStateId,
  finalStateId,
  transitionsDivId
) {
  const automataForm = document.getElementById(formId);
  if (automataForm) {
    automataForm.addEventListener("submit", (e) => {
      e.preventDefault();
      updateAutomatonFromForm(
        statesId,
        alphabetId,
        initialStateId,
        finalStateId,
        formId
      );
      createTransitionInputs(statesId, alphabetId, formId, transitionsDivId);
    });

    document
      .getElementById(statesId)
      .addEventListener("change", () =>
        createTransitionInputs(statesId, alphabetId, formId, transitionsDivId)
      );
    document
      .getElementById(alphabetId)
      .addEventListener("change", () =>
        createTransitionInputs(statesId, alphabetId, formId, transitionsDivId)
      );
  }
}

export function updateAutomatonFromForm(
  statesId,
  alphabetId,
  initialStateId,
  finalStateId,
  formId
) {
  const states = document
    .getElementById(statesId)
    .value.split(",")
    .map((s) => s.trim());
  const alphabet = document
    .getElementById(alphabetId)
    .value.split(",")
    .map((s) => s.trim());
  const initialState = document.getElementById(initialStateId).value.trim();
  const finalStates = document
    .getElementById(finalStateId)
    .value.split(",")
    .map((s) => s.trim());

  let automaton = {
    states: states,
    alphabet: alphabet,
    transitions: getTransitionsFromForm(states, alphabet, formId),
    initialState: initialState,
    finalStates: finalStates,
  };

  return automaton;
}

export function getTransitionsFromForm(states, alphabet, formId) {
  let transitions = [];
  states.forEach((state) => {
    alphabet.forEach((symbol) => {
      const inputId = `transition_${state}_${symbol}`;
      const inputElement = document.querySelector(`#${formId} #${inputId}`);
      const nextStates =
        inputElement && inputElement.value
          ? inputElement.value.split(",").map((s) => s.trim())
          : [];
      transitions.push({
        state: state,
        symbol: symbol,
        nextStates: nextStates,
      });
    });
  });
  return transitions;
}

export function createTransitionInputs(
  statesId,
  alphabetId,
  formId,
  transitionsDivId
) {
  const states = document
    .getElementById(statesId)
    .value.split(",")
    .map((s) => s.trim());
  const alphabet = document
    .getElementById(alphabetId)
    .value.split(",")
    .map((s) => s.trim());
  let automaton = { states, alphabet, transitions: [] };
  const transitionsDiv = document.getElementById(transitionsDivId);
  transitionsDiv.innerHTML = generateTransitionTableHTML(automaton);
}

export function generateTransitionTableHTML(automaton) {
  let tableHTML = `<table class="divide-y w-full rounded-lg divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State \\ Symbol</th>`;
  automaton.alphabet.forEach((symbol) => {
    tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${symbol}</th>`;
  });
  tableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  automaton.states.forEach((state) => {
    tableHTML += `<tr><td class="border border-gray-300 px-6 py-3">${state}</td>`;
    automaton.alphabet.forEach((symbol) => {
      tableHTML += `<td class="border border-gray-300"><input id="transition_${state}_${symbol}" type="text" class="w-full border px-6 py-3" placeholder="Enter states separated by comma" /></td>`;
    });
    tableHTML += `</tr>`;
  });
  return (tableHTML += `</tbody></table>`);
}
