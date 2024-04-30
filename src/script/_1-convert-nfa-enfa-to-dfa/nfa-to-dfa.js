import {
  automaton,
  renderGraph,
  buildGraphDefinition,
} from "../automaton-drawer";
import { updateAutomatonFromForm } from "../form-handler";
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("convertButtonToDFA")
    .addEventListener("click", () => {
      updateAutomatonFromForm();
      console.log("Updated Automaton:", automaton);
      renderGraph(buildGraphDefinition(automaton), "graphNFA");
      convertNFAtoDFA();
    });
});

function epsilonClosure(baseStates, transitionMap) {
  let closure = new Set(baseStates);
  let stack = Array.from(baseStates);

  while (stack.length > 0) {
    const currentState = stack.pop();
    const epsilonTransitions = transitionMap[currentState]?.eps || [];
    epsilonTransitions.forEach((nextState) => {
      if (!closure.has(nextState)) {
        closure.add(nextState);
        stack.push(nextState);
      }
    });
  }

  return Array.from(closure);
}

function convertNFAtoDFA() {
  const { states, alphabet, transitions, initialState, finalStates } =
    automaton;

  let transitionMap = {};
  states.forEach((state) => {
    transitionMap[state] = {};
    alphabet.concat("eps").forEach((symbol) => {
      transitionMap[state][symbol] = [];
    });
  });

  transitions.forEach((transition) => {
    transition.nextStates.forEach((nextState) => {
      transitionMap[transition.state][transition.symbol].push(nextState);
    });
  });

  let initialStateClosure = epsilonClosure([initialState], transitionMap)
    .sort()
    .join("-");
  let dfa = {
    states: [],
    alphabet: alphabet.filter((sym) => sym !== "eps"),
    transitions: {},
    initialState: initialStateClosure,
    finalStates: [],
  };

  let queue = [initialStateClosure];
  let visited = new Set(queue);

  while (queue.length > 0) {
    let currentStates = queue.shift();
    let currentStatesArray = currentStates.split("-");

    dfa.states.push(currentStates);
    if (currentStatesArray.some((state) => finalStates.includes(state))) {
      dfa.finalStates.push(currentStates);
    }

    dfa.alphabet.forEach((symbol) => {
      let nextStateClosure = new Set();

      currentStatesArray.forEach((state) => {
        (transitionMap[state][symbol] || []).forEach((nextState) => {
          epsilonClosure([nextState], transitionMap).forEach((closureState) => {
            nextStateClosure.add(closureState);
          });
        });
      });

      let nextStateKey = Array.from(nextStateClosure).sort().join("-");
      if (nextStateKey && !visited.has(nextStateKey)) {
        queue.push(nextStateKey);
        visited.add(nextStateKey);
      }

      dfa.transitions[currentStates] = dfa.transitions[currentStates] || {};
      dfa.transitions[currentStates][symbol] = nextStateKey || null;
    });
  }

  displayDfaTable(dfa);
  const dfaGraph = buildDFAGraphDefinition(dfa);
  renderGraph(dfaGraph, "graphDFA");
}

function displayDfaTable(dfa) {
  const dfaResultDiv = document.getElementById("dfaTable");
  let html = `<h2 class="text-lg font-bold text-violet-800 mb-4">DFA Conversion Table</h2>
  <table class="divide-y w-full rounded-lg divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State \\ Symbol</th>`;
  dfa.alphabet.forEach((symbol) => {
    html += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${symbol}</th>`;
  });
  html += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

  dfa.states.forEach((state) => {
    html += `<tr><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${state}</td>`;
    dfa.alphabet.forEach((symbol) => {
      let nextState = dfa.transitions[state][symbol] || "—";
      html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${nextState}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  dfaResultDiv.innerHTML = html;
}

function buildDFAGraphDefinition(dfa) {
  let mermaidDef = "graph LR\n";
  mermaidDef += `    start -->${dfa.initialState}\n`;

  // Define transitions
  dfa.states.forEach((state) => {
    dfa.alphabet.forEach((symbol) => {
      if (dfa.transitions[state] && dfa.transitions[state][symbol]) {
        mermaidDef += `    ${state} -->|${symbol}| ${dfa.transitions[state][symbol]}\n`;
      }
    });
  });

  // Define states appearance
  dfa.states.forEach((state) => {
    if (dfa.initialState === state) {
      mermaidDef += `    ${state}((${state}))\n`;
    } else if (dfa.finalStates.includes(state)) {
      mermaidDef += `    ${state}(((${state})))\n`;
    } else {
      mermaidDef += `    ${state}((${state}))\n`;
    }
  });

  return mermaidDef;
}
