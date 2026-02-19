export let graph = {};
export let stationCoords = {};

function addEdge(a, b, mode, lineName) {
  if (!graph[a]) graph[a] = [];
  graph[a].push({ node: b, mode, line: lineName });
}

export function buildGraph(modas, integrations) {

  // 🔥 jangan reassign
  Object.keys(graph).forEach(key => delete graph[key]);
  Object.keys(stationCoords).forEach(key => delete stationCoords[key]);

  modas.forEach(moda => {

    if (!Array.isArray(moda.lines)) return;

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

  });

  if (integrations?.walkConnections) {
    integrations.walkConnections.forEach(link => {
      addEdge(link.from, link.to, "WALK", "Jalan Kaki");
      addEdge(link.to, link.from, "WALK", "Jalan Kaki");
    });
  }
}
