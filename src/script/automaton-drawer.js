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
  const automataForm = document.getElementById("automataForm");
  if (automataForm) {
    automataForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updateAutomatonFromForm();
      if (isFormDataValid(automaton)) {
        renderGraph(buildGraphDefinition(automaton), "graphResult");
      } else {
        alert(
          "Please fill out all form fields correctly before drawing the graph."
        );
      }
    });

    automataForm.states.addEventListener("change", createTransitionInputs);
    automataForm.alphabet.addEventListener("change", createTransitionInputs);
  }
});

// fungsi untuk mengupdate otomata dari form
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
  graphDiv.innerHTML = "";

  // tambahkan judul grafik sesuai targetDiv
  const title = document.createElement("h2");
  title.textContent =
    targetDiv === "graphResult" ? "Graph Automata" : "Minimized DFA";
  graphDiv.appendChild(title);

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
  let tableHTML = `<table class="divide-y w-full rounded-lg divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State \\ Symbol</th>`;
  alphabet.forEach((symbol) => {
    tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${symbol}</th>`;
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
