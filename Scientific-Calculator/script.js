const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keysEl = document.getElementById("keys");
const angleBtn = document.getElementById("angleBtn");

let expression = "";
let answer = 0;
let previousAnswer = 0;
let memory = 0;
let angleMode = "DEG";
let justSolved = false;
let shiftMode = false;
let alphaMode = false;

const rows = [
  [
    { text: "SHIFT", action: "shift", class: "yellow-key wide-text" },
    { text: "ALPHA", action: "alpha", class: "purple-key wide-text" },
    { text: "◄", action: "back" },
    { text: "►", action: "noop" },
    { text: "MODE", action: "toggleAngle", class: "wide-text" }
  ],
  [
    { text: "CALC", topL: "SOLVE", topR: "=", action: "noop", shiftAction: "equals", alphaValue: "=", class: "wide-text" },
    { text: "∫dx", topL: "d/dx", topR: ":", action: "noop", alphaValue: ":", class: "wide-text" },
    { text: "▲", action: "noop" },
    { text: "▼", action: "noop" },
    { text: "x⁻¹", topL: "x!", topR: "Σ", action: "reciprocal", shiftAction: "factorial", alphaValue: "sum(" }
  ],
  [
    { text: "x/y", topL: "ˣʸ⁄𝓏", topR: "÷R", value: "/", alphaValue: "/", class: "small" },
    { text: "√x", topL: "³√x", topR: "mod", action: "sqrt", shiftAction: "cuberoot", alphaValue: "%" },
    { text: "x²", topL: "x³", topR: "▮", action: "square", shiftAction: "cube", alphaValue: "|" },
    { text: "xʸ", topL: "ˣ√y", action: "power", shiftAction: "root" },
    { text: "Log", topL: "10ˣ", action: "log", shiftAction: "pow10" }
  ],
  [
    { text: "Ln", topL: "eˣ", topR: "t", action: "ln", shiftAction: "powe", alphaValue: "t" },
    { text: "(-)", topL: "∠", topR: "a", action: "sign", alphaValue: "a" },
    { text: "°'\"", topL: "FACT", topR: "b", action: "noop", shiftAction: "factorial", alphaValue: "b" },
    { text: "hyp", topL: "|x|", topR: "c", action: "abs", alphaValue: "c" },
    { text: "Sin", topL: "Sin⁻¹", topR: "d", action: "sin", shiftAction: "asin", alphaValue: "d" }
  ],
  [
    { text: "Cos", topL: "Cos⁻¹", topR: "e", action: "cos", shiftAction: "acos", alphaValue: "e" },
    { text: "Tan", topL: "Tan⁻¹", topR: "f", action: "tan", shiftAction: "atan", alphaValue: "f" },
    { text: "RCL", topL: "STO", topR: "CLRV", action: "memoryRecall", shiftAction: "memoryStore", alphaAction: "memoryClear" },
    { text: "ENG", topL: "i", topR: "Cot", action: "expNotation", alphaValue: "cot(" },
    { text: "(", topL: "%", topR: "Cot⁻¹", value: "(", shiftAction: "percent", alphaValue: "acot(" }
  ],
  [
    { text: ")", topL: ",", topR: "x", value: ")", shiftValue: ",", alphaValue: "x" },
    { text: "S⇔D", topL: "ˣ⁄ᵧ", topR: "y", action: "percent", alphaValue: "y", class: "wide-text" },
    { text: "M+", topL: "M−", topR: "m", action: "memoryPlus", shiftAction: "memoryMinus", alphaValue: "m" },
    { text: "7", value: "7", class: "number" },
    { text: "8", value: "8", class: "number" }
  ],
  [
    { text: "9", value: "9", class: "number" },
    { text: "⌫", action: "back", class: "del" },
    { text: "AC", action: "clear", class: "ac" },
    { text: "4", value: "4", class: "number" },
    { text: "5", value: "5", class: "number" }
  ],
  [
    { text: "6", value: "6", class: "number" },
    { text: "×", value: "*", class: "operator" },
    { text: "÷", value: "/", class: "operator" },
    { text: "1", value: "1", class: "number" },
    { text: "2", value: "2", class: "number" }
  ],
  [
    { text: "3", value: "3", class: "number" },
    { text: "+", value: "+", class: "operator" },
    { text: "−", value: "-", class: "operator" },
    { text: "0", value: "0", class: "number" },
    { text: ".", value: ".", class: "number" }
  ],
  [
    { text: "Exp", topL: "π", value: "E", shiftValue: "π", class: "number wide-text" },
    { text: "Ans", topL: "e", action: "answer", shiftValue: "e", class: "number wide-text" },
    { text: "=", topL: "PreAns", topR: "History", action: "equals", shiftAction: "previousAnswer", class: "equals" },
    { empty: true },
    { empty: true }
  ]
];

