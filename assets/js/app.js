let map;
let routeLine;
let markers = [];
let userMarker;


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

      // Hapus marker lama
      if (userMarker) {
        map.removeLayer(userMarker);
      }

      // Tambah marker user
      userMarker = L.marker(userCoords)
        .addTo(map)
        .bindPopup("📍 Lokasi Anda")
        .openPopup();

      map.setView(userCoords, 14);

      // Cari stasiun terdekat
      let nearestStation = null;
      let shortestDistance = Infinity;

      for (let station in stationCoords) {
        const stationLat = stationCoords[station][0];
        const stationLng = stationCoords[station][1];

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

      alert("Stasiun terdekat: " + nearestStation);
    },
    error => {
      alert("Gagal mendapatkan lokasi");
    }
  );
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

