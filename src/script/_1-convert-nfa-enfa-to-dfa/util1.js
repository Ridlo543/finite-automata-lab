import examples from "./1-example.json";
import {
  updateAutomatonConfig,
  createTransitionInputs,
} from "@script/form-handler";

document.addEventListener("DOMContentLoaded", () => {
  const exampleButton = document.getElementById("exampleButton");
  const resetButton = document.getElementById("resetButton");

  exampleButton.addEventListener("click", () => {
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    fillFormWithData(randomExample);
  });

  resetButton.addEventListener("click", () => {
    resetForm();
  });
});

function fillFormWithData(data) {
  document.getElementById("states").value = data.states;
  document.getElementById("alphabet").value = data.alphabet;
  document.getElementById("initialState").value = data.initialState;
  document.getElementById("finalState").value = Array.isArray(data.finalStates)
    ? data.finalStates.join(",")
    : data.finalStates;

  // Update automaton configuration to reflect the new form data
  updateAutomatonConfig();

  // Create input fields for transitions based on the new configuration
  createTransitionInputs();

  // Fill in the transition values
  fillTransitionInputs(data.transitions);
}

function fillTransitionInputs(transitions) {
  for (const [state, transition] of Object.entries(transitions)) {
    for (const [symbol, nextStateArray] of Object.entries(transition)) {
      const transitionInputId = `transition_${state}_${symbol}`;
      const transitionInputElement = document.getElementById(transitionInputId);
      if (transitionInputElement) {
        transitionInputElement.value = nextStateArray.join(",");
      }
    }
  }
}

function resetForm() {
  // document.getElementById("automataForm").reset();
  // document.getElementById("transitionsDiv").innerHTML = '';

  const automataForm = document.getElementById("automataForm");
  const transitionsDiv = document.getElementById("transitionsDiv");
  const graphNFA = document.getElementById("graphNFA");
  const graphDFA = document.getElementById("graphDFA");
  const dfaTable = document.getElementById("dfaTable");

  if (automataForm) automataForm.reset();
  if (transitionsDiv) transitionsDiv.innerHTML = "";
  if (graphNFA) graphNFA.innerHTML = "";
  if (graphDFA) graphDFA.innerHTML = "";
  if (dfaTable) dfaTable.innerHTML = "";
}
