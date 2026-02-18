export function renderRoute(result, fare) {

  const container = document.getElementById("result");
  container.innerHTML = "";

  let prev = result.prev;
  let path = result.path;

  let currentMode = null;
  let currentLine = null;

  for (let i = 1; i < path.length; i++) {

    const data = prev[path[i]];
    if (!data) continue;

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
    <br><strong>Total Harga: Rp ${fare.totalFare.toLocaleString()}</strong>
  `;
}
