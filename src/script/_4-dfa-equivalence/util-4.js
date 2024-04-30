import { createTransitionInputs } from "./form-handler-eq";
import examples from "./4-example.json";
document.addEventListener("DOMContentLoaded", () => {
  ["1", "2"].forEach((num) => {
    document
      .getElementById(`exampleButton${num}`)
      .addEventListener("click", function () {
        const example = examples[Math.floor(Math.random() * examples.length)];
        fillFormWithData(example, `automataForm${num}`);
      });

    document
      .getElementById(`resetButton${num}`)
      .addEventListener("click", function () {
        resetForm(`automataForm${num}`);
      });
  });
});

function fillFormWithData(data, formId) {
  const form = document.getElementById(formId);

  const suffix = formId.replace("automataForm", "");

  form.querySelector(`#states${suffix}`).value = data.states;
  form.querySelector(`#alphabet${suffix}`).value = data.alphabet;
  form.querySelector(`#initialState${suffix}`).value = data.initialState;
  form.querySelector(`#finalState${suffix}`).value = data.finalStates.join(",");

  createTransitionInputs(
    `states${suffix}`,
    `alphabet${suffix}`,
    formId,
    `transitionsDiv${suffix}`
  );

  // Fungsi ini mengasumsikan bahwa transisi sudah didefinisikan dalam data yang diberikan
  fillTransitionInputs(data.transitions, formId, suffix);
}

function fillTransitionInputs(transitions, formId, suffix) {
  Object.entries(transitions).forEach(([state, symbols]) => {
    Object.entries(symbols).forEach(([symbol, nextStates]) => {
      const inputId = `transition_${state}_${symbol}`;
      const inputElement = document.querySelector(`#${formId} #${inputId}`);
      if (inputElement) {
        // Cek apakah nextStates adalah array, jika tidak, ubah menjadi array
        const statesValue = Array.isArray(nextStates) ? nextStates.join(",") : nextStates;
        inputElement.value = statesValue;
      }
    });
  });
}


function resetForm(formId) {
  const form = document.getElementById(formId);
  form.querySelector("#states" + formId.charAt(formId.length - 1)).value = "";
  form.querySelector("#alphabet" + formId.charAt(formId.length - 1)).value = "";
  form.querySelector("#initialState" + formId.charAt(formId.length - 1)).value =
    "";
  form.querySelector("#finalState" + formId.charAt(formId.length - 1)).value =
    "";

  const transitionsDivId = `transitionsDiv${formId.charAt(formId.length - 1)}`;
  document.getElementById(transitionsDivId).innerHTML = "";
}

export function isFormValid(
  statesId,
  alphabetId,
  initialStateId,
  finalStateId
) {
  const statesInput = document.getElementById(statesId).value.trim();
  const alphabetInput = document.getElementById(alphabetId).value.trim();
  const initialStateInput = document
    .getElementById(initialStateId)
    .value.trim();
  const finalStatesInput = document.getElementById(finalStateId).value.trim();

  // Memeriksa apakah ada bidang yang kosong
  if (
    !statesInput ||
    !alphabetInput ||
    !initialStateInput ||
    !finalStatesInput
  ) {
    alert("Please fill all the fields.");
    return false;
  }

  const states = statesInput.split(",").map((s) => s.trim());
  const alphabet = alphabetInput.split(",").map((s) => s.trim());
  const finalStates = finalStatesInput.split(",").map((s) => s.trim());

  // Memeriksa apakah states dan alphabet setidaknya memiliki satu elemen
  if (states.length === 0 || alphabet.length === 0) {
    alert("States and alphabet must contain at least one element.");
    return false;
  }

  // Memeriksa apakah initial state ada di dalam daftar states
  if (!states.includes(initialStateInput)) {
    alert("Initial state must be one of the defined states.");
    return false;
  }

  // Memeriksa apakah semua final states ada dalam daftar states
  for (let state of finalStates) {
    if (!states.includes(state)) {
      alert("All final states must be included in the states list.");
      return false;
    }
  }

  return true; // Semua pemeriksaan valid
}
