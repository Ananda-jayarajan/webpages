(function () {
  const display = document.getElementById("display");

  let expr = "";
  let ans = 0;
  let memory = 0;
  let deg = true;

  function show(value) {
    display.textContent = String(value || "0");
  }

  function cleanForEval(value) {
    return value
      .replace(/π/g, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/×/g, "*")
      .replace(/−/g, "-")
      .replace(/\^/g, "**");
  }

  function factorial(number) {
    number = Number(number);

    if (number < 0 || Math.floor(number) !== number) {
      return NaN;
    }

    let result = 1;

    for (let i = 2; i <= number; i += 1) {
      result *= i;
    }

    return result;
  }

  function value() {
    try {
      if (!expr) {
        return 0;
      }

      const sin = (x) => Math.sin(deg ? (x * Math.PI) / 180 : x);
      const cos = (x) => Math.cos(deg ? (x * Math.PI) / 180 : x);
      const tan = (x) => Math.tan(deg ? (x * Math.PI) / 180 : x);
      const asin = (x) => (deg ? (Math.asin(x) * 180) / Math.PI : Math.asin(x));
      const acos = (x) => (deg ? (Math.acos(x) * 180) / Math.PI : Math.acos(x));
      const atan = (x) => (deg ? (Math.atan(x) * 180) / Math.PI : Math.atan(x));
      const ln = Math.log;
      const log = Math.log10;
      const sqrt = Math.sqrt;
      const pow = Math.pow;

      return Function(
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "ln",
        "log",
        "sqrt",
        "pow",
        "factorial",
        "return (" + cleanForEval(expr) + ")"
      )(sin, cos, tan, asin, acos, atan, ln, log, sqrt, pow, factorial);
    } catch (error) {
      return "Error";
    }
  }

  function wrap(fn) {
    expr = fn + "(" + (expr || "0") + ")";
    show(expr);
  }

  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const val = button.dataset.value;
      const op = button.dataset.op;
      const action = button.dataset.action;

      if (val) {
        expr += val === "pi" ? "π" : val;
        show(expr);
        return;
      }

      if (op) {
        expr += op === "*" ? "×" : op === "-" ? "−" : op;
        show(expr);
        return;
      }

      switch (action) {
        case "clear":
          expr = "";
          show(0);
          break;

        case "back":
          expr = expr.slice(0, -1);
          show(expr);
          break;

        case "equals": {
          const result = value();
          ans = result;
          expr = String(result);
          show(result);
          break;
        }

        case "ans":
          expr += String(ans);
          show(expr);
          break;

        case "sin":
          wrap("sin");
          break;

        case "cos":
          wrap("cos");
          break;

        case "tan":
          wrap("tan");
          break;

        case "asin":
          wrap("asin");
          break;

        case "acos":
          wrap("acos");
          break;

        case "atan":
          wrap("atan");
          break;

        case "ln":
          wrap("ln");
          break;

        case "log":
          wrap("log");
          break;

        case "sqrt":
          wrap("sqrt");
          break;

        case "cuberoot":
          expr = "pow(" + (expr || "0") + ",1/3)";
          show(expr);
          break;

        case "yroot":
          expr = "pow(" + (expr || "0") + ",1/";
          show(expr);
          break;

        case "square":
          expr = "(" + (expr || "0") + ")^2";
          show(expr);
          break;

        case "cube":
          expr = "(" + (expr || "0") + ")^3";
          show(expr);
          break;

        case "pow":
          expr += "^";
          show(expr);
          break;

        case "exp":
          expr = "pow(e," + (expr || "0") + ")";
          show(expr);
          break;

        case "pow10":
          expr = "pow(10," + (expr || "0") + ")";
          show(expr);
          break;

        case "reciprocal":
          expr = "1/(" + (expr || "0") + ")";
          show(expr);
          break;

        case "percent":
          expr = "(" + (expr || "0") + ")/100";
          show(expr);
          break;

        case "factorial":
          expr = "factorial(" + (expr || "0") + ")";
          show(expr);
          break;

        case "sign":
          expr = "-(" + (expr || "0") + ")";
          show(expr);
          break;

        case "rnd":
          expr += String(Math.random());
          show(expr);
          break;

        case "expNotation":
          expr += "E";
          show(expr);
          break;

        case "mplus":
          memory += Number(value()) || 0;
          break;

        case "mminus":
          memory -= Number(value()) || 0;
          break;

        case "mr":
          expr += String(memory);
          show(expr);
          break;

        default:
          break;
      }
    });
  });
})();
