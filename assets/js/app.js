let map;
let routeLine;
let markers = [];
let userMarker;

let lines = {};
const graph = {};
const stationsData = {};

document.addEventListener("DOMContentLoaded", async function () {

  map = L.map("map").setView([-6.2000, 106.8166], 12);

  // Load map tile
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // =====================
  // LOAD JSON DATA
  // =====================
  try {
    const response = await fetch("transjakarta.json");
    const data = await response.json();
    lines = data.lines;

    buildGraph();       // bangun graph otomatis dari JSON
    populateDropdown(); // isi dropdown From/To dari JSON
  } catch (error) {
    alert("Gagal load data transport: " + error);
  }
});

// =====================
// SEARCH ROUTE
// =====================
function getModeColor(mode) {
  switch(mode) {
    case "TransJakarta": return "#0074D9"; // biru
    case "KRL": return "#FF4136";         // merah
    case "MRT": return "#FFDC00";         // kuning
    case "LRT Jabodebek": return "#2ECC40"; // hijau muda
    case "LRT Jakarta": return "#006400";   // hijau tua
    default: return "#0074D9";
  }
}

function searchRoute() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const resultDiv = document.getElementById("result");

  if (!from || !to) { alert("Pilih asal dan tujuan dulu"); return; }
  if (from === to) { resultDiv.style.display="block"; resultDiv.innerHTML="Kamu sudah berada di tujuan."; return; }

  const path = bfs(graph, from, to);
  if (!path) { resultDiv.style.display="block"; resultDiv.innerHTML="Rute tidak ditemukan."; return; }

  resultDiv.style.display = "block";
  resultDiv.innerHTML = "<strong>Rute:</strong><br>" + path.join(" → ") + "<br><br>Total " + (path.length-1) + " pemberhentian";

  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (routeLine) map.removeLayer(routeLine);

  let latlngs = [];
  path.forEach((station, idx) => {
    const data = stationsData[station];
    const coord = data.coords;
    latlngs.push(coord);

    const color = getModeColor(data.mode);

    // Marker
    const marker = L.circleMarker(coord, {
      radius: 7,
      color: color,
      fillColor: color,
      fillOpacity: 1
    }).addTo(map).bindPopup(station + " (" + data.mode + ")");

    markers.push(marker);
  });

  // Polyline
  const mode = stationsData[path[0]].mode;
  routeLine = L.polyline(latlngs, { color: getModeColor(mode), weight:5 }).addTo(map);
  map.fitBounds(routeLine.getBounds());
}



// =====================
// DETECT LOCATION
// =====================
function detectLocation() {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung GPS");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const userCoords = [userLat, userLng];

      if (userMarker) map.removeLayer(userMarker);

      userMarker = L.marker(userCoords)
        .addTo(map)
        .bindPopup("📍 Lokasi Anda")
        .openPopup();

      map.setView(userCoords, 14);

      // Cari stasiun terdekat
      let nearestStation = null;
      let shortestDistance = Infinity;

      for (let station in stationsData) {
        const [stationLat, stationLng] = stationsData[station].coords;
        const distance = calculateDistance(userLat, userLng, stationLat, stationLng);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestStation = station;
        }
      }

      document.getElementById("from").value = nearestStation;
      document.getElementById("nearestInfo").innerText =
        "🎯 Stasiun terdekat: " +
        nearestStation +
        " (" +
        shortestDistance.toFixed(2) +
        " km)";

      // Jika tujuan sudah dipilih → auto cari rute
      if (document.getElementById("to").value) {
        searchRoute();
      }
    },
    error => {
      alert("Gagal mendapatkan lokasi: " + error.message);
    }
  );
}

// =====================
// BUILD GRAPH DARI JSON
// =====================
function buildGraph() {
  for (let lineName in lines) {
    const stations = lines[lineName];
    stations.forEach((station, index) => {
      // Simpan data
      stationsData[station.name] = {
        mode: "TransJakarta",
        line: lineName,
        coords: station.coords
      };

      // Inisialisasi graph
      if (!graph[station.name]) graph[station.name] = [];

      // Hubungkan ke stasiun sebelumnya
      if (index > 0) {
        const prev = stations[index - 1].name;
        graph[station.name].push(prev);
        graph[prev].push(station.name);
      }
    });
  }
}

// =====================
// POPULATE DROPDOWN
// =====================
function populateDropdown() {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");

  Object.keys(stationsData).forEach(station => {
    let option1 = document.createElement("option");
    option1.value = station;
    option1.textContent = station;

    let option2 = document.createElement("option");
    option2.value = station;
    option2.textContent = station;

    fromSelect.appendChild(option1);
    toSelect.appendChild(option2);
  });
}

// =====================
// HITUNG JARAK
// =====================
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
