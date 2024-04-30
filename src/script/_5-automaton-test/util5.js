import examples from "./5-example.json";
import { createTransitionInputs } from "./form-handler-test";

document.addEventListener("DOMContentLoaded", () => {
  const exampleButtons = document.querySelectorAll("[id^='example']");
  const resetButtons = document.querySelectorAll("[id^='reset']");

  exampleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const automatonType = this.getAttribute("data-automaton-type");
      //   console.log(automatonType);
      fillExampleData(automatonType);
    });
  });

  resetButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const automatonType = this.getAttribute("data-automaton-type");
      resetForm(automatonType);
    });
  });
});

// Fungsi untuk mengisi form dengan data contoh
export function fillExampleData(automatonType) {
  let exampleData;
  if (automatonType === "regex") {
    const regexExamples = examples.filter((ex) => ex.type === "regex");
    exampleData =
      regexExamples[Math.floor(Math.random() * regexExamples.length)];
  } else {
    exampleData = examples.find((ex) => ex.type === automatonType);
  }

  if (!exampleData || !exampleData.data) {
    console.error("No example data found for type:", automatonType);
    return;
  }

  const data = exampleData.data;
  if (automatonType === "regex") {
    // Hanya mengisi pola regex dan mengosongkan test string
    document.getElementById("regexPattern").value = data.pattern;
    document.getElementById("regexInput").value = ""; // Kosongkan input test string saat memuat contoh
  } else {
    // Mengisi data untuk automata lainnya
    document.getElementById(automatonType + "States").value = data.states;
    document.getElementById(automatonType + "Alphabet").value = data.alphabet;
    document.getElementById(automatonType + "InitialState").value =
      data.initialState;
    document.getElementById(automatonType + "FinalStates").value =
      Array.isArray(data.finalStates)
        ? data.finalStates.join(",")
        : data.finalStates;
    createTransitionInputs(automatonType);
    fillTransitions(data.transitions, automatonType);
  }
}

export function resetForm(automatonType) {
  if (automatonType === "regex") {
    document.getElementById("regexPattern").value = "";
    document.getElementById("regexInput").value = "";
    document.getElementById("regexPattern").value = "";
    document.getElementById("regexResult").innerHTML = "";
  } else {
    document.getElementById(automatonType + "States").value = "";
    document.getElementById(automatonType + "Alphabet").value = "";
    document.getElementById(automatonType + "InitialState").value = "";
    document.getElementById(automatonType + "FinalStates").value = "";
    document.getElementById(automatonType + "TransitionsDiv").innerHTML = "";
    document.getElementById(automatonType + "Input").value = "";
    document.getElementById(automatonType + "Result").innerHTML = "";
  }
}

function fillTransitions(transitions, automatonType) {
  Object.keys(transitions).forEach((state) => {
    Object.keys(transitions[state]).forEach((symbol) => {
      const inputId = `transition_${automatonType}_${state}_${symbol}`;
      const inputElement = document.getElementById(inputId);
      inputElement.value = transitions[state][symbol];
    });
  });
}

export function convertTransition(transitions) {
  let formattedTransitions = [];
  for (const [state, symbols] of Object.entries(transitions)) {
    for (const [symbol, nextState] of Object.entries(symbols)) {
      formattedTransitions.push({
        state: state,
        symbol: symbol,
        nextStates: [nextState]  // Masukkan nextState ke dalam array untuk konsistensi
      });
    }
  }
  return formattedTransitions;
}
