// dfa-minimizer.js
import {
  updateAutomatonFromForm,
  renderGraph,
  automaton,
} from "./automaton-drawer";
import { isFormDataValid } from "./util";

export let minimizedAutomaton;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("minimizeButton").addEventListener("click", () => {
    updateAutomatonFromForm();
    if (isFormDataValid(automaton)) {
      minimizeDFA();
    } else {
      alert(
        "Please fill out all form fields correctly before minimizing the graph."
      );
    }
  });
});

// Fungsi untuk meminimalkan DFA
export function minimizeDFA() {
  let partitions = initialPartition(automaton);
  let newPartitions;
  do {
    newPartitions = refinePartitions(automaton, partitions);
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
    "minimizedGraphDiv"
  );
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
      mermaidDef += `    ${state}(${state})\n`;
    }
  });

  return mermaidDef;
}
