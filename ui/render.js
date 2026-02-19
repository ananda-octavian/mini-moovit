export function renderResult(result, container) {

  container.innerHTML = "";

  const prev = result.prev;
  const path = result.path;

  let currentMode = null;
  let currentLine = null;

  container.innerHTML += "<h3>Rute Perjalanan:</h3>";

  for (let i = 1; i < path.length; i++) {

    const data = prev[path[i]];
    if (!data) continue;

    // Jika ganti moda atau line
    if (data.mode !== currentMode || data.line !== currentLine) {

      container.innerHTML += `
        <br><strong>Naik ${data.mode}</strong><br>
        Line/Koridor: ${data.line}<br>
      `;

      currentMode = data.mode;
      currentLine = data.line;
    }

    container.innerHTML += `→ ${path[i]}<br>`;
  }

  container.innerHTML += `
    <br><strong>Total Waktu: ${result.distance} menit</strong>
  `;
}
