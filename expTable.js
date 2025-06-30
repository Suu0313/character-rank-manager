// ランク別 必要経験値・スタチュウ・虹スタチュウ 一覧
const expTable = [
  { exp: 2, statue: 0, rainbow: 0 }, // RANK ~ 5
  { exp: 2, statue: 0, rainbow: 0 }, // RANK ~ 10
  { exp: 10, statue: 0, rainbow: 0 }, // RANK ~ 15
  { exp: 15, statue: 1, rainbow: 0 }, // RANK ~ 20
  { exp: 20, statue: 1, rainbow: 0 }, // RANK ~ 25
  { exp: 30, statue: 2, rainbow: 0 }, // RANK ~ 30
  { exp: 40, statue: 2, rainbow: 0 }, // RANK ~ 35
  { exp: 50, statue: 2, rainbow: 0 }, // RANK ~ 40
  { exp: 60, statue: 2, rainbow: 0 }, // RANK ~ 45
  { exp: 70, statue: 2, rainbow: 0 }, // RANK ~ 50
  { exp: 90, statue: 0, rainbow: 1 }, // RANK ~ 55
  { exp: 110, statue: 3, rainbow: 0 }, // RANK ~ 60
  { exp: 130, statue: 3, rainbow: 0 }, // RANK ~ 65
  { exp: 150, statue: 3, rainbow: 0 }, // RANK ~ 70
  { exp: 170, statue: 3, rainbow: 0 }, // RANK ~ 75
  { exp: 190, statue: 4, rainbow: 0 }, // RANK ~ 80
  { exp: 210, statue: 4, rainbow: 0 }, // RANK ~ 85
  { exp: 230, statue: 4, rainbow: 0 }, // RANK ~ 90
  { exp: 250, statue: 4, rainbow: 0 }, // RANK ~ 95
  { exp: 270, statue: 4, rainbow: 0 }, // RANK ~ 100
  { exp: 300, statue: 0, rainbow: 1 }, // RANK ~ 105
  { exp: 330, statue: 5, rainbow: 0 }, // RANK ~ 110
  { exp: 360, statue: 5, rainbow: 0 }, // RANK ~ 115
  { exp: 390, statue: 5, rainbow: 0 }, // RANK ~ 120
  { exp: 420, statue: 5, rainbow: 0 }, // RANK ~ 125
  { exp: 450, statue: 6, rainbow: 0 }, // RANK ~ 130
  { exp: 480, statue: 6, rainbow: 0 }, // RANK ~ 135
  { exp: 510, statue: 6, rainbow: 0 }, // RANK ~ 140
  { exp: 540, statue: 6, rainbow: 0 }, // RANK ~ 145
  { exp: 570, statue: 6, rainbow: 0 }, // RANK ~ 150
  { exp: 610, statue: 0, rainbow: 2 }, // RANK ~ 155
  { exp: 650, statue: 7, rainbow: 0 }, // RANK ~ 160
  { exp: 690, statue: 7, rainbow: 0 }, // RANK ~ 165
  { exp: 730, statue: 7, rainbow: 0 }, // RANK ~ 170
  { exp: 770, statue: 7, rainbow: 0 }, // RANK ~ 175
  { exp: 810, statue: 8, rainbow: 0 }, // RANK ~ 180
  { exp: 850, statue: 8, rainbow: 0 }, // RANK ~ 185
  { exp: 890, statue: 8, rainbow: 0 }, // RANK ~ 190
  { exp: 930, statue: 8, rainbow: 0 }, // RANK ~ 195
  { exp: 970, statue: 8, rainbow: 0 } // RANK ~ 200 (MAX)
];

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
