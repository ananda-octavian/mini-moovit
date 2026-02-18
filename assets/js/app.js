document.addEventListener("DOMContentLoaded", function () {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");

  stations.forEach(station => {
    let option1 = document.createElement("option");
    option1.value = station;
    option1.textContent = station;

    let option2 = document.createElement("option");
    option2.value = station;
    option2.textContent = station;

    fromSelect.appendChild(option1);
    toSelect.appendChild(option2);
  });
});

function searchRoute() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const resultDiv = document.getElementById("result");

  if (from === to) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "Kamu sudah berada di tujuan.";
    return;
  }

  const path = bfs(graph, from, to);

  if (!path) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "Rute tidak ditemukan.";
    return;
  }

  resultDiv.style.display = "block";
  resultDiv.innerHTML =
    "<strong>Rute:</strong><br>" +
    path.join(" → ") +
    "<br><br>Total " +
    (path.length - 1) +
    " pemberhentian";
}
