const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keysEl = document.getElementById("keys");
const angleBtn = document.getElementById("angleBtn");

let expression = "";
let answer = 0;
let memory = 0;
let angleMode = "DEG";
let justSolved = false;

const buttons = [
  [
    { text: "SHIFT", class: "yellow-key wide-text" },
    { text: "ALPHA", class: "purple-key wide-text" },
    { text: "◄", action: "back" },
    { text: "►", action: "noop" },
    { text: "MODE", action: "toggleAngle", class: "wide-text" }
  ],
  [
    { text: "CALC", topL: "SOLVE", topR: "=", action: "noop", class: "wide-text" },
    { text: "∫dx", topL: "d/dx", topR: ":", action: "noop", class: "wide-text" },
    { text: "▲", action: "noop" },
    { text: "▼", action: "noop" },
    { text: "x⁻¹", topL: "x!", topR: "Σ", action: "reciprocal" }
  ],
  [
    { text: "x/y", topL: "ˣʸ⁄𝓏", topR: "÷R", value: "/", class: "small" },
    { text: "√x", topL: "³√x", topR: "mod", action: "sqrt" },
    { text: "x²", topL: "x³", topR: "▮", action: "square" },
    { text: "xʸ", topL: "ˣ√y", action: "power" },
    { text: "Log", topL: "10ˣ", action: "log" }
  ],
  [
    { text: "Ln", topL: "eˣ", topR: "t", action: "ln" },
    { text: "(-)", topL: "∠", topR: "a", action: "sign" },
    { text: "°'\"", topL: "FACT", topR: "b", action: "noop" },
    { text: "hyp", topL: "|x|", topR: "c", action: "abs" },
    { text: "Sin", topL: "Sin⁻¹", topR: "d", action: "sin" }
  ],
  [
    { text: "Cos", topL: "Cos⁻¹", topR: "e", action: "cos" },
    { text: "Tan", topL: "Tan⁻¹", topR: "f", action: "tan" },
    { text: "RCL", topL: "STO", topR: "CLRV", action: "memoryRecall" },
    { text: "ENG", topL: "i", topR: "Cot", action: "expNotation" },
    { text: "(", topL: "%", topR: "Cot⁻¹", value: "(" }
  ],
  [
    { text: ")", topL: ",", topR: "x", value: ")" },
    { text: "S⇔D", topL: "ˣ⁄ᵧ", topR: "y", action: "percent", class: "wide-text" },
    { text: "M+", topL: "M−", topR: "m", action: "memoryPlus" },
    { text: "7", topL: "CONST", value: "7", class: "number" },
    { text: "8", topL: "CONV", value: "8", class: "number" }
  ],
  [
    { text: "9", topL: "SI", topR: "Limit", value: "9", class: "number" },
    { text: "⌫", topL: "∞", action: "back", class: "del" },
    { text: "AC", topL: "CLR", topR: "ALL", action: "clear", class: "ac" },
    { text: "4", topL: "MATRIX", topR: "▦", value: "4", class: "number" },
    { text: "5", topL: "VECTOR", value: "5", class: "number" }
  ],
  [
    { text: "6", topL: "FUNC", topR: "HELP", value: "6", class: "number" },
    { text: "×", topL: "nPr", topR: "GCD", value: "*", class: "operator" },
    { text: "÷", topL: "nCr", topR: "LCM", value: "/", class: "operator" },
    { text: "1", topL: "STAT", value: "1", class: "number" },
    { text: "2", topL: "CMPLX", value: "2", class: "number" }
  ],
  [
    { text: "3", topL: "DISTR", value: "3", class: "number" },
    { text: "+", topL: "Pol", topR: "Ceil", value: "+", class: "operator" },
    { text: "−", topL: "Rec", topR: "Floor", value: "-", class: "operator" },
    { text: "0", topL: "COPY", topR: "PASTE", value: "0", class: "number" },
    { text: ".", topL: "Ran#", topR: "RanInt", value: ".", class: "number" }
  ],
  [
    { text: "Exp", topL: "π", value: "E", class: "number wide-text" },
    { text: "Ans", topL: "e", action: "answer", class: "number wide-text" },
    { text: "=", topL: "PreAns", topR: "History", action: "equals", class: "equals" }
  ]
];

function createButton(config) {
  const wrap = document.createElement("div");
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

  if (config.value !== undefined) button.dataset.value = config.value;
  if (config.action) button.dataset.action = config.action;

  wrap.append(top, button);
  return wrap;
}

buttons.flat().forEach((button) => {
  keysEl.appendChild(createButton(button));
});

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
    const abs = Math.abs;
    const pow = Math.pow;

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
      "abs",
      "pow",
      "factorial",
      `"use strict"; return (${sanitize(expression)});`
    )(pi, e, sin, cos, tan, asin, acos, atan, log, ln, sqrt, abs, pow, factorial);

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

  if (Math.abs(value) > 999999999999 || Math.abs(value) < 0.000001 && value !== 0) {
    return value.toExponential(8);
  }

  return String(Number(value.toPrecision(12)));
}

function wrapFunction(name) {
  if (justSolved) justSolved = false;
  expression += `${name}(`;
  render();
}

function wrapExpression(prefix, suffix) {
  expression = `${prefix}${expression || "0"}${suffix}`;
  justSolved = false;
  render();
}

keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (value !== undefined) {
    append(value);
    return;
  }

  switch (action) {
    case "clear":
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

    case "sin":
      wrapFunction("sin");
      break;

    case "cos":
      wrapFunction("cos");
      break;

    case "tan":
      wrapFunction("tan");
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

    case "abs":
      wrapFunction("abs");
      break;

    case "square":
      wrapExpression("(", ")^2");
      break;

    case "power":
      append("^");
      break;

    case "reciprocal":
      wrapExpression("1/(", ")");
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

    case "memoryPlus":
      calculate();
      memory += Number(answer) || 0;
      break;

    case "memoryRecall":
      append(String(memory));
      break;

    case "toggleAngle":
      angleMode = angleMode === "DEG" ? "RAD" : "DEG";
      angleBtn.textContent = angleMode;
      break;

    default:
      break;
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
