async function fetchCharacterList() {
  const url = "https://new.chunithm-net.com/chuni-mobile/html/mobile/collection/characterList/";
  const irodorimidoriId = "ipId14"; // イロドリミドリのID

  try {
    // HTML を取得（ログイン情報を含める）
    const response = await fetch(url, {
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);

    // HTML をテキストに変換
    const htmlText = await response.text();

    // DOM として解析
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");    // キャラクターリストを取得
    const characterList = document.getElementById("characterList");
    characterList.innerHTML = ""; // クリア

    const nameElements = doc.querySelectorAll(".character_name_block a");
    const imageElements = doc.querySelectorAll(".list_chara_img img");
    const rankElements = doc.querySelectorAll(".character_list_rank_num_block");
    const characterDivs = doc.querySelectorAll('div[name^="ipId"]');

    // キャラクターごとに処理
    nameElements.forEach((nameEl, index) => {

      const name = nameEl.textContent.trim();
      const characterDiv = characterDivs[index];
      if (characterDiv.getAttribute('name') != irodorimidoriId) return;

      const imgSrc = imageElements[index + 1]?.getAttribute("data-original") || "no_image.png";

      // 🏆 ランク取得処理 🏆
      let rankImgs = rankElements[index + 1]?.querySelectorAll("img") || [];
      let rank = Array.from(rankImgs)
        .map(img => img.src.match(/num_s_lv_(\d)\.png/)?.[1] || "")
        .join(""); // 画像名の数字を結合してランクにする      // HTML に追加   

      const charDiv = document.createElement("div");
      charDiv.className = "character";
      charDiv.innerHTML = `
        <input type="checkbox" class="char-select" data-rank="${rank}">
        <img src="${imgSrc}" width="50">
        <span>${name} (RANK: ${rank})</span>
        <input type="number" class="rank-input" placeholder="カスタムRANK" min="${rank}" max="200" value="">
        <div class="required-exp"></div>
      `;
      characterList.appendChild(charDiv);
    });    // チェックボックスの変更イベントを監視
    document.querySelectorAll('.char-select').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateTotalRank();
        if (showSelectedOnly) filterCharacters();
      }); checkbox.closest('.character').addEventListener('click', (e) => {
        // number型のinputをクリックした場合は、チェックボックスの状態を変更しない
        if (e.target.type !== 'checkbox' && e.target.type !== 'number') {
          checkbox.checked = !checkbox.checked;
          updateTotalRank();
          if (showSelectedOnly) filterCharacters();
        }
      });
    });    // フィルター入力欄のイベントを監視
    const nameFilter = document.getElementById('nameFilter');
    nameFilter.addEventListener('input', filterCharacters);

    // 選択中のみ表示ボタンのイベントを監視
    const showSelectedButton = document.getElementById('showSelectedOnly');
    showSelectedButton.addEventListener('click', toggleSelectedOnly);

    // RANK入力欄のイベントを監視
    document.querySelectorAll('.rank-input').forEach(input => {
      input.addEventListener('input', updateTotalRank);
    });


    // const test = document.createElement("div");
    // test.textContent = htmlText;
    // characterList.append(test); 

  } catch (error) {
    console.error("データ取得エラー:", error);
    document.getElementById("characterList").textContent = "データ取得失敗";
  }
}

// フィルタリング状態を管理する変数
let showSelectedOnly = false;

// キャラクターをフィルタリングする関数
function filterCharacters() {
  const filterText = document.getElementById('nameFilter').value.toLowerCase();
  document.querySelectorAll('.character').forEach(charDiv => {
    const name = charDiv.querySelector('span').textContent.toLowerCase();
    const matchesText = name.includes(filterText);
    const isSelected = charDiv.querySelector('.char-select').checked;

    if (showSelectedOnly) {
      charDiv.classList.toggle('hidden', !isSelected || !matchesText);
    } else {
      charDiv.classList.toggle('hidden', !matchesText);
    }
  });
}

// 選択中のみ表示の切り替え
function toggleSelectedOnly() {
  const button = document.getElementById('showSelectedOnly');
  showSelectedOnly = !showSelectedOnly;
  button.classList.toggle('active', showSelectedOnly);
  filterCharacters();
}

// 選択されたキャラクターの合計RANKを計算して表示
function updateTotalRank() {
  const selectedCharacters = Array.from(document.querySelectorAll('.char-select:checked'))
    .map(checkbox => {
      const charDiv = checkbox.closest('.character');
      const originalRank = Number(checkbox.dataset.rank);
      const customValue = charDiv.querySelector('.rank-input').value;
      const customRank = customValue ? Number(customValue) : originalRank;
      const { exp, statue, rainbow } = calculateRequiredExp(originalRank, customRank);

      // 必要経験値表示の更新
      const expDisplay = charDiv.querySelector('.required-exp');
      if (expDisplay) {
        expDisplay.textContent = customValue ? `必要経験値: ${exp.toLocaleString()}` : '';
      }

      return {
        originalRank,
        customRank,
        requiredExp: exp
      };
    });
  const originalTotal = selectedCharacters.reduce((sum, char) => sum + char.originalRank, 0);
  const customTotal = selectedCharacters.reduce((sum, char) => sum + char.customRank, 0);
  const totalRequiredExp = selectedCharacters.reduce((sum, char) => sum + char.requiredExp, 0);

  // 合計情報を表示
  document.getElementById('originalTotalRank').innerHTML = `<h3>オリジナル合計 RANK: ${originalTotal}</h3>`;
  document.getElementById('customTotalRank').innerHTML = `<h3>カスタム合計 RANK: ${customTotal}</h3>`;
  document.getElementById('totalRequiredExp').innerHTML = `<h3>必要経験値合計: ${totalRequiredExp.toLocaleString()}</h3>`;

  // 選択状態に応じてスタイルを更新
  document.querySelectorAll('.character').forEach(charDiv => {
    charDiv.classList.toggle('selected', charDiv.querySelector('.char-select').checked);
  });
}

// ランク間の必要経験値を計算する関数
function calculateRequiredExp(currentRank, targetRank) {

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

  let exp = 0, statue = 0, rainbow = 0;

  if (currentRank >= targetRank) return { exp, statue, rainbow };

  for (let index = 0; index < expTable.length; index++) {
    const minRank = index * 5, maxRank = minRank + 4;
    if (maxRank <= currentRank) continue;
    if (targetRank <= minRank) break;

    statue += expTable[index].statue;
    rainbow += expTable[index].rainbow;

    if (targetRank <= maxRank) {
      exp += expTable[index].exp * (targetRank - currentRank);
    } else {
      exp += expTable[index].exp * (maxRank - currentRank + 1);
    }

    currentRank = maxRank + 1;
  }

  return { exp, statue, rainbow };
}

// 実行
fetchCharacterList();
