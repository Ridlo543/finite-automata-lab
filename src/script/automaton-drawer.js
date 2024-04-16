// automaton-drawer.js
import mermaid from "mermaid";
import { isFormDataValid } from "./util";

mermaid.initialize({
  startOnLoad: true,
});

export let automaton = {
  states: [],
  alphabet: [],
  transitions: [],
  initialState: "",
  finalStates: [],
};

document.addEventListener("DOMContentLoaded", () => {
  const dfaForm = document.getElementById("dfaForm");
  dfaForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateAutomatonFromForm();
    if (isFormDataValid(automaton)) {
      renderGraph(buildGraphDefinition(automaton), "originalGraphDiv");
    } else {
      alert(
        "Please fill out all form fields correctly before drawing the graph."
      );
    }
  });
  dfaForm.states.addEventListener("change", createTransitionInputs);
  dfaForm.alphabet.addEventListener("change", createTransitionInputs);
});

// fungsi untuk mengupdate otomata dari form
export function updateAutomatonFromForm() {
  const dfaForm = document.getElementById("dfaForm");
  automaton.states = dfaForm.states.value.split(",").map((s) => s.trim());
  automaton.alphabet = dfaForm.alphabet.value.split(",").map((s) => s.trim());
  automaton.initialState = dfaForm.initialState.value.trim();
  automaton.finalStates = dfaForm.finalState.value
    .split(",")
    .map((s) => s.trim());
  automaton.transitions = getTransitionsFromForm(
    automaton.states,
    automaton.alphabet
  );
}

// fungsi untuk mendapatkan transisi dari form
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

// fungsi untuk membangun definisi grafik
export function buildGraphDefinition({
  states,
  transitions,
  initialState,
  finalStates,
}) {
  let mermaidDef = "graph LR\n";
  mermaidDef += `    start --> ${initialState}\n`;

  transitions.forEach(({ state, symbol, nextStates }) => {
    nextStates.forEach((nextState) => {
      if (nextState) {
        mermaidDef += `    ${state} -->|${symbol}| ${nextState}\n`;
      }
    });
  });

  states.forEach((state) => {
    if (initialState === state) {
      // Initial state with a single circle (already has an arrow pointing to it)
      mermaidDef += `    ${state}(${state})\n`;
    } else if (finalStates.includes(state)) {
      // Final state with a double circle
      mermaidDef += `    ${state}((("${state}")))\n`;
    } else {
      // Regular state with a single circle
      mermaidDef += `    ${state}(${state})\n`;
    }
  });

  return mermaidDef;
}

// fungsi untuk merender grafik
export function renderGraph(graphDefinition, targetDiv) {
  const graphDiv = document.getElementById(targetDiv);
  graphDiv.innerHTML = ""; // Bersihkan grafik sebelumnya

  try {
    const graphContainer = document.createElement("div");
    graphContainer.className = "mermaid";
    graphContainer.textContent = graphDefinition;
    graphDiv.appendChild(graphContainer);
    mermaid.init(undefined, graphContainer);
  } catch (error) {
    graphDiv.textContent = "Error drawing the graph: " + error.message;
  }
}

// TRANSITION INPUTS CREATION

//  fungsi untuk membuat input transisi
export function createTransitionInputs() {
  updateAutomatonConfig();
  const transitionsDiv = document.getElementById("transitionsDiv");
  transitionsDiv.innerHTML = generateTransitionTableHTML(
    automaton.states,
    automaton.alphabet
  );
}

//  fungsi untuk mengupdate konfigurasi otomata
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

//  fungsi untuk menghasilkan tabel transisi dalam bentuk HTML
export function generateTransitionTableHTML(states, alphabet) {
  let tableHTML = `<table class="divide-y w-full divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State \\ Symbol</th>`;
  alphabet.forEach((symbol) => {
    tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${symbol}</th>`;
  });
  tableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  states.forEach((state) => {
    tableHTML += `<tr><td class="border border-gray-300">${state}</td>`;
    alphabet.forEach((symbol) => {
      tableHTML += `<td class="border border-gray-300"><input id="transition_${state}_${symbol}" type="text" class="w-full border p-2" placeholder="Enter states separated by comma" /></td>`;
    });
    tableHTML += `</tr>`;
  });
  return (tableHTML += `</tbody></table>`);
}
