import { buildGraph } from "../core/graph.js";
import { dijkstra } from "../core/dijkstra.js";
import { renderRoute } from "./render.js";

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function init() {

  const transjakarta = await loadJSON("../data/transjakarta.json");
  const krl = await loadJSON("../data/krl.json");
  const mrt = await loadJSON("../data/mrt.json");
  const lrtJ = await loadJSON("../data/lrt_jakarta.json");
  const lrtJB = await loadJSON("../data/lrt_jabodebek.json");
  const integrations = await loadJSON("../data/integrations.json");

  const modas = [transjakarta,krl,mrt,lrtJ,lrtJB];

  buildGraph(modas, integrations);

  const stations = Object.keys(graph);

  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");

  stations.forEach(s => {
    fromSelect.innerHTML += `<option value="${s}">${s}</option>`;
    toSelect.innerHTML += `<option value="${s}">${s}</option>`;
  });

  document.getElementById("searchBtn").onclick = () => {

    const result = dijkstra(fromSelect.value, toSelect.value);
    renderRoute(result);
  };
}

init();
