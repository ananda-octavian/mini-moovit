export function buildGraph(modas, integrations) {

  Object.keys(graph).forEach(key => delete graph[key]);
  Object.keys(stationCoords).forEach(key => delete stationCoords[key]);

  modas.forEach(moda => {

    if (!moda.lines) return;

    // ARRAY format
    if (Array.isArray(moda.lines)) {

      moda.lines.forEach(line => {

        const stops = line.stops || line.stations;
        if (!Array.isArray(stops)) return;

        stops.forEach((stop, i) => {

          if (!stop?.name || !stop?.coords) return;

          stationCoords[stop.name] = stop.coords;

          if (!graph[stop.name]) graph[stop.name] = [];

          if (i > 0) {
            const prev = stops[i - 1];

            if (!prev?.name) return;

            addEdge(stop.name, prev.name, moda.mode, line.name);
            addEdge(prev.name, stop.name, moda.mode, line.name);
          }
        });
      });

    } else {

      // OBJECT format
      Object.entries(moda.lines).forEach(([lineName, stops]) => {

        if (!Array.isArray(stops)) return;

        stops.forEach((stop, i) => {

          if (!stop?.name || !stop?.coords) return;

          stationCoords[stop.name] = stop.coords;

          if (!graph[stop.name]) graph[stop.name] = [];

          if (i > 0) {
            const prev = stops[i - 1];

            if (!prev?.name) return;

            addEdge(stop.name, prev.name, moda.mode, lineName);
            addEdge(prev.name, stop.name, moda.mode, lineName);
          }
        });
      });
    }

  });

  if (integrations?.walkConnections) {

    integrations.walkConnections.forEach(link => {

      if (!link?.from || !link?.to) return;

      if (!graph[link.from]) graph[link.from] = [];
      if (!graph[link.to]) graph[link.to] = [];

      addEdge(link.from, link.to, "WALK", "Jalan Kaki");
      addEdge(link.to, link.from, "WALK", "Jalan Kaki");
    });
  }

  console.log("Graph built:", Object.keys(graph).length, "stations");
}