async function fetchCharacterList() {
  const url = "https://new.chunithm-net.com/chuni-mobile/html/mobile/collection/characterList/";
  // const url = "./sample.html";
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

    // イロドリミドリのキャラクターを含む div 要素を取得 (140 みたいなのが出たらだるいが後の処理ではじく)
    const characterDivs = doc.querySelectorAll(`div.box01[name^="${irodorimidoriId}"]`);

    characterDivs.forEach(characterDiv => {
      const name = characterDiv.querySelector('.character_name_block a')?.textContent.trim() ?? '';
      const charaId = characterDiv.getAttribute('name') ?? '';
      // イロドリミドリのキャラクターのみを対象
      if ((charaId != irodorimidoriId) && !(charaId.startsWith(irodorimidoriId + '-')))
        return;
      const imgSrc = characterDiv.querySelector('.list_chara_img img')?.getAttribute('data-original') || 'no_image.png';
      // ランク取得
      let rankImgs = characterDiv.querySelectorAll('.character_list_rank_num_block img') || [];
      let rank = Array.from(rankImgs)
        .map(img => img.src.match(/num_s_lv_(\d)\.png/)?.[1] || "")
        .join("");
      // 限界突破待ち判定
      const isMax = characterDiv.querySelector('.character_list_rank_max') !== null;
      // HTML に追加
      const charDiv = document.createElement("div");
      charDiv.className = "character";
      charDiv.innerHTML = `
        <input type="checkbox" class="char-select" data-rank="${rank}" data-max="${isMax}">
        <img src="${imgSrc}" width="50">
        <span>${name} (RANK: ${rank}${isMax ? ' <span class=\'max-label\'>[MAX]</span>' : ''})</span>
        <input type="number" class="rank-input" placeholder="カスタムRANK" min="${rank}" max="200" value="">
        <div class="required-exp"></div>
      `;
      characterList.appendChild(charDiv);
    });

    // チェックボックスの変更イベントを監視
    document.querySelectorAll('.char-select').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateTotalRank();
        if (showSelectedOnly) filterCharacters();
      });

      // checkbox.closest('.character').addEventListener('click', (e) => {
      //   if (lockSelection) return; // 選択固定中はクリックイベントを無視

      //   // number型のinputをクリックした場合は、チェックボックスの状態を変更しない
      //   if (e.target.type !== 'checkbox' && e.target.type !== 'number') {
      //     checkbox.checked = !checkbox.checked;
      //     updateTotalRank();
      //     if (showSelectedOnly) filterCharacters();
      //   }
      // });
    });

    // フィルター入力欄のイベントを監視
    const nameFilter = document.getElementById('nameFilter');
    nameFilter.addEventListener('input', filterCharacters);

    // 選択中のみ表示ボタンのイベントを監視
    const showSelectedButton = document.getElementById('showSelectedOnly');
    showSelectedButton.addEventListener('click', toggleSelectedOnly);

    // 選択固定ボタンのイベントを監視
    const lockSelectionButton = document.getElementById('lockSelection');
    lockSelectionButton.addEventListener('click', toggleLockSelection);

    // 全解除ボタンのイベントを監視
    const clearSelectionButton = document.getElementById('clearSelection');
    clearSelectionButton.addEventListener('click', clearAllSelection);

    // RANK入力欄のイベントを監視
    document.querySelectorAll('.rank-input').forEach(input => {
      input.addEventListener('input', function () {
        updateCharacterExpDisplay(this.closest('.character'));
        updateTotalRank();
      });
    });

  } catch (error) {
    console.error("データ取得エラー:", error);
    document.getElementById("characterList").textContent = "データ取得失敗";
  }
}

// フィルタリング状態を管理する変数
let showSelectedOnly = false;

// 選択状態を固定するための変数
let lockSelection = false;

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
  // ボタン文言をトグル
  button.textContent = showSelectedOnly ? '全キャラを表示' : '選択中のみを表示';
  filterCharacters();
}

function toggleLockSelection() {
  const button = document.getElementById('lockSelection');
  lockSelection = !lockSelection;
  button.classList.toggle('active', lockSelection);
  // ボタン文言をトグル
  button.textContent = lockSelection ? '選択固定解除' : '選択を固定';
}

// 全解除ボタンの処理
function clearAllSelection() {
  if (lockSelection) return;
  document.querySelectorAll('.char-select:checked').forEach(cb => {
    cb.checked = false;
  });
  updateTotalRank();
  if (showSelectedOnly) filterCharacters();
}

