import { buildGraph } from "../core/graph.js";
import { dijkstra } from "../core/dijkstra.js";
import { renderResult } from "./render.js";
import { findNearestStation } from "../core/nearest.js";

const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const resultDiv = document.getElementById("result");
const searchBtn = document.getElementById("searchBtn");
const gpsBtn = document.getElementById("gpsBtn");

let graph;
let stations = {};
let map;
let routeLine;

// =======================
// LOAD SEMUA DATA JSON
// =======================
async function loadData() {

  const files = [
    "data/transjakarta.json",
    "data/krl.json",
    "data/mrt.json",
    "data/lrt_jabodebek.json",
    "data/lrt_jakarta.json",
    "data/integrations.json"
  ];

  const responses = await Promise.all(files.map(f => fetch(f)));
  const datasets = await Promise.all(responses.map(r => r.json()));

  graph = buildGraph(datasets);

  // kumpulkan semua stasiun unik
  datasets.forEach(data => {
    data.stations.forEach(s => {
      stations[s.name] = s;
    });
  });

  populateDropdown();
  initMap();
}

function populateDropdown() {
  Object.keys(stations).forEach(name => {
    fromSelect.add(new Option(name, name));
    toSelect.add(new Option(name, name));
  });
}

// =======================
// MAP
// =======================
function initMap() {
  map = L.map("map").setView([-6.2, 106.8], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);
}

// =======================
// CARI RUTE
// =======================
searchBtn.addEventListener("click", () => {

  const from = fromSelect.value;
  const to = toSelect.value;

  if (!from || !to) {
    alert("Pilih asal & tujuan");
    return;
  }

  const result = dijkstra(graph, from, to);

  if (!result.path) {
    resultDiv.innerHTML = "Rute tidak ditemukan";
    return;
  }

  renderResult(result, resultDiv);

  drawRoute(result.path);
});

// =======================
// DRAW ROUTE
// =======================
function drawRoute(path) {

  if (routeLine) map.removeLayer(routeLine);

  const latlngs = path.map(name => {
    const s = stations[name];
    return [s.lat, s.lng];
  });

  routeLine = L.polyline(latlngs).addTo(map);
  map.fitBounds(routeLine.getBounds());
}

// =======================
// GPS
// =======================
gpsBtn.addEventListener("click", () => {

  if (!navigator.geolocation) {
    alert("GPS tidak didukung");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    map.setView([lat, lng], 14);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Lokasi Anda")
      .openPopup();

    const nearest = findNearestStation(lat, lng, stations);

    fromSelect.value = nearest.name;

  }, () => {
    alert("Gagal ambil lokasi");
  });
});

loadData();
