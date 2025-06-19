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
    const doc = parser.parseFromString(htmlText, "text/html");

    // キャラクターリストを取得
    const characterList = document.getElementById("characterList");
    characterList.innerHTML = ""; // クリア

    const nameElements = doc.querySelectorAll(".character_name_block a");
    const imageElements = doc.querySelectorAll(".list_chara_img img");
    const rankElements = doc.querySelectorAll(".character_list_rank_num_block");
    const characterDivs = doc.querySelectorAll('div[name^="ipId"]');

    console.log(nameElements.length, imageElements.length, rankElements.length, characterDivs.length);


    let totalRank = 0;

    // キャラクターごとに処理
    nameElements.forEach((nameEl, index) => {

      const name = nameEl.textContent.trim();
      const characterDiv = characterDivs[index];
      if (index < 10) console.log(name, characterDiv.getAttribute('name'));
      if (characterDiv.getAttribute('name') != irodorimidoriId) return;

      const imgSrc = imageElements[index + 1]?.getAttribute("data-original") || "no_image.png";

      // 🏆 ランク取得処理 🏆
      let rankImgs = rankElements[index + 1]?.querySelectorAll("img") || [];
      let rank = Array.from(rankImgs)
        .map(img => img.src.match(/num_s_lv_(\d)\.png/)?.[1] || "")
        .join(""); // 画像名の数字を結合してランクにする

      // HTML に追加
      const charDiv = document.createElement("div");
      charDiv.className = "character";
      charDiv.innerHTML = `
              <img src="${imgSrc}" width="50">
              <span>${name} (RANK: ${rank})</span>
          `;
      characterList.appendChild(charDiv);

      totalRank += Number(rank)
    });
    const totalRankDiv = document.createElement("div");
    totalRankDiv.innerHTML = `<h3>合計 RANK: ${totalRank}</h3>`;
    characterList.prepend(totalRankDiv); // 一番上に追加


    // const test = document.createElement("div");
    // test.textContent = htmlText;
    // characterList.append(test); 

  } catch (error) {
    console.error("データ取得エラー:", error);
    document.getElementById("characterList").textContent = "データ取得失敗";
  }
}

// 実行
fetchCharacterList();
