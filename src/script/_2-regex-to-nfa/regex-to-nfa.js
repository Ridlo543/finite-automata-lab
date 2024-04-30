import { renderGraph } from "@script/automaton-drawer.js";

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("convertRegex")
    .addEventListener("click", convertRegexToNFA);
  document.getElementById("formRegex").addEventListener("submit", (e) => {
    e.preventDefault();
    convertRegexToNFA();
  });
});

function parseRegex(text) {
  function parseSub(text, begin, end, first) {
    var i,
      sub,
      last = 0,
      node = { begin: begin, end: end },
      virNode,
      tempNode,
      stack = 0,
      parts = [];
    if (text.length === 0) {
      return "Error: empty input at " + begin + ".";
    }
    if (first) {
      for (i = 0; i <= text.length; i += 1) {
        if (i === text.length || (text[i] === "|" && stack === 0)) {
          if (last === 0 && i === text.length) {
            return parseSub(text, begin + last, begin + i, false);
          }
          sub = parseSub(
            text.substr(last, i - last),
            begin + last,
            begin + i,
            true
          );
          if (typeof sub === "string") {
            return sub;
          }
          parts.push(sub);
          last = i + 1;
        } else if (text[i] === "(") {
          stack += 1;
        } else if (text[i] === ")") {
          stack -= 1;
        }
      }
      if (parts.length === 1) {
        return parts[0];
      }
      node.type = "or";
      node.parts = parts;
    } else {
      for (i = 0; i < text.length; i += 1) {
        if (text[i] === "(") {
          last = i + 1;
          i += 1;
          stack = 1;
          while (i < text.length && stack !== 0) {
            if (text[i] === "(") {
              stack += 1;
            } else if (text[i] === ")") {
              stack -= 1;
            }
            i += 1;
          }
          if (stack !== 0) {
            return "Error: missing right bracket for " + (begin + last) + ".";
          }
          i -= 1;
          sub = parseSub(
            text.substr(last, i - last),
            begin + last,
            begin + i,
            true
          );
          if (typeof sub === "string") {
            return sub;
          }
          sub.begin -= 1;
          sub.end += 1;
          parts.push(sub);
        } else if (text[i] === "*") {
          if (parts.length === 0) {
            return "Error: unexpected * at " + (begin + i) + ".";
          }
          tempNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          tempNode.type = "star";
          tempNode.sub = parts[parts.length - 1];
          parts[parts.length - 1] = tempNode;
        } else if (text[i] === "+") {
          if (parts.length === 0) {
            return "Error: unexpected + at " + (begin + i) + ".";
          }
          virNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          virNode.type = "star";
          virNode.sub = parts[parts.length - 1];
          tempNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          tempNode.type = "cat";
          tempNode.parts = [parts[parts.length - 1], virNode];
          parts[parts.length - 1] = tempNode;
        } else if (text[i] === "?") {
          if (parts.length === 0) {
            return "Error: unexpected + at " + (begin + i) + ".";
          }
          virNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          virNode.type = "empty";
          virNode.sub = parts[parts.length - 1];
          tempNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          tempNode.type = "or";
          tempNode.parts = [parts[parts.length - 1], virNode];
          parts[parts.length - 1] = tempNode;
        } else if (text[i] === "ϵ") {
          tempNode = { begin: begin + i, end: begin + i + 1 };
          tempNode.type = "empty";
          parts.push(tempNode);
        } else {
          tempNode = { begin: begin + i, end: begin + i + 1 };
          tempNode.type = "text";
          tempNode.text = text[i];
          parts.push(tempNode);
        }
      }
      if (parts.length === 1) {
        return parts[0];
      }
      node.type = "cat";
      node.parts = parts;
    }
    return node;
  }
  return parseSub(text, 0, text.length, true);
}

