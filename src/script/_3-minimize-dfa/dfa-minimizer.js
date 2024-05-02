// dfa-minimizer.js
import {
  renderGraph,
  automaton,
  buildGraphDefinition,
} from "../automaton-drawer";
import { updateAutomatonFromForm } from "../form-handler";
import { isFormDataValid } from "../util";
import { convertTransition } from "../util";

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
        // console.log("Automaton Object:", automaton.transitions);
        renderGraph(buildGraphDefinition(automaton), "graphResult");
        minimizeDFA();
        console.log("Automaton Object:", automaton);
        console.log("Minimized Automaton Object:", minimizedAutomaton);
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
  // Hapus state yang tidak dapat diakses dan state mati untuk membersihkan DFA.
  removeInaccessibleAndDeadStates(automaton);

  // Membagi state menjadi dua kelompok berdasarkan apakah mereka adalah final state atau bukan.
  let partitions = initialPartition(automaton);
  let newPartitions;

  // Menampilkan partisi awal pada UI untuk visualisasi.
  let stepCounter = 0;
  renderEquivalenceStep(partitions, stepCounter);

  // Iterasi untuk memperhalus partisi hingga tidak ada perubahan lebih lanjut.
  do {
    newPartitions = refinePartitions(automaton, partitions);
    stepCounter++;
    renderEquivalenceStep(newPartitions, stepCounter);

    // Jika partisi tidak berubah setelah iterasi, proses berhenti.
    if (JSON.stringify(newPartitions) === JSON.stringify(partitions)) {
      break;
    }
    partitions = newPartitions;
  } while (true);

  // Bangun DFA yang diminimalkan berdasarkan partisi terakhir.
  minimizedAutomaton = {
    states: [].concat(...partitions),
    alphabet: automaton.alphabet,
    initialState: automaton.initialState,
    finalStates: automaton.finalStates.filter((state) =>
      partitions.some((partition) => partition.includes(state))
    ),
    transitions: reduceTransitions(automaton, partitions),
  };

  // Tampilkan grafik DFA yang diminimalkan.
  renderGraph(
    buildMinimizedGraphDefinition(minimizedAutomaton, partitions),
    "minimizedGraph"
  );
}

function removeInaccessibleAndDeadStates(automaton) {
  let accessibleStates = new Set([automaton.initialState]);
  let queue = [automaton.initialState];

  // Breadth-First Search untuk menentukan accessible states
  while (queue.length > 0) {
    let currentState = queue.shift();
    automaton.alphabet.forEach((symbol) => {
      let nextStates = automaton.transitions
        .filter((t) => t.state === currentState && t.symbol === symbol)
        .flatMap((t) => t.nextStates);
      nextStates.forEach((state) => {
        if (!accessibleStates.has(state)) {
          accessibleStates.add(state);
          queue.push(state);
        }
      });
    });
  }

  console.log("Accessible States:", accessibleStates);

  // Filter untuk mendapatkan daftar state yang diakses saja
  automaton.states = automaton.states.filter((state) =>
    accessibleStates.has(state)
  );
  automaton.transitions = automaton.transitions.filter((t) =>
    accessibleStates.has(t.state)
  );

  // Mengidentifikasi dan menghapus dead states
  let deadStates = new Set(
    automaton.states.filter(
      (state) =>
        !automaton.finalStates.includes(state) &&
        automaton.alphabet.every((symbol) => {
          let nextStates = automaton.transitions
            .filter((t) => t.state === state && t.symbol === symbol)
            .flatMap((t) => t.nextStates);
          return nextStates.length === 1 && nextStates[0] === state;
        })
    )
  );

  // Hapus dead states dari daftar states dan transitions
  automaton.states = automaton.states.filter((state) => !deadStates.has(state));
  automaton.transitions = automaton.transitions.filter(
    (t) => !deadStates.has(t.state)
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
  // console.log("Memulai proses partisi...");
  // console.log("Partisi lama:", JSON.stringify(oldPartitions));

  oldPartitions.forEach((partition, index) => {
    let subPartitions = {};
    // console.log(`Memproses partisi ${index + 1}:`, partition);

    partition.forEach((state) => {
      // Membuat kunci berdasarkan partisi nextState untuk setiap simbol.
      let key = automaton.alphabet
        .map((symbol) => {
          const nextState = getNextState(automaton, state, symbol);
          const partitionIndex = oldPartitions.findIndex((part) =>
            part.includes(nextState)
          );
          return partitionIndex >= 0 ? partitionIndex : -1; // Returns -1 if nextState is not found
        })
        .join("-");

      // console.log(`State ${state}: Kunci transisi -> [${key}]`);

      if (!subPartitions[key]) {
        subPartitions[key] = [];
        // console.log(`Membuat sub-partisi baru untuk kunci '${key}'`);
      }
      subPartitions[key].push(state);
    });

    // console.log("Sub-partisi yang dihasilkan dari partisi ini:", subPartitions);
    newPartitions.push(...Object.values(subPartitions));
  });

  // console.log("Partisi baru setelah pemurnian:", JSON.stringify(newPartitions));
  return newPartitions;
}

// Fungsi untuk mendapatkan nextState dari state dan symbol
export function getNextState(automaton, state, symbol) {
  const transition = automaton.transitions.find(
    (t) => t.state === state && t.symbol === symbol
  );
  return transition ? transition.nextStates[0] : null;
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
      // Menambahkan transisi baru jika belum ada yang serupa.
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
    // Check if the state is both initial and final
    if (
      state === minimizedAutomaton.initialState &&
      minimizedAutomaton.finalStates.includes(state)
    ) {
      // Double circle for initial and final
      mermaidDef += `    ${state}(((${state})))\n`;
    } else if (minimizedAutomaton.finalStates.includes(state)) {
      // Double circle for final states only
      mermaidDef += `    ${state}((("${state}")))\n`;
    } else if (state === minimizedAutomaton.initialState) {
      // Single circle for initial states only
      mermaidDef += `    ${state}(("${state}"))\n`;
    } else {
      // Regular state with a single circle
      mermaidDef += `    ${state}((${state}))\n`;
    }
  });

  return mermaidDef;
}
