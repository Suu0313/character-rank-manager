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
        <input type="number" class="rank-input" placeholder="カスタムRANK" min="${rank}" max="999999" value="">
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
      const charDiv = checkbox.closest('.character'); const originalRank = Number(checkbox.dataset.rank);
      const customValue = charDiv.querySelector('.rank-input').value;
      const customRank = customValue ? Number(customValue) : originalRank;
      return {
        originalRank,
        customRank
      };
    });

  const originalTotal = selectedCharacters.reduce((sum, char) => sum + char.originalRank, 0);
  const customTotal = selectedCharacters.reduce((sum, char) => sum + char.customRank, 0);

  document.getElementById('originalTotalRank').innerHTML = `<h3>オリジナル合計 RANK: ${originalTotal}</h3>`;
  document.getElementById('customTotalRank').innerHTML = `<h3>カスタム合計 RANK: ${customTotal}</h3>`;

  // 選択状態に応じてスタイルを更新
  document.querySelectorAll('.character').forEach(charDiv => {
    charDiv.classList.toggle('selected', charDiv.querySelector('.char-select').checked);
  });
}

// 実行
fetchCharacterList();