/*
  Correct phone-style order is:
  7 8 9 DEL AC
  4 5 6 × ÷
  1 2 3 + −
  0 . Exp Ans =
*/
const fixedRows = [
  rows[0],
  rows[1],
  rows[2],
  rows[3],
  rows[4],
  [
    { text: ")", topL: ",", topR: "x", value: ")", shiftValue: ",", alphaValue: "x" },
    { text: "S⇔D", topL: "ˣ⁄ᵧ", topR: "y", action: "percent", alphaValue: "y", class: "wide-text" },
    { text: "M+", topL: "M−", topR: "m", action: "memoryPlus", shiftAction: "memoryMinus", alphaValue: "m" },
    { empty: true },
    { empty: true }
  ],
  [
    { text: "7", topL: "CONST", value: "7", class: "number" },
    { text: "8", topL: "CONV", value: "8", class: "number" },
    { text: "9", topL: "SI", topR: "Limit", value: "9", class: "number" },
    { text: "⌫", topL: "∞", action: "back", class: "del" },
    { text: "AC", topL: "CLR", topR: "ALL", action: "clear", shiftAction: "clearMemory", class: "ac" }
  ],
  [
    { text: "4", topL: "MATRIX", topR: "▦", value: "4", class: "number" },
    { text: "5", topL: "VECTOR", value: "5", class: "number" },
    { text: "6", topL: "FUNC", topR: "HELP", value: "6", class: "number" },
    { text: "×", topL: "nPr", topR: "GCD", value: "*", class: "operator" },
    { text: "÷", topL: "nCr", topR: "LCM", value: "/", class: "operator" }
  ],
  [
    { text: "1", topL: "STAT", value: "1", class: "number" },
    { text: "2", topL: "CMPLX", value: "2", class: "number" },
    { text: "3", topL: "DISTR", value: "3", class: "number" },
    { text: "+", topL: "Pol", topR: "Ceil", value: "+", class: "operator" },
    { text: "−", topL: "Rec", topR: "Floor", value: "-", class: "operator" }
  ],
  [
    { text: "0", topL: "COPY", topR: "PASTE", value: "0", class: "number" },
    { text: ".", topL: "Ran#", topR: "RanInt", value: ".", shiftAction: "random", class: "number" },
    { text: "Exp", topL: "π", value: "E", shiftValue: "π", class: "number wide-text" },
    { text: "Ans", topL: "e", action: "answer", shiftValue: "e", class: "number wide-text" },
    { text: "=", topL: "PreAns", topR: "History", action: "equals", shiftAction: "previousAnswer", class: "equals" }
  ]
];

function createButton(config) {
  const wrap = document.createElement("div");

  if (config.empty) {
    wrap.className = "key-wrap empty-cell";
    return wrap;
  }

  wrap.className = "key-wrap";

  const top = document.createElement("div");
  top.className = "key-top";

  const left = document.createElement("span");
  left.className = "yellow";
  left.textContent = config.topL || "";

  const right = document.createElement("span");
  right.className = "purple";
  right.textContent = config.topR || "";

  top.append(left, right);

  const button = document.createElement("button");
  button.className = "key " + (config.class || "");
  button.innerHTML = config.text;

  button.dataset.config = JSON.stringify(config);

  wrap.append(top, button);
  return wrap;
}

fixedRows.flat().forEach((button) => {
  keysEl.appendChild(createButton(button));
});

function updateModeButtons() {
  document.querySelectorAll(".key").forEach((button) => {
    const config = JSON.parse(button.dataset.config || "{}");

    button.classList.toggle("shift-active", config.action === "shift" && shiftMode);
    button.classList.toggle("alpha-active", config.action === "alpha" && alphaMode);
  });
}

function resetModesAfterAlt() {
  if (shiftMode || alphaMode) {
    shiftMode = false;
    alphaMode = false;
    updateModeButtons();
  }
}

function render() {
  expressionEl.textContent = expression;

  if (!expression) {
    resultEl.textContent = "0";
    return;
  }

  resultEl.textContent = expression
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−");
}

