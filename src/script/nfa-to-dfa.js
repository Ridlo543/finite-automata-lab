// Import functions from other scripts if necessary
// Assuming 'util' contains helper functions like isFormDataValid
import { isFormDataValid } from "./util";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("automataForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nfa = gatherFormData();
    if (isFormDataValid(nfa)) {
      const dfa = convertNFAtoDFA(nfa);
      displayDFA(dfa, "convertResult");
    } else {
      alert("Please fill all the fields correctly.");
    }
  });
});

function gatherFormData() {
  return {
    states: document
      .getElementById("states")
      .value.split(",")
      .map((s) => s.trim()),
    alphabet: document
      .getElementById("alphabet")
      .value.split(",")
      .map((s) => s.trim()),
    initialState: document.getElementById("initialState").value.trim(),
    finalStates: document
      .getElementById("finalState")
      .value.split(",")
      .map((s) => s.trim()),
    transitions: collectTransitions(),
  };
}

function collectTransitions() {
  let transitions = {};
  document.querySelectorAll(".transition-input").forEach((input) => {
    const [state, symbol] = input.id.split("_");
    transitions[state] = transitions[state] || {};
    transitions[state][symbol] = input.value.split(",").map((s) => s.trim());
  });
  return transitions;
}

function epsilonClosure(state, transitions, seen = new Set()) {
  if (seen.has(state)) return seen;
  seen.add(state);
  const epsilonTransitions = transitions[state] && transitions[state]["e"];
  if (epsilonTransitions) {
    epsilonTransitions.forEach((st) => epsilonClosure(st, transitions, seen));
  }
  return seen;
}

function convertNFAtoDFA(nfa) {
  let queue = [Array.from(epsilonClosure(nfa.initialState, nfa.transitions))];
  let seen = new Set(queue.map((states) => states.sort().join(",")));
  let dfa = {
    states: [],
    alphabet: nfa.alphabet.filter((x) => x !== "e"),
    transitions: {},
    finalStates: [],
  };

  while (queue.length) {
    let currentStates = queue.shift();
    let currentStateName = currentStates.sort().join(",");
    dfa.states.push(currentStateName);

    if (currentStates.some((state) => nfa.finalStates.includes(state))) {
      dfa.finalStates.push(currentStateName);
    }

    nfa.alphabet.forEach((symbol) => {
      if (symbol === "e") return;
      let newStates = new Set();
      currentStates.forEach((state) => {
        (
          (nfa.transitions[state] && nfa.transitions[state][symbol]) ||
          []
        ).forEach((transState) => {
          epsilonClosure(transState, nfa.transitions).forEach(
            newStates.add,
            newStates
          );
        });
      });

      let newStateName = Array.from(newStates).sort().join(",");
      if (!seen.has(newStateName)) {
        seen.add(newStateName);
        queue.push(Array.from(newStates));
      }
      dfa.transitions[currentStateName] =
        dfa.transitions[currentStateName] || {};
      dfa.transitions[currentStateName][symbol] = newStateName;
    });
  }

  return dfa;
}

function displayDFA(dfa, targetId) {
  // This function will render the DFA to the given target using Mermaid or similar
  // Example placeholder function call
  renderGraph(dfa, document.getElementById(targetId));
}
