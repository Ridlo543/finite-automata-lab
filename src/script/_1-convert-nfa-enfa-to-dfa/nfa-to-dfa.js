document.getElementById("convertButton").addEventListener("click", () => {
  const nfa = getAutomatonFromForm();
  const dfa = convertNFAtoDFA(nfa);
  displayDFA(dfa); // Fungsi untuk menampilkan DFA yang perlu Anda implementasikan
});

function getAutomatonFromForm() {
  let automaton = {
    states: document
      .getElementById("states")
      .value.split(",")
      .map((s) => s.trim()),
    alphabet: document
      .getElementById("alphabet")
      .value.split(",")
      .map((s) => s.trim()),
    startState: document.getElementById("initialState").value.trim(),
    acceptStates: document
      .getElementById("finalState")
      .value.split(",")
      .map((s) => s.trim()),
    transitions: {},
  };

  automaton.states.forEach((state) => {
    automaton.transitions[state] = {};
    automaton.alphabet.forEach((symbol) => {
      let transitionId = `transition_${state}_${symbol}`;
      let transitionInput = document.getElementById(transitionId);
      automaton.transitions[state][symbol] = transitionInput
        ? transitionInput.value.split(",").map((s) => s.trim())
        : [];
    });

    let epsilonTransitionId = `transition_${state}_ε`;
    let epsilonTransitionInput = document.getElementById(epsilonTransitionId);
    automaton.transitions[state]["ϵ"] = epsilonTransitionInput
      ? epsilonTransitionInput.value.split(",").map((s) => s.trim())
      : [];
  });

  return automaton;
}

function convertNFAtoDFA(nfa) {
  let dfa = {
    states: [],
    alphabet: nfa.alphabet.filter((symbol) => symbol !== "ϵ"), // Exclude 'ϵ' from DFA alphabet
    transitions: {},
    startState: epsilonClosure(nfa.startState, nfa.transitions).join("-"),
    acceptStates: [],
  };

  let queue = [dfa.startState];
  let visited = new Set();

  while (queue.length > 0) {
    let currentState = queue.shift();
    if (!visited.has(currentState)) {
      visited.add(currentState);
      let stateParts = currentState.split("-");

      dfa.states.push(currentState);
      if (stateParts.some((part) => nfa.acceptStates.includes(part))) {
        dfa.acceptStates.push(currentState);
      }

      dfa.transitions[currentState] = {};
      nfa.alphabet.forEach((symbol) => {
        if (symbol !== "ϵ") {
          let nextStates = new Set();
          stateParts.forEach((part) => {
            let transitions = nfa.transitions[part][symbol];
            if (transitions) {
              transitions.forEach((nextState) => {
                epsilonClosure(nextState, nfa.transitions).forEach(
                  (closureState) => {
                    nextStates.add(closureState);
                  }
                );
              });
            }
          });

          let nextStateStr = Array.from(nextStates).sort().join("-");
          dfa.transitions[currentState][symbol] = nextStateStr;
          if (nextStateStr && !visited.has(nextStateStr)) {
            queue.push(nextStateStr);
          }
        }
      });
    }
  }

  return dfa;
}

function epsilonClosure(state, transitions) {
  let closure = new Set([state]);
  let queue = [state];

  while (queue.length > 0) {
    let currentState = queue.shift();
    let epsilonTransitions = transitions[currentState]["ϵ"];
    if (epsilonTransitions) {
      epsilonTransitions.forEach((nextState) => {
        if (!closure.has(nextState)) {
          closure.add(nextState);
          queue.push(nextState);
        }
      });
    }
  }

  return Array.from(closure);
}

function displayDFA(dfa) {
  if (document.getElementById("dfaStates")) {
    document.getElementById("dfaStates").innerText = dfa.states.join(", ");
  }
  if (document.getElementById("dfaAlphabet")) {
    document.getElementById("dfaAlphabet").innerText = dfa.alphabet.join(", ");
  }
  if (document.getElementById("dfaInitialState")) {
    document.getElementById("dfaInitialState").innerText = dfa.startState;
  }
  if (document.getElementById("dfaFinalStates")) {
    document.getElementById("dfaFinalStates").innerText =
      dfa.acceptStates.join(", ");
  }

  let transitionsTable = document.getElementById("dfaTransitions");
  if (transitionsTable) {
    transitionsTable.innerHTML = "";
  }
  dfa.states.forEach((state) => {
    let row = transitionsTable.insertRow();
    row.insertCell().innerText = state;
    dfa.alphabet.forEach((symbol) => {
      let cell = row.insertCell();
      cell.innerText = dfa.transitions[state][symbol] || "";
    });
  });
}