function append(value) {
  if (justSolved && /[0-9.πe(]/.test(value)) {
    expression = "";
  }

  justSolved = false;
  expression += value;
  render();
}

function sanitize(input) {
  return input
    .replace(/π/g, "pi")
    .replace(/\^/g, "**")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");
}

function factorial(n) {
  n = Number(n);

  if (!Number.isInteger(n) || n < 0) return NaN;

  let total = 1;
  for (let i = 2; i <= n; i++) total *= i;

  return total;
}

function calculate() {
  try {
    if (!expression) return;

    const deg = angleMode === "DEG";
    const pi = Math.PI;
    const e = Math.E;

    const sin = (x) => Math.sin(deg ? x * pi / 180 : x);
    const cos = (x) => Math.cos(deg ? x * pi / 180 : x);
    const tan = (x) => Math.tan(deg ? x * pi / 180 : x);

    const asin = (x) => deg ? Math.asin(x) * 180 / pi : Math.asin(x);
    const acos = (x) => deg ? Math.acos(x) * 180 / pi : Math.acos(x);
    const atan = (x) => deg ? Math.atan(x) * 180 / pi : Math.atan(x);

    const log = Math.log10;
    const ln = Math.log;
    const sqrt = Math.sqrt;
    const cbrt = Math.cbrt;
    const abs = Math.abs;
    const pow = Math.pow;
    const root = (x, y) => Math.pow(y, 1 / x);

    const result = Function(
      "pi",
      "e",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "log",
      "ln",
      "sqrt",
      "cbrt",
      "abs",
      "pow",
      "root",
      "factorial",
      `"use strict"; return (${sanitize(expression)});`
    )(pi, e, sin, cos, tan, asin, acos, atan, log, ln, sqrt, cbrt, abs, pow, root, factorial);

    previousAnswer = answer;
    answer = result;
    expressionEl.textContent = expression;
    resultEl.textContent = formatResult(result);
    expression = String(result);
    justSolved = true;
  } catch {
    resultEl.textContent = "Error";
    justSolved = true;
  }
}

function formatResult(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Error";

  if (Math.abs(value) > 999999999999 || (Math.abs(value) < 0.000001 && value !== 0)) {
    return value.toExponential(8);
  }

  return String(Number(value.toPrecision(12)));
}

function wrapFunction(name) {
  expression += `${name}(`;
  justSolved = false;
  render();
}

function wrapExpression(prefix, suffix) {
  expression = `${prefix}${expression || "0"}${suffix}`;
  justSolved = false;
  render();
}

function runAction(action) {
  switch (action) {
    case "shift":
      shiftMode = !shiftMode;
      alphaMode = false;
      updateModeButtons();
      break;

    case "alpha":
      alphaMode = !alphaMode;
      shiftMode = false;
      updateModeButtons();
      break;

    case "clear":
      expression = "";
      justSolved = false;
      render();
      break;

    case "clearMemory":
      memory = 0;
      expression = "";
      justSolved = false;
      render();
      break;

    case "back":
      expression = expression.slice(0, -1);
      justSolved = false;
      render();
      break;

    case "equals":
      calculate();
      break;

    case "answer":
      append(String(answer));
      break;

    case "previousAnswer":
      append(String(previousAnswer));
      break;

    case "sin":
      wrapFunction("sin");
      break;

    case "cos":
      wrapFunction("cos");
      break;

    case "tan":
      wrapFunction("tan");
      break;

    case "asin":
      wrapFunction("asin");
      break;

    case "acos":
      wrapFunction("acos");
      break;

    case "atan":
      wrapFunction("atan");
      break;

    case "log":
      wrapFunction("log");
      break;

    case "ln":
      wrapFunction("ln");
      break;

    case "sqrt":
      wrapFunction("sqrt");
      break;

    case "cuberoot":
      wrapFunction("cbrt");
      break;

    case "abs":
      wrapExpression("abs(", ")");
      break;

    case "square":
      wrapExpression("(", ")^2");
      break;

    case "cube":
      wrapExpression("(", ")^3");
      break;

    case "power":
      append("^");
      break;

    case "root":
      append("root(");
      break;

    case "reciprocal":
      wrapExpression("1/(", ")");
      break;

    case "factorial":
      wrapExpression("factorial(", ")");
      break;

    case "pow10":
      wrapExpression("pow(10,", ")");
      break;

    case "powe":
      wrapExpression("pow(e,", ")");
      break;

    case "percent":
      wrapExpression("(", ")/100");
      break;

    case "sign":
      if (expression.startsWith("-(") && expression.endsWith(")")) {
        expression = expression.slice(2, -1);
      } else {
        wrapExpression("-(", ")");
      }
      render();
      break;

    case "expNotation":
      append("E");
      break;

    case "random":
      append(String(Math.random()));
      break;

    case "memoryPlus":
      calculate();
      memory += Number(answer) || 0;
      break;

    case "memoryMinus":
      calculate();
      memory -= Number(answer) || 0;
      break;

    case "memoryStore":
      calculate();
      memory = Number(answer) || 0;
      break;

    case "memoryRecall":
      append(String(memory));
      break;

    case "memoryClear":
      memory = 0;
      break;

    case "toggleAngle":
      angleMode = angleMode === "DEG" ? "RAD" : "DEG";
      angleBtn.textContent = angleMode;
      break;

    default:
      break;
  }
}

keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const config = JSON.parse(button.dataset.config || "{}");

  if (shiftMode && config.shiftValue !== undefined) {
    append(config.shiftValue);
    resetModesAfterAlt();
    return;
  }

  if (shiftMode && config.shiftAction) {
    runAction(config.shiftAction);
    resetModesAfterAlt();
    return;
  }

  if (alphaMode && config.alphaValue !== undefined) {
    append(config.alphaValue);
    resetModesAfterAlt();
    return;
  }

  if (alphaMode && config.alphaAction) {
    runAction(config.alphaAction);
    resetModesAfterAlt();
    return;
  }

  if (config.value !== undefined) {
    append(config.value);
    return;
  }

  if (config.action) {
    runAction(config.action);
  }
});

angleBtn.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  angleBtn.textContent = angleMode;
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) append(key);
  if (["+", "-", "*", "/", "(", ")"].includes(key)) append(key);
  if (key === "Enter") calculate();

  if (key === "Backspace") {
    expression = expression.slice(0, -1);
    render();
  }

  if (key === "Escape") {
    expression = "";
    render();
  }
});

render();
updateModeButtons();
