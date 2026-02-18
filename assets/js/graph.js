function buildGraph(data) {
  const graph = {};
  Object.keys(data.stops).forEach(stop => graph[stop] = []);

  data.routes.forEach(route => {
    for (let i = 0; i < route.stops.length - 1; i++) {
      const from = route.stops[i];
      const to = route.stops[i + 1];
      graph[from].push({ to, mode: route.mode });
      graph[to].push({ to: from, mode: route.mode });
    }
  });

  data.connections.forEach(conn => {
    graph[conn.from].push({ to: conn.to, mode: conn.mode });
    graph[conn.to].push({ to: conn.from, mode: conn.mode });
  });

  return graph;
}
