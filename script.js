function convert() {
  let vin = parseFloat(document.getElementById("input").value);
  let from = parseFloat(document.getElementById("from").value);
  let to = parseFloat(document.getElementById("to").value);

  let out = vin + from - to;

  document.getElementById("result").innerText = out.toFixed(3);
}
