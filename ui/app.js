import { buildGraph, graph, stationCoords } from "../core/graph.js";
import { dijkstra } from "../core/dijkstra.js";
import { renderResult } from "./render.js";
import { findNearestStation } from "../core/nearest.js";
import { calculateFare } from "../core/fare.js";

const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const resultDiv = document.getElementById("result");
const searchBtn = document.getElementById("searchBtn");
const gpsBtn = document.getElementById("gpsBtn");

let map = null;
let routeLine = null;

// =======================
// BASE PATH
// =======================
const BASE_PATH = window.location.hostname.includes("github.io")
  ? "/mini-moovit/"
  : "/";

// =======================
// LOAD DATA
// =======================
async function loadData() {

  try {

    const modaFiles = [
      "data/transjakarta.json",
      "data/krl.json",
      "data/mrt.json",
      "data/lrt_jabodebek.json",
      "data/lrt_jakarta.json"
    ];

    const integrationsFile = "data/integrations.json";

    const modaResponses = await Promise.all(
      modaFiles.map(f => fetch(BASE_PATH + f))
    );

    const modas = await Promise.all(
      modaResponses.map(r => r.json())
    );

    const integrationsResponse = await fetch(BASE_PATH + integrationsFile);
    const integrations = await integrationsResponse.json();

    // 🔥 build graph (akan isi graph & stationCoords otomatis)
    buildGraph(modas, integrations);

    populateDropdown();
    initMap();

    console.log("Jumlah node:", Object.keys(graph).length);

  } catch (err) {
    console.error("ERROR LOAD DATA:", err);
    resultDiv.innerHTML = "<b>Gagal memuat data</b>";
  }
}

// =======================
// DROPDOWN
// =======================
function populateDropdown() {

  fromSelect.innerHTML = "<option value=''>Pilih Asal</option>";
  toSelect.innerHTML = "<option value=''>Pilih Tujuan</option>";

  Object.keys(graph)
    .sort()
    .forEach(name => {
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

  if (Object.keys(graph).length === 0) {
    alert("Data belum siap");
    return;
  }

  const from = fromSelect.value;
  const to = toSelect.value;

  if (!from || !to) {
    alert("Pilih asal & tujuan");
    return;
  }

  const result = dijkstra(from, to);

  if (!result || !result.path || result.path.length <= 1) {
    resultDiv.innerHTML = "Rute tidak ditemukan";
    return;
  }

  renderResult(result, resultDiv);

  const totalFare = calculateFare(result, stationCoords);

  resultDiv.innerHTML += `
    <hr>
    <h3>Total Tarif:</h3>
    <p><b>Rp ${totalFare.toLocaleString()}</b></p>
  `;

  drawRoute(result.path);
});

// =======================
// DRAW ROUTE
// =======================
function drawRoute(path) {

  if (!map) return;

  if (routeLine) {
    map.removeLayer(routeLine);
  }

  const latlngs = path
    .map(name => stationCoords[name])
    .filter(Boolean);

  if (latlngs.length === 0) return;

  routeLine = L.polyline(latlngs).addTo(map);
  map.fitBounds(routeLine.getBounds());
}

// =======================
// GPS
// =======================
gpsBtn.addEventListener("click", () => {

  if (!navigator.geolocation) {
    alert("GPS tidak didukung browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {

    if (!map) return;

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    map.setView([lat, lng], 14);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Lokasi Anda")
      .openPopup();

    const nearest = findNearestStation(lat, lng, stationCoords);

    if (nearest) {
      fromSelect.value = nearest.name;
    }

  }, err => {
    console.error(err);
    alert("Gagal mengambil lokasi");
  });
});

// =======================
// START
// =======================
document.addEventListener("DOMContentLoaded", loadData);
