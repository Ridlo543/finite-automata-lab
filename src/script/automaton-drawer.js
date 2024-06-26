// automaton-drawer.js
import { updateAutomatonFromForm } from "./form-handler";
import mermaid from "mermaid";
import { convertTransition, isFormDataValid } from "./util";

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
  const drawGraphButton = document.getElementById("drawGraphButton");

  if (drawGraphButton) {
    drawGraphButton.addEventListener("click", () => {
      updateAutomatonFromForm();
      if (isFormDataValid(automaton)) {
        console.log("Automaton: ", automaton);
        console.log("Transisi Automaton: ", convertTransition(automaton));
        renderGraph(buildGraphDefinition(automaton), "graphResult");
      } else {
        alert(
          "Please fill out all form fields correctly before drawing the graph."
        );
      }
    });
  }
});

export function buildGraphDefinition(automaton) {
  const { states, transitions, initialState, finalStates } = automaton;
  let mermaidDef = "graph LR\n";
  mermaidDef += `    start --> ${initialState}\n`;

  // Define transitions
  transitions.forEach(({ state, symbol, nextStates }) => {
    nextStates.forEach((nextState) => {
      if (nextState) {
        mermaidDef += `    ${state} -->|${symbol}| ${nextState}\n`;
      }
    });
  });

  // Define states appearance
  states.forEach((state) => {
    if (initialState === state && finalStates.includes(state)) {
      // State is both initial and final
      mermaidDef += `    ${state}(((${state})))\n`; // Double circle for initial and final state
    } else if (finalStates.includes(state)) {
      // Final state with a double circle
      mermaidDef += `    ${state}(((${state})))\n`;
    } else if (initialState === state) {
      // Initial state with a single circle
      mermaidDef += `    ${state}(("${state}"))\n`;
    } else {
      // Regular state with a single circle
      mermaidDef += `    ${state}((${state}))\n`;
    }
  });

  return mermaidDef;
}

// fungsi untuk merender grafik
export function renderGraph(graphDefinition, targetDiv) {
  const graphDiv = document.getElementById(targetDiv);
  if (!graphDiv) {
    console.error("The graph container does not exist:", targetDiv);
    return;
  }

  graphDiv.innerHTML = "";

  // tambahkan judul grafik sesuai targetDiv
  const title = document.createElement("h2");
  title.className = "text-lg font-semibold text-gray-800 mb-4";

  title.textContent =
    targetDiv === "graphResult" ? "Graph Automata" : targetDiv;
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
