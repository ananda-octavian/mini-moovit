export function calculateFare(result, stationCoords) {

  let totalFare = 0;

  let krlDistance = 0;
  let lrtJabodebekDistance = 0;
  let mrtStops = 0;
  let lrtJakartaUsed = false;
  let tjUsed = false;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 Minggu, 6 Sabtu
  const isWeekend = (day === 0 || day === 6);

  const path = result.path;
  const prev = result.prev;

  for (let i = 1; i < path.length; i++) {

    const data = prev[path[i]];
    if (!data) continue;

    const coord1 = stationCoords[path[i - 1]];
    const coord2 = stationCoords[path[i]];

    // ===== KRL =====
    if (data.mode === "KRL") {
      krlDistance += distance(coord1, coord2);
    }

    // ===== MRT =====
    if (data.mode === "MRT") {
      mrtStops++;
    }

    // ===== LRT JABODEBEK =====
    if (data.mode === "LRT Jabodebek") {
      lrtJabodebekDistance += distance(coord1, coord2);
    }

    // ===== LRT JAKARTA =====
    if (data.mode === "LRT Jakarta") {
      lrtJakartaUsed = true;
    }

    // ===== TRANSJAKARTA =====
    if (data.mode === "TransJakarta") {
      tjUsed = true;
    }
  }

  // =========================
  // 🚆 KRL
  // =========================
  if (krlDistance > 0) {

    if (krlDistance <= 25) {
      totalFare += 3000;
    } else {
      totalFare += 3000;
      const remaining = krlDistance - 25;
      const extra = Math.ceil(remaining / 10);
      totalFare += extra * 1000;
    }
  }

  // =========================
  // 🚇 MRT
  // =========================
  if (mrtStops > 0) {
    totalFare += 3000 + ((mrtStops - 1) * 1000);
  }

  // =========================
  // 🚈 LRT JABODEBEK
  // =========================
  if (lrtJabodebekDistance > 0) {

    let fare = 5000 + Math.ceil(lrtJabodebekDistance * 700);

    let maxFare = 10000;

    if (!isWeekend) {

      if (
        (hour >= 6 && hour <= 8) ||
        (hour >= 16 && hour <= 19)
      ) {
        maxFare = 20000;
      } else {
        maxFare = 10000;
      }

    } else {
      maxFare = 10000;
    }

    if (fare > maxFare) fare = maxFare;

    totalFare += fare;
  }

  // =========================
  // 🚈 LRT JAKARTA
  // =========================
  if (lrtJakartaUsed) {
    totalFare += 5000;
  }

  // =========================
  // 🚌 TRANSJAKARTA
  // =========================
  if (tjUsed) {
    if (hour >= 5 && hour < 7) {
      totalFare += 2000;
    } else {
      totalFare += 3500;
    }
  }

  return totalFare;
}


// =========================
// Hitung jarak km (Haversine)
// =========================
function distance(coord1, coord2) {

  if (!coord1 || !coord2) return 0;

  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
