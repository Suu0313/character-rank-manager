function createExpTable() {
  const container = document.getElementById('expTableContainer');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr><th>RANK</th><th>必要経験値(1RANK当たり)</th><th>必要スタチュウ</th><th>必要虹スタチュウ</th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  for (let i = 0; i < expTable.length; i++) {
    const minRank = Math.max(1, i * 5);
    const maxRank = minRank + 4;
    const range = (minRank === maxRank) ? `${minRank}` : `${minRank}～${maxRank}`;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${range}</td><td>${expTable[i].exp.toLocaleString()}</td><td>${expTable[i].statue}</td><td>${expTable[i].rainbow}</td>`;
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

document.addEventListener('DOMContentLoaded', createExpTable);
