import { updateAutomatonFromForm } from "@script/_5-automaton-test/form-handler-test";
import { buildGraphDefinition } from "@script/automaton-drawer";
import { automaton } from "@script/automaton-drawer";
import { convertTransition } from "@script/_5-automaton-test/util5";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
});

document.addEventListener("DOMContentLoaded", () => {
  const drawButtons = document.querySelectorAll("[id^='draw']");

  drawButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const automatonType = this.getAttribute("data-automaton-type");
      updateAutomatonFromForm(automatonType);
      //   console.log("Automaton: ", automaton);
      automaton.transitions = convertTransition(automaton.transitions);
      if (automaton) {
        renderGraph(
          buildGraphDefinition(automaton),
          `graph${automatonType.toUpperCase()}`
        );
      } else {
        alert(
          "Please fill out all form fields correctly before drawing the graph."
        );
      }
    });
  });
});

export function renderGraph(graphDefinition, targetDiv) {
  const graphDiv = document.getElementById(targetDiv);
  if (!graphDiv) {
    console.error("The graph container does not exist:", targetDiv);
    return;
  }

  graphDiv.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "text-lg font-semibold text-gray-800 mb-4";
  title.textContent = "Graph Automata";
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