// 個別キャラの必要経験値表示を更新
function updateCharacterExpDisplay(charDiv) {
  const checkbox = charDiv.querySelector('.char-select');
  const originalRank = Number(checkbox.dataset.rank);
  const isMax = checkbox.dataset.max === 'true';
  const customValue = charDiv.querySelector('.rank-input').value;
  const customRank = customValue ? Number(customValue) : originalRank;
  const { exp, statue, rainbow } = calculateRequiredExp(originalRank, customRank, isMax);
  const expDisplay = charDiv.querySelector('.required-exp');
  if (expDisplay) {
    if (customValue) {
      expDisplay.textContent = `必要経験値: ${exp.toLocaleString()}
スタチュウ: ${statue.toLocaleString()}個
虹スタチュウ: ${rainbow.toLocaleString()}個`;
    } else {
      expDisplay.textContent = '';
    }
  }

  return {
    originalRank,
    customRank,
    requiredExp: exp,
    requiredStatue: statue,
    requiredRainbow: rainbow
  };
}

// 選択されたキャラクターの合計RANKを計算して表示
function updateTotalRank() {
  const selectedCharacters = Array.from(document.querySelectorAll('.char-select:checked'))
    .map(checkbox => {
      const charDiv = checkbox.closest('.character');
      return updateCharacterExpDisplay(charDiv);
    });

  const originalTotal = selectedCharacters.reduce((sum, char) => sum + char.originalRank, 0);
  const customTotal = selectedCharacters.reduce((sum, char) => sum + char.customRank, 0);
  const totalRequiredExp = selectedCharacters.reduce((sum, char) => sum + char.requiredExp, 0);
  const totalRequiredStatue = selectedCharacters.reduce((sum, char) => sum + char.requiredStatue, 0);
  const totalRequiredRainbow = selectedCharacters.reduce((sum, char) => sum + char.requiredRainbow, 0);

  // 合計情報を表示
  document.getElementById('originalTotalRank').innerHTML = `<h3>オリジナル合計 RANK: ${originalTotal}</h3>`;
  document.getElementById('customTotalRank').innerHTML = `<h3>カスタム合計 RANK: ${customTotal}</h3>`;
  document.getElementById('totalRequiredExp').innerHTML = `
    <h3>必要経験値合計: ${totalRequiredExp.toLocaleString()}</h3>
    <h3>必要スタチュウ合計: ${totalRequiredStatue.toLocaleString()}個</h3>
    <h3>必要虹スタチュウ合計: ${totalRequiredRainbow.toLocaleString()}個</h3>
  `;

  // 選択状態に応じてスタイルを更新
  document.querySelectorAll('.character').forEach(charDiv => {
    charDiv.classList.toggle('selected', charDiv.querySelector('.char-select').checked);
  });
}

// ランク間の必要経験値を計算する関数
function calculateRequiredExp(currentRank, targetRank, isMax) {


  let exp = 0, statue = 0, rainbow = 0;

  const defaultRank = currentRank;

  if (currentRank >= targetRank) return { exp, statue, rainbow };

  for (let index = 0; index < expTable.length; index++) {
    const minRank = index * 5, maxRank = minRank + 4;
    if (maxRank < currentRank) continue;
    if (targetRank <= minRank) break;

    // 限界突破
    if (currentRank === minRank) {

      // もともと限凸が必要なランクだとだるい
      // MAX 表記でない場合は限界突破済みなのでスキップ
      if (!(currentRank === defaultRank && !isMax)) {
        statue += expTable[index].statue;
        rainbow += expTable[index].rainbow;
      }
    }

    if (targetRank <= maxRank) {
      exp += expTable[index].exp * (targetRank - currentRank);
    } else {
      exp += expTable[index].exp * (maxRank - currentRank + 1);
    }

    currentRank = maxRank + 1;
  }

  return { exp, statue, rainbow };
}

// --- ドラッグ選択用 ---
let isDragging = false;
let lastCheckedState = false;

const characterList = document.getElementById("characterList");
if (characterList) {
  characterList.addEventListener('mousedown', (e) => {
    if (e.target.type === 'checkbox' || e.target.type === 'number') return;
    if (lockSelection) return;
    const checkbox = e.target.closest('.character')?.querySelector('.char-select');
    if (checkbox) {
      lastCheckedState = !checkbox.checked;
      checkbox.checked = lastCheckedState;
      updateTotalRank();
      if (showSelectedOnly) filterCharacters();

      if (e.ctrlKey) {
        isDragging = true;
        document.body.classList.add('no-select');
      }
    }
  });
}

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  if (lockSelection) return;
  const character = e.target.closest('.character');
  if (character) {
    const checkbox = character.querySelector('.char-select');
    if (checkbox && checkbox.checked !== lastCheckedState) {
      checkbox.checked = lastCheckedState;
      updateTotalRank();
      if (showSelectedOnly) filterCharacters();
    }
  }
});
document.addEventListener('mouseup', () => { isDragging = false; document.body.classList.remove('no-select'); });
document.addEventListener('mouseleave', () => { isDragging = false; document.body.classList.remove('no-select'); });

document.getElementById('openReference').addEventListener('click', function () {
  window.open('reference.html', '_blank');
});

// 実行
fetchCharacterList();
