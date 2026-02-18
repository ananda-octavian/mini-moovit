function bfs(graph, start, goal) {
  let queue = [[start]];
  let visited = new Set();

  while (queue.length > 0) {
    let path = queue.shift();
    let node = path[path.length - 1];

    if (node === goal) {
      return path;
    }

    if (!visited.has(node)) {
      visited.add(node);

      let neighbors = graph[node] || [];

      for (let neighbor of neighbors) {
        let newPath = [...path, neighbor];
        queue.push(newPath);
      }
    }
  }

  return null;
}
