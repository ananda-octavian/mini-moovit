import { graph } from "./graph.js";

export function dijkstra(start, end) {

  let queue = [start];
  let visited = {};
  let prev = {};

  visited[start] = true;

  while (queue.length > 0) {

    let current = queue.shift();

    if (current === end) break;

    graph[current]?.forEach(neighbor => {

      if (!visited[neighbor.node]) {
        visited[neighbor.node] = true;
        prev[neighbor.node] = {
          node: current,
          mode: neighbor.mode,
          line: neighbor.line
        };
        queue.push(neighbor.node);
      }

    });
  }

  let path = [];
  let u = end;

  while (u) {
    path.unshift(u);
    u = prev[u]?.node;
  }

  return { path, prev };
}
