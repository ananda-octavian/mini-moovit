import { buildGraph } from "../core/graph.js";
import { dijkstra } from "../core/dijkstra.js";
import { renderResult } from "./render.js";
import { findNearestStation } from "../core/nearest.js";
import { calculateFare } from "../core/fare.js";

const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const resultDiv = document.getElementById("result");
const searchBtn = document.getElementById("searchBtn");
const gpsBtn = document.getElementById("gpsBtn");

let graph = null;
let stations = {};
let stationCoords = {};
let map = null;
let routeLine = null;

// =======================
// BASE PATH (GitHub Pages Safe)
// =======================
const BASE_PATH = window.location.hostname.includes("github.io")
  ? "/mini-moovit/"
  : "/";

// =======================
// LOAD SEMUA JSON DATA
// =======================
async function loadData() {

  try {

    const files = [
      "data/transjakarta.json",
      "data/krl.json",
      "data/mrt.json",
      "data/lrt_jabodebek.json",
      "data/lrt_jakarta.json",
      "data/integrations.json"
    ];

    const responses = await Promise.all(
      files.map(f => fetch(BASE_PATH + f))
    );

    responses.forEach(res => {
      if (!res.ok) throw new Error("Gagal fetch: " + res.url);
    });

    const datasets = await Promise.all(
      responses.map(r => r.json())
    );

    // build graph
    graph = buildGraph(datasets);

    // kumpulkan semua stasiun unik + koordinat
    datasets.forEach(data => {

      if (!data.stations) return;

      data.stations.forEach(s => {
        stations[s.name] = s;

        if (s.lat && s.lng) {
          stationCoords[s.name] = [s.lat, s.lng];
        }
      });
    });

    populateDropdown();
    initMap();

    console.log("Semua data berhasil dimuat");

  } catch (err) {
    console.error("ERROR LOAD DATA:", err);
    resultDiv.innerHTML = "<b>Gagal memuat data. Cek console.</b>";
  }
}

// =======================
// DROPDOWN
// =======================
function populateDropdown() {

  fromSelect.innerHTML = "<option value=''>Pilih Asal</option>";
  toSelect.innerHTML = "<option value=''>Pilih Tujuan</option>";

  Object.keys(stations)
    .sort()
    .forEach(name => {
      fromSelect.add(new Option(name, name));
      toSelect.add(new Option(name, name));
    });
}

// =======================
// INIT MAP
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

  if (!graph) {
    alert("Data belum siap");
    return;
  }

  const from = fromSelect.value;
  const to = toSelect.value;

  if (!from || !to) {
    alert("Pilih asal & tujuan");
    return;
  }

  const result = dijkstra(graph, from, to);

  if (!result || !result.path || result.path.length === 0) {
    resultDiv.innerHTML = "Rute tidak ditemukan";
    return;
  }

  // hitung tarif sesuai aturan kompleks
  const totalFare = calculateFare(result, stationCoords);

  renderResult(result, resultDiv);

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
    .map(name => {
      const s = stations[name];
      if (!s || !s.lat || !s.lng) return null;
      return [s.lat, s.lng];
    })
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

    const nearest = findNearestStation(lat, lng, stations);

    if (nearest) {
      fromSelect.value = nearest.name;
    }

  }, err => {
    console.error(err);
    alert("Gagal mengambil lokasi");
  });
});

// =======================
// START APP
// =======================
document.addEventListener("DOMContentLoaded", loadData);
