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
  const visited = new Map();
  const queue = [[dfa1.initialState, dfa2.initialState]];

  while (queue.length) {
    const [state1, state2] = queue.shift();
    const key = `${state1},${state2}`;

    if (visited.has(key)) continue;
    visited.set(key, true);

    // Periksa kesamaan jenis state (FS atau IS)
    if (isFinal(state1, dfa1) !== isFinal(state2, dfa2)) {
      return false;
    }

    const symbols1 = Object.keys(dfa1.transitions[state1] || {});
    const symbols2 = Object.keys(dfa2.transitions[state2] || {});

    // Gabungkan simbol dari kedua alfabet
    const symbols = new Set([...symbols1, ...symbols2]);

    for (const symbol of symbols) {
      const nextState1 = dfa1.transitions[state1]?.[symbol] || [];
      const nextState2 = dfa2.transitions[state2]?.[symbol] || [];

      nextState1.forEach((ns1) => {
        nextState2.forEach((ns2) => {
          queue.push([ns1, ns2]);
        });
      });

      // Cek apakah kedua next state memiliki klasifikasi yang sama
      if (
        !nextState1.every((ns1) =>
          nextState2.some((ns2) => isFinal(ns1, dfa1) === isFinal(ns2, dfa2))
        )
      ) {
        return false;
      }
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
  let htmlContent = `
    <h2 class="text-xl font-bold text-gray-800">Equivalence Results</h2>
    <div>${generateEquivalenceTable(dfa1, dfa2)}</div>
    <div class="text-center p-2 mt-2 mb-8 ${
      areEqual ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }">
      ${areEqual ? "Equivalent" : "Not Equivalent"}
    </div>
    <div class="mt-4 text-sm text-gray-600">
      <p><strong>IS (Intermediate State):</strong> State yang bukan akhir dari automata.</p>
      <p><strong>FS (Final State):</strong> State akhir dari automata, dimana string dapat diterima.</p>
    </div>`;
  resultDiv.innerHTML = htmlContent;
}

function generateEquivalenceTable(dfa1, dfa2) {
  let tableHtml = `<table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">States</th>`;
  dfa1.alphabet.forEach((symbol) => {
    tableHtml += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">${symbol}</th>`;
  });
  tableHtml += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

  // Membangun dan memeriksa tabel state dengan BFS
  const visited = new Set();
  const queue = [[dfa1.initialState, dfa2.initialState]];

  while (queue.length > 0) {
    const [state1, state2] = queue.shift();
    const key = state1 + "," + state2;
    if (visited.has(key)) continue;
    visited.add(key);

    let classification1 = getStateClassification(state1, dfa1);
    let classification2 = getStateClassification(state2, dfa2);
    tableHtml += `<tr><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{${state1}, ${state2}}<br>${classification1}, ${classification2}</td>`;

    dfa1.alphabet.forEach((symbol) => {
      const nextState1 = dfa1.transitions[state1]?.[symbol] || [];
      const nextState2 = dfa2.transitions[state2]?.[symbol] || [];
      if (!visited.has(nextState1[0] + "," + nextState2[0])) {
        queue.push([nextState1[0], nextState2[0]]);
      }

      let classificationNext1 = getStateClassification(nextState1[0], dfa1);
      let classificationNext2 = getStateClassification(nextState2[0], dfa2);
      tableHtml += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{${nextState1}, ${nextState2}}<br>${classificationNext1}, ${classificationNext2}</td>`;
    });

    tableHtml += `</tr>`;
  }

  tableHtml += `</tbody></table>`;
  return tableHtml;
}

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
