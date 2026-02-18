export function findNearest(userCoords, stations) {

  let nearest = null;
  let min = Infinity;

  stations.forEach(station => {

    const d = Math.sqrt(
      Math.pow(userCoords[0] - station.coords[0],2) +
      Math.pow(userCoords[1] - station.coords[1],2)
    );

    if (d < min) {
      min = d;
      nearest = station;
    }
  });

  return nearest;
}
