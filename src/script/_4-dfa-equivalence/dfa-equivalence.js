// dfa-equivalence.js
import { buildGraphDefinition, renderGraph } from "@script/automaton-drawer";
import { updateAutomatonFromForm } from "@script/_4-dfa-equivalence/form-handler-eq";
import { isFormValid } from "@script/_4-dfa-equivalence/util-4";

document.addEventListener("DOMContentLoaded", () => {
  const checkEquivalenceButtonButton = document.getElementById(
    "checkEquivalenceButton"
  );

  if (checkEquivalenceButtonButton) {
    checkEquivalenceButtonButton.addEventListener("click", () => {
      // Validasi form untuk kedua DFA
      if (
        isFormValid("states1", "alphabet1", "initialState1", "finalState1") &&
        isFormValid("states2", "alphabet2", "initialState2", "finalState2")
      ) {
        checkEquivalence();
      }
    });
  }
});

function checkEquivalence() {
  // Update dan gambar grafik untuk DFA 1
  const automaton1 = updateAutomatonFromForm(
    "states1",
    "alphabet1",
    "initialState1",
    "finalState1",
    "automataForm1"
  );
  const graphDefinition1 = buildGraphDefinition(automaton1);
  renderGraph(graphDefinition1, "graphResult1");

  // Update dan gambar grafik untuk DFA 2
  const automaton2 = updateAutomatonFromForm(
    "states2",
    "alphabet2",
    "initialState2",
    "finalState2",
    "automataForm2"
  );
  const graphDefinition2 = buildGraphDefinition(automaton2);
  renderGraph(graphDefinition2, "graphResult2");

  automaton1.transitions = convertTransitions(automaton1.transitions);
  automaton2.transitions = convertTransitions(automaton2.transitions);

  // Periksa kesetaraan
  const areEqual = areEquivalent(automaton1, automaton2);
  displayEquivalenceResults(areEqual, automaton1, automaton2);
}

function areEquivalent(dfa1, dfa2) {
  // Cek basis: panjang states dan alfabet
  if (
    dfa1.states.length !== dfa2.states.length ||
    dfa1.alphabet.length !== dfa2.alphabet.length
  ) {
    return false;
  }

  // Cek kesamaan initial state
  if (dfa1.initialState !== dfa2.initialState) {
    return false;
  }

  // Cek kesamaan final states
  if (!arraysEqual(dfa1.finalStates, dfa2.finalStates)) {
    return false;
  }

  // Membangun dan memeriksa tabel state
  const visited = new Set();
  const queue = [[dfa1.initialState, dfa2.initialState]];

  while (queue.length > 0) {
    const [state1, state2] = queue.shift();
    const key = state1 + "," + state2;
    if (visited.has(key)) continue;
    visited.add(key);

    if (isFinal(state1, dfa1) !== isFinal(state2, dfa2)) {
      return false;
    }

    for (const symbol of dfa1.alphabet) {
      const nextState1 = dfa1.transitions[state1]?.[symbol] || [];
      const nextState2 = dfa2.transitions[state2]?.[symbol] || [];
      if (!arraysEqual(nextState1, nextState2)) {
        return false;
      }
      queue.push([nextState1[0], nextState2[0]]);
    }
  }

  return true;
}

function isFinal(state, dfa) {
  return dfa.finalStates.includes(state);
}

function arraysEqual(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((el) => arr2.includes(el));
}

function displayEquivalenceResults(areEqual, dfa1, dfa2) {
  const resultDiv = document.getElementById("EquivalenceTableResult");
  let equivalenceTable = generateEquivalenceTable(dfa1, dfa2);

  let htmlContent = `<div>${equivalenceTable}</div>
    <div class="text-center p-2 mt-2 mb-8 ${
      areEqual ? "bg-green-100" : "bg-red-100"
    } text-${areEqual ? "green" : "red"}-700">
          ${areEqual ? "Equivalent" : "Not Equivalent"}
        </div>`;

  resultDiv.innerHTML = htmlContent;
}

function generateEquivalenceTable(dfa1, dfa2) {
  let tableHtml = `<table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
              <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">States \\ Symbol</th>`;
  dfa1.alphabet.forEach((symbol) => {
    tableHtml += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${symbol}</th>`;
  });
  tableHtml += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

  // Memproses setiap state di DFA 1 dan mencocokkannya dengan state yang sama di DFA 2
  dfa1.states.forEach((state1) => {
    if (dfa2.states.includes(state1)) {
      // Hanya mencocokkan jika state2 juga memiliki state yang sama
      tableHtml += `<tr><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{${state1}, ${state1}}</td>`;
      dfa1.alphabet.forEach((symbol) => {
        let nextState1 = dfa1.transitions[state1][symbol];
        let nextState2 = dfa2.transitions[state1][symbol]; // Asumsi bahwa dfa2 memiliki transisi yang sama
        let classification1 = getStateClassification(nextState1, dfa1);
        let classification2 = getStateClassification(nextState2, dfa2);
        tableHtml += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{${nextState1}, ${nextState2}}<br>${classification1}, ${classification2}</td>`;
      });
      tableHtml += `</tr>`;
    }
  });

  tableHtml += `</tbody></table>`;
  return tableHtml;
}

// Fungsi untuk memeriksa klasifikasi state apakah Final (FS) atau Intermediate (IS)
function getStateClassification(state, automaton) {
  return automaton.finalStates.includes(state) ? "FS" : "IS";
}

// Fungsi untuk mengubah transisi yang ada dalam format array menjadi map untuk memudahkan akses
function convertTransitions(transitions) {
  const transitionMap = {};
  transitions.forEach((transition) => {
    if (!transitionMap[transition.state]) {
      transitionMap[transition.state] = {};
    }
    transitionMap[transition.state][transition.symbol] = transition.nextStates;
  });
  return transitionMap;
}
