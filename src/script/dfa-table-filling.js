import { updateAutomatonFromForm } from "./form-handler";
import { automaton } from "./automaton-drawer";
import { getNextState } from "./dfa-minimizer";
import { isFormDataValid } from "./util";

document.addEventListener("DOMContentLoaded", () => {
  const tableFillingButton = document.getElementById("tableFillingButton");
  if (tableFillingButton) {
    tableFillingButton.addEventListener("click", () => {
      updateAutomatonFromForm();
      if (isFormDataValid(automaton)) {
        minimizeDFAWithTableFilling();
      } else {
        alert("Please fill out all form fields correctly.");
      }
    });
  }
});

function minimizeDFAWithTableFilling() {
  const { states, finalStates, transitions } = automaton;
  const marked = initializeMarked(states, finalStates);
  let isUpdated;

  do {
    isUpdated = false;
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        if (!marked[i][j]) {
          for (const symbol of automaton.alphabet) {
            const nextStateI = getNextState(automaton, states[i], symbol);
            const nextStateJ = getNextState(automaton, states[j], symbol);
            const indexI = states.indexOf(nextStateI);
            const indexJ = states.indexOf(nextStateJ);

            if (indexI > indexJ && marked[indexJ][indexI]) {
              marked[i][j] = true;
              isUpdated = true;
              break;
            } else if (indexI < indexJ && marked[indexI][indexJ]) {
              marked[i][j] = true;
              isUpdated = true;
              break;
            }
          }
        }
      }
    }
  } while (isUpdated);

  renderTableFillingAlgorithm(marked, states);
}

function initializeMarked(states, finalStates) {
  const marked = [];
  for (let i = 0; i < states.length; i++) {
    marked[i] = [];
    for (let j = 0; j < states.length; j++) {
      if (i < j) {
        marked[i][j] =
          finalStates.includes(states[i]) !== finalStates.includes(states[j]);
      }
    }
  }
  return marked;
}

function renderTableFillingAlgorithm(marked, states) {
  const equivalenceDiv = document.createElement("div");
  equivalenceDiv.classList.add("mb-4", "p-4", "rounded-lg", "overflow-auto");

  // Build table headers
  let tableHeaders = states
    .map(
      (state) =>
        `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${state}</th>`
    )
    .join("");

  // Initialize table rows
  let tableRows = states
    .map((state, index) => {
      let rowCells = states
        .map((_, j) => {
          if (index < j) {
            // only fill upper triangle of the table
            return `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
              marked[index][j] ? "X" : "~"
            }</td>`;
          } else {
            // Gray out the cells that are not applicable
            return `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 bg-gray-300"></td>`;
          }
        })
        .join("");

      return `<tr><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${state}</td>${rowCells}</tr>`;
    })
    .join("");

  // Combine table headers and rows
  equivalenceDiv.innerHTML += `
    <h3 class="text-lg font-semibold text-violet-700 mb-2">Equivalence with Table Filling Algorithm</h3>
    <table class="min-w-full overflow-auto divide-y divide-gray-200 shadow  rounded-lg">
      <thead class="bg-gray-50">
        <tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">States</th>${tableHeaders}</tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">${tableRows}</tbody>
    </table>
  `;

  // Add equivalence results
  const equivalentStates = getEquivalentStates(marked, states);
  equivalenceDiv.innerHTML += `
      <h3 class="text-lg font-semibold text-violet-700 mt-4 mb-2">Equivalent States</h3>
      <p class="text-gray-700">${equivalentStates.join(", ")}</p>`;

  // Clear previous content and add the new equivalence table
  const stepsDiv = document.getElementById("tableFillingSteps");
  stepsDiv.innerHTML = "";
  stepsDiv.appendChild(equivalenceDiv);
}

// Helper function to get pairs of equivalent states
function getEquivalentStates(marked, states) {
  const equivalencePairs = [];
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      if (!marked[i][j]) {
        equivalencePairs.push(`${states[i]} ~ ${states[j]}`);
      }
    }
  }
  return equivalencePairs;
}
