let map;
let routeLine;
let markers = [];

document.addEventListener("DOMContentLoaded", function () {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  map = L.map("map").setView([-6.2000, 106.8166], 12);

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
    const coord = stationCoords[station];
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
