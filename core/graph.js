export function buildGraph(modas, integrations) {

  Object.keys(graph).forEach(key => delete graph[key]);
  Object.keys(stationCoords).forEach(key => delete stationCoords[key]);

  modas.forEach(moda => {

    if (!moda.lines) return;

    // 🔥 Kalau lines berbentuk ARRAY (TransJakarta)
    if (Array.isArray(moda.lines)) {

      moda.lines.forEach(line => {

        const stops = line.stops || line.stations;

        stops.forEach((stop, i) => {

          stationCoords[stop.name] = stop.coords;

          if (!graph[stop.name]) graph[stop.name] = [];

          if (i > 0) {
            const prev = stops[i - 1];

            addEdge(stop.name, prev.name, moda.mode, line.name);
            addEdge(prev.name, stop.name, moda.mode, line.name);
          }
        });

      });

    } 
    // 🔥 Kalau lines berbentuk OBJECT (MRT/LRT)
    else {

      Object.entries(moda.lines).forEach(([lineName, stops]) => {

        stops.forEach((stop, i) => {

          stationCoords[stop.name] = stop.coords;

          if (!graph[stop.name]) graph[stop.name] = [];

          if (i > 0) {
            const prev = stops[i - 1];

            addEdge(stop.name, prev.name, moda.mode, lineName);
            addEdge(prev.name, stop.name, moda.mode, lineName);
          }
        });

      });

    }

  });

  // 🔥 Integrasi
  if (integrations?.walkConnections) {
    integrations.walkConnections.forEach(link => {

      if (!graph[link.from]) graph[link.from] = [];
      if (!graph[link.to]) graph[link.to] = [];

      addEdge(link.from, link.to, "WALK", "Jalan Kaki");
      addEdge(link.to, link.from, "WALK", "Jalan Kaki");
    });
  }

  console.log("Total stasiun dalam graph:", Object.keys(graph).length);
}