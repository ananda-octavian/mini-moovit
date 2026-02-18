import { calculateDistance } from "./distance.js";

export function calculateFare(result, stationCoords) {

  let totalFare = 0;

  let krlDistance = 0;
  let lrtJabodebekDistance = 0;
  let mrtStops = 0;
  let lrtJakartaUsed = false;
  let tjUsed = false;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Minggu, 6 = Sabtu

  const isWeekend = (day === 0 || day === 6);

  const path = result.path;
  const prev = result.prev;

  for (let i = 1; i < path.length; i++) {

    const data = prev[path[i]];
    if (!data) continue;

    const coord1 = stationCoords[path[i - 1]];
    const coord2 = stationCoords[path[i]];

    // ====================
    // KRL
    // ====================
    if (data.mode === "KRL") {
      krlDistance += calculateDistance(coord1, coord2);
    }

    // ====================
    // MRT
    // ====================
    if (data.mode === "MRT") {
      mrtStops++;
    }

    // ====================
    // LRT Jabodebek
    // ====================
    if (data.mode === "LRT Jabodebek") {
      lrtJabodebekDistance += calculateDistance(coord1, coord2);
    }

    // ====================
    // LRT Jakarta
    // ====================
    if (data.mode === "LRT Jakarta") {
      lrtJakartaUsed = true;
    }

    // ====================
    // TransJakarta
    // ====================
    if (data.mode === "TransJakarta") {
      tjUsed = true;
    }
  }

  // ====================
  // HITUNG KRL
  // ====================
  if (krlDistance > 0) {
    if (krlDistance <= 25) {
      totalFare += 3000;
    } else {
      totalFare += 3000;
      let remaining = krlDistance - 25;
      let extra = Math.ceil(remaining / 10);
      totalFare += extra * 1000;
    }
  }

  // ====================
  // HITUNG MRT
  // ====================
  if (mrtStops > 0) {
    totalFare += 3000 + ((mrtStops - 1) * 1000);
  }

  // ====================
  // HITUNG LRT JABODEBEK
  // ====================
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

  // ====================
  // HITUNG LRT JAKARTA
  // ====================
  if (lrtJakartaUsed) {
    totalFare += 5000;
  }

  // ====================
  // HITUNG TRANSJAKARTA
  // ====================
  if (tjUsed) {
    if (hour >= 5 && hour < 7) {
      totalFare += 2000;
    } else {
      totalFare += 3500;
    }
  }

  return {
    totalFare
  };
}
