// util.js



export function isFormDataValid(automaton) {
  // Periksa apakah states, alphabet, initial state, dan final states diisi
  if (
    !automaton.states.length ||
    !automaton.alphabet.length ||
    !automaton.initialState ||
    !automaton.finalStates.length
  ) {
    return false;
  }
  // Periksa apakah setiap transisi memiliki state tujuan
  for (const transition of automaton.transitions) {
    if (!transition.nextStates.every((state) => state)) {
      return false;
    }
  }
  return true;
}

export function convertTransition(automaton) {
  const { transitions } = automaton;
  const transitionObject = {};

  transitions.forEach(transition => {
    if (!transitionObject[transition.state]) {
      transitionObject[transition.state] = {};
    }
    transition.nextStates.forEach(nextState => {
      if (transitionObject[transition.state][transition.symbol]) {
        // Jika simbol sudah ada, tambahkan nextState ke array existing
        transitionObject[transition.state][transition.symbol].push(nextState);
      } else {
        // Jika simbol belum ada, buat array baru dengan nextState
        transitionObject[transition.state][transition.symbol] = [nextState];
      }
    });
  });

  // Menghapus duplikat nextState dalam setiap array
  Object.keys(transitionObject).forEach(state => {
    Object.keys(transitionObject[state]).forEach(symbol => {
      transitionObject[state][symbol] = [...new Set(transitionObject[state][symbol])];
    });
  });

  return transitionObject;
}
