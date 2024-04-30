// dfa-minimizer.js
import { renderGraph, automaton, buildGraphDefinition } from "../automaton-drawer";
import { updateAutomatonFromForm } from "../form-handler";
import { isFormDataValid } from "../util";
// import { convertTransition } from "../util";

export let minimizedAutomaton;

document.addEventListener("DOMContentLoaded", () => {
  const minimizeButton = document.getElementById("minimizeButton");

  if (minimizeButton) {
    minimizeButton.addEventListener("click", () => {
      const stepsDiv = document.getElementById("equivalenceSteps");
      stepsDiv.innerHTML = "";
      updateAutomatonFromForm();

      if (isFormDataValid(automaton)) {
        // const transitionConverted = convertTransition(automaton);
        // console.log("Converted Transition Object:", transitionConverted);
        renderGraph(buildGraphDefinition(automaton), "graphResult");
        minimizeDFA();
        const testDfaContent = document.getElementById("testDfaContent");
        testDfaContent.classList.remove("hidden");
      } else {
        alert(
          "Please fill out all form fields correctly before minimizing the graph."
        );
      }
    });
  }
});

export function minimizeDFA() {
  let partitions = initialPartition(automaton);
  let newPartitions;
  let stepCounter = 0;
  renderEquivalenceStep(partitions, stepCounter);

  do {
    newPartitions = refinePartitions(automaton, partitions);
    stepCounter++;
    renderEquivalenceStep(newPartitions, stepCounter);

    if (JSON.stringify(newPartitions) === JSON.stringify(partitions)) {
      break;
    }
    partitions = newPartitions;
  } while (true);

  minimizedAutomaton = {
    states: [].concat(...partitions),
    alphabet: automaton.alphabet,
    initialState: automaton.initialState,
    finalStates: automaton.finalStates.filter((state) =>
      partitions.some((partition) => partition.includes(state))
    ),
    transitions: reduceTransitions(automaton, partitions),
  };

  renderGraph(
    buildMinimizedGraphDefinition(minimizedAutomaton, partitions),
    "minimizedGraph"
  );
}

function renderEquivalenceStep(partitions, step) {
  const stepsDiv = document.getElementById("equivalenceSteps");

  // Periksa apakah tabel sudah ada, jika tidak, buat tabel baru
  let table = stepsDiv.querySelector("table");
  if (!table) {
    table = document.createElement("table");
    table.className =
      "min-w-full divide-y divide-gray-200 shadow overflow-hidden rounded-lg";
    table.innerHTML = `
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            Step
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            Equivalence
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
      </tbody>`;
    stepsDiv.appendChild(table);
  }

  // Tambahkan baris baru ke tbody tabel
  let tbody = table.querySelector("tbody");
  let row = document.createElement("tr");
  row.innerHTML = `
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      ${step}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      ${partitions.map((partition) => `{${partition.join(",")}}`).join(" ")}
    </td>`;
  tbody.appendChild(row);
}

// initialPartition() akan membagi states menjadi dua bagian: finalStates dan nonFinalStates
export function initialPartition(automaton) {
  const finalStates = new Set(automaton.finalStates);
  const nonFinalStates = automaton.states.filter(
    (state) => !finalStates.has(state)
  );
  return [Array.from(finalStates), nonFinalStates];
}

// refinePartitions() akan membagi partisi yang ada menjadi partisi yang lebih kecil
export function refinePartitions(automaton, oldPartitions) {
  let newPartitions = [];
  oldPartitions.forEach((partition) => {
    let subPartitions = {};
    partition.forEach((state) => {
      let key = automaton.alphabet
        .map((symbol) => {
          const nextState = getNextState(automaton, state, symbol);
          const partitionIndex = oldPartitions.findIndex((part) =>
            part.includes(nextState)
          );
          return partitionIndex >= 0 ? partitionIndex : -1; // Returns -1 if nextState is not found
        })
        .join("-");
      if (!subPartitions[key]) {
        subPartitions[key] = [];
      }
      subPartitions[key].push(state);
    });
    newPartitions.push(...Object.values(subPartitions));
  });
  return newPartitions;
}

// reduceTransitions() akan mengurangi transisi otomata
export function reduceTransitions(automaton, partitions) {
  const stateMap = new Map(); // Use a Map for constant-time lookups
  partitions.forEach((partition) => {
    const representative = partition[0]; // Choose the first state as the representative
    partition.forEach((state) => {
      stateMap.set(state, representative);
    });
  });

  const reducedTransitions = [];
  automaton.transitions.forEach(({ state, symbol, nextStates }) => {
    const representative = stateMap.get(state);
    const nextStateRepresentatives = nextStates
      .map((nextState) => stateMap.get(nextState)) // Map to representative states
      .filter((nextState) => nextState != null); // Filter out nulls

    nextStateRepresentatives.forEach((nextStateRepresentative) => {
      // Check if the transition already exists
      const existingTransitionIndex = reducedTransitions.findIndex(
        (transition) =>
          transition.state === representative &&
          transition.symbol === symbol &&
          transition.nextStates[0] === nextStateRepresentative
      );
      // Add the transition if it doesn't exist
      if (existingTransitionIndex === -1) {
        reducedTransitions.push({
          state: representative,
          symbol: symbol,
          nextStates: [nextStateRepresentative],
        });
      }
    });
  });

  return reducedTransitions;
}

// Fungsi untuk mendapatkan nextState dari state dan symbol
export function getNextState(automaton, state, symbol) {
  const transition = automaton.transitions.find(
    (t) => t.state === state && t.symbol === symbol
  );
  return transition ? transition.nextStates[0] : null;
}

// Fungsi untuk membangun definisi grafik yang diminimalkan
export function buildMinimizedGraphDefinition(minimizedAutomaton, partitions) {
  let mermaidDef = "graph LR\n";
  mermaidDef += `    start --> ${minimizedAutomaton.initialState}\n`;
  const representativeMap = new Map(); // This map will store the representative for each state

  // Assign the first state of each partition as the representative
  partitions.forEach((partition) => {
    const representative = partition[0];
    partition.forEach((state) => {
      representativeMap.set(state, representative);
    });
  });

  // Build graph using representatives
  minimizedAutomaton.transitions.forEach(({ state, symbol, nextStates }) => {
    const repState = representativeMap.get(state);
    const uniqueNextStates = [
      ...new Set(
        nextStates.map((nextState) => representativeMap.get(nextState))
      ),
    ];
    uniqueNextStates.forEach((nextState) => {
      if (nextState) {
        // Check to ensure nextState is defined
        mermaidDef += `    ${repState} -->|${symbol}| ${nextState}\n`;
      }
    });
  });

  // Define states and emphasize initial and final states
  new Set([...representativeMap.values()]).forEach((state) => {
    if (state === minimizedAutomaton.initialState) {
      mermaidDef += `    ${state}(("${state}"))\n`;
    } else if (minimizedAutomaton.finalStates.includes(state)) {
      mermaidDef += `    ${state}((("${state}")))\n`;
    } else {
      mermaidDef += `    ${state}((${state}))\n`;
    }
  });

  return mermaidDef;
}
