let map;
let routeLine;
let markers = [];
let userMarker;
let lines = {};
const graph = {};
const stationsData = {};



document.addEventListener("DOMContentLoaded", async function () {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  map = L.map("map").setView([-6.2000, 106.8166], 12);
  const response = await fetch("transjakarta.json");
  const data = await response.json();

  lines = data.lines;

  buildGraph();
  populateDropdown();


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);


  stations.forEach(station => {
    let option1 = document.createElement("option");
    option1.value = station;
    option1.textContent = station;

    let option2 = document.createElement("option");
    option2.value = station;
    option2.textContent = station;

    fromSelect.appendChild(option1);
    toSelect.appendChild(option2);
  });
});

function searchRoute() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const resultDiv = document.getElementById("result");

  if (!from || !to) {
    alert("Pilih asal dan tujuan dulu");
    return;
  }

  if (from === to) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "Kamu sudah berada di tujuan.";
    return;
  }

  const path = bfs(graph, from, to);

  if (!path) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "Rute tidak ditemukan.";
    return;
  }

  // =====================
  // TAMPILKAN TEKS RUTE
  // =====================
  resultDiv.style.display = "block";
  resultDiv.innerHTML =
    "<strong>Rute:</strong><br>" +
    path.join(" → ") +
    "<br><br>Total " +
    (path.length - 1) +
    " pemberhentian";

  // =====================
  // UPDATE MAP
  // =====================

  // Hapus marker lama
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // Hapus garis lama
  if (routeLine) {
    map.removeLayer(routeLine);
  }

  let latlngs = [];

  path.forEach((station, index) => {
    const coord = stationsData[station].coords;
    latlngs.push(coord);

    let marker;

    // Marker awal hijau
    if (index === 0) {
      marker = L.marker(coord).addTo(map).bindPopup("🚩 " + station);
    }
    // Marker tujuan merah
    else if (index === path.length - 1) {
      marker = L.marker(coord).addTo(map).bindPopup("🏁 " + station);
    }
    // Marker tengah
    else {
      marker = L.marker(coord).addTo(map).bindPopup(station);
    }

    markers.push(marker);
  });

  // Gambar garis rute
  routeLine = L.polyline(latlngs).addTo(map);

  // Zoom otomatis
  map.fitBounds(routeLine.getBounds());
  
}

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

      if (userMarker) {
        map.removeLayer(userMarker);
      }

      userMarker = L.marker(userCoords)
        .addTo(map)
        .bindPopup("📍 Lokasi Anda")
        .openPopup();

      map.setView(userCoords, 14);

      let nearestStation = null;
      let shortestDistance = Infinity;

      for (let station in stationCoords) {
        const stationLat = stationsData[station].coords[0];
        const stationLng = stationsData[station].coords[1];

        const distance = calculateDistance(
          userLat,
          userLng,
          stationLat,
          stationLng
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestStation = station;
        }
      }

      // Set dropdown otomatis
      document.getElementById("from").value = nearestStation;

      // Tampilkan info jarak
      document.getElementById("nearestInfo").innerText =
        "🎯 Stasiun terdekat: " +
        nearestStation +
        " (" +
        shortestDistance.toFixed(2) +
        " km)";

      // Jika tujuan sudah dipilih → auto cari rute
      const destination = document.getElementById("to").value;
      if (destination) {
        searchRoute(); // ← ini yang benar
      }
    },
    error => {
      alert("Gagal mendapatkan lokasi");
    }
  );
}

function buildGraph() {

  for (let lineName in lines) {

    const stations = lines[lineName];

    stations.forEach((station, index) => {

      stationsData[station.name] = {
        mode: "TransJakarta",
        line: lineName,
        coords: station.coords
      };

      if (!graph[station.name]) {
        graph[station.name] = [];
      }

      if (index > 0) {
        const prev = stations[index - 1].name;
        graph[station.name].push(prev);
        graph[prev].push(station.name);
      }

    });
  }
}
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

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