function regexToNfa(text) {
  function generateGraph(node, start, end, count) {
    var i, last, temp, tempStart, tempEnd;
    if (!start.hasOwnProperty("id")) {
      start.id = count;
      count += 1;
    }
    switch (node.type) {
      case "empty":
        start.edges.push(["ϵ", end]);
        break;
      case "text":
        start.edges.push([node.text, end]);
        break;
      case "cat":
        last = start;
        for (i = 0; i < node.parts.length - 1; i += 1) {
          temp = { type: "", edges: [] };
          count = generateGraph(node.parts[i], last, temp, count);
          last = temp;
        }
        count = generateGraph(
          node.parts[node.parts.length - 1],
          last,
          end,
          count
        );
        break;
      case "or":
        for (i = 0; i < node.parts.length; i += 1) {
          tempStart = { type: "", edges: [] };
          tempEnd = { type: "", edges: [["ϵ", end]] };
          start.edges.push(["ϵ", tempStart]);
          count = generateGraph(node.parts[i], tempStart, tempEnd, count);
        }
        break;
      case "star":
        tempStart = { type: "", edges: [] };
        tempEnd = {
          type: "",
          edges: [
            ["ϵ", tempStart],
            ["ϵ", end],
          ],
        };
        start.edges.push(["ϵ", tempStart]);
        start.edges.push(["ϵ", end]);
        count = generateGraph(node.sub, tempStart, tempEnd, count);
        break;
    }
    if (!end.hasOwnProperty("id")) {
      end.id = count;
      count += 1;
    }
    return count;
  }
  var ast = parseRegex(text),
    start = { type: "start", edges: [] },
    accept = { type: "accept", edges: [] };
  if (typeof ast === "string") {
    return ast;
  }
  generateGraph(ast, start, accept, 0);
  return start;
}

function convertRegexToNFA() {
  const regexInput = document.getElementById("regexPattern").value;
  if (!regexInput.trim()) {
    alert("Please enter a regex pattern.");
    return;
  }

  const nfa = regexToNfa(regexInput); 
  const finalStates = Array.isArray(nfa.finalStates) ? nfa.finalStates : [];
  const display = displayNfa(nfa, finalStates);
  document.getElementById("nfaResult").innerHTML = display;

  const mermaidDefinition = buildGraphDefinitionFromNFA(nfa); 
  const targetDiv = document.getElementById("graphRegexNFA");

  if (targetDiv) {
    renderGraph(mermaidDefinition, "graphRegexNFA");
  }
}

function displayNfa(nfa, finalStates) {
  if (typeof nfa === "string") {
    return "Error: " + nfa;
  }

  let tableData = {};
  let visited = new Set();

  function exploreNode(node) {
    const nodeId = node.id.toString();
    if (!tableData[nodeId]) {
      tableData[nodeId] = {}; // Initialize if not already done
    }

    node.edges.forEach((edge) => {
      let symbol = edge[0];
      let targetNode = edge[1];
      let targetState = targetNode.id.toString();

      if (!tableData[nodeId][symbol]) {
        tableData[nodeId][symbol] = new Set();
      }
      tableData[nodeId][symbol].add(targetState);

      if (!visited.has(targetState)) {
        visited.add(targetState);
        exploreNode(targetNode);
      }
    });
  }

  exploreNode(nfa);

  // Final states processing - ensuring they exist in tableData
  finalStates.forEach((state) => {
    if (!tableData[state]) {
      tableData[state] = {}; // Initialize if final state has no outgoing transitions
    }
  });

  return generateHtmlTable(tableData, finalStates, nfa.id);
}

function generateHtmlTable(tableData, finalStates, initialState) {
  let symbols = new Set(
    Object.values(tableData).flatMap((trans) => Object.keys(trans))
  );
  symbols = Array.from(symbols).sort();

  let html = `<h2 class="text-lg font-semibold text-violet-700 mt-4 mb-2">Transition Table</h2>
  <div class="text-sm font-medium text-gray-900">Initial State: ${initialState}</div>`;
  html += `<div class="text-sm font-medium text-gray-900">Final States: ${finalStates.join(
    ", "
  )}</div>`;

  html += `<table class="min-w-full
    divide-y divide-gray-200 mt-4 shadow-sm border-b border-gray-200 sm:rounded-lg"><thead class="bg-gray-50"><tr>`;
  html += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State \\ Symbol</th>`;
  symbols.forEach((symbol) => {
    html += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">${symbol}</th>`;
  });
  html += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

  Object.keys(tableData)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((state) => {
      html += `<tr><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${state}</td>`;
      symbols.forEach((symbol) => {
        let targetStates = tableData[state][symbol]
          ? Array.from(tableData[state][symbol]).join(", ")
          : "—";
        html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${targetStates}</td>`;
      });
      html += `</tr>`;
    });
  html += `</tbody></table>`;

  return html;
}

function buildGraphDefinitionFromNFA(nfa) {
  let mermaidDef = "graph LR\n";
  let visited = new Set();

  function processNode(node) {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    if (node.edges) {
      node.edges.forEach((edge) => {
        const symbol = edge[0];
        const targetNode = edge[1];
        mermaidDef += `    ${node.id} -->|${symbol}| ${targetNode.id}\n`;
        processNode(targetNode); 
      });
    }
  }

  processNode(nfa);
  return mermaidDef;
}
