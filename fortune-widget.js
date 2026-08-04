(() => {
  const lineUrl = "https://lin.ee/lGfoS76";
  const tapsPerDraw = 5;
  const rareChance = 1 / 10000000;

  // 運勢ラインナップの追加・文言変更は、この配列を編集します。
  const fortunes = [
    { name: "大吉", weight: 5, message: "新しい一歩に追い風が吹きそうです。思い切って動くと、うれしい展開につながるかも。" },
    { name: "中吉", weight: 12, message: "身近な人との会話にヒントがありそうです。困りごとは早めに相談すると吉。" },
    { name: "小吉", weight: 26, message: "小さな準備が今日の余裕につながります。無理なく一つずつ進めましょう。" },
    { name: "吉", weight: 32, message: "いつものペースを大切に。丁寧に進めるほど、安心できる一日になりそうです。" },
    { name: "末吉", weight: 18, message: "結果を急がず、足元を整える日に。疲れたら少し休むことも大切です。" },
    { name: "凶", weight: 6, message: "今日は慎重さが味方になります。無理をせず、確認してから動けば大丈夫です。" },
    { name: "大凶", weight: 1, message: "頑張りすぎず、休息を優先したい日です。困ったことは一人で抱え込まず相談を。" }
  ];

  // 猫画像の追加は、この配列へファイル名を加えます。画像はホームページ直下へ置きます。
  const catImages = [
    "logo-black.webp", "logo-lightgray.webp", "logo-beige.webp",
    "logo-bluegray.webp", "logo-brown.webp", "logo-orange.webp",
    "logo-gray.webp", "logo-darkbrown.webp", "logo-orange-black.webp"
  ];
  const rareCatImage = "logo-secret-calico.webp";

  document.body.insertAdjacentHTML("beforeend", `
    <a class="clsvr-fortune-line" href="${lineUrl}" target="_blank" rel="noopener">LINEで相談</a>
    <button class="clsvr-fortune-button" type="button" aria-label="猫を5回タップして本日の運勢を見る">
      <img src="${catImages[0]}" alt="" aria-hidden="true">
    </button>
    <div class="clsvr-fortune-hint" role="status" aria-live="polite">猫を5回タップすると、本日の運勢が出ます。</div>
    <div class="clsvr-fortune-overlay" role="dialog" aria-modal="true" aria-labelledby="clsvr-fortune-title" hidden>
      <div class="clsvr-fortune-card">
        <button class="clsvr-fortune-close" type="button" aria-label="占いを閉じる">×</button>
        <p class="clsvr-fortune-kicker">CLSVR 猫みくじ</p>
        <img class="clsvr-fortune-image" src="${catImages[0]}" alt="CLSVRの猫ロゴ">
        <h2 class="clsvr-fortune-title" id="clsvr-fortune-title"></h2>
        <p class="clsvr-fortune-message"></p>
        <div class="clsvr-fortune-prize">
          <p>この画面をスクリーンショットしてご提示いただくと</p>
          <strong>全サービスのご依頼料金から5%割引</strong>
          <p class="clsvr-fortune-date"></p>
          <p class="clsvr-fortune-validity">割引の有効期限は当選から24時間です。</p>
          <p class="clsvr-fortune-note">ご予約・お見積もり時にスクリーンショットをお送りください。</p>
        </div>
      </div>
    </div>
  `);

  const button = document.querySelector(".clsvr-fortune-button");
  const buttonImage = button.querySelector("img");
  const hint = document.querySelector(".clsvr-fortune-hint");
  const overlay = document.querySelector(".clsvr-fortune-overlay");
  const cardImage = overlay.querySelector(".clsvr-fortune-image");
  const title = overlay.querySelector(".clsvr-fortune-title");
  const message = overlay.querySelector(".clsvr-fortune-message");
  const date = overlay.querySelector(".clsvr-fortune-date");
  let tapCount = 0;
  let hintTimer;

  const pickFortune = () => {
    let roll = Math.random() * fortunes.reduce((sum, item) => sum + item.weight, 0);
    return fortunes.find((item) => ((roll -= item.weight) <= 0)) || fortunes[fortunes.length - 1];
  };

  const showHint = () => {
    clearTimeout(hintTimer);
    hint.classList.add("is-visible");
    hintTimer = setTimeout(() => hint.classList.remove("is-visible"), 2100);
  };

  const showResult = () => {
    const preview = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
      && new URLSearchParams(location.search).get("fortune") === "rare";
    const isPrize = preview || Math.random() < rareChance;
    const fortune = isPrize
      ? { name: "にゃんこ吉", message: "特別な猫を見つけました。今日の出会いを大切にすると、うれしいことがありそうです。" }
      : pickFortune();
    const image = isPrize ? rareCatImage : catImages[Math.floor(Math.random() * catImages.length)];
    const now = new Date();

    buttonImage.src = image;
    cardImage.src = image;
    title.textContent = fortune.name;
    message.textContent = fortune.message;
    overlay.classList.toggle("is-prize", isPrize);
    date.textContent = `当選日時：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-visible"));
  };

  const close = () => {
    overlay.classList.remove("is-visible");
    setTimeout(() => { overlay.hidden = true; }, 220);
  };

  button.addEventListener("click", () => {
    if (!overlay.hidden) return;
    button.classList.remove("is-tapped");
    void button.offsetWidth;
    button.classList.add("is-tapped");
    tapCount += 1;
    if (tapCount >= tapsPerDraw) {
      tapCount = 0;
      hint.classList.remove("is-visible");
      showResult();
    } else if (tapCount === 1) {
      showHint();
    }
  });

  // 結果画面は誤操作で消えないよう、右上の×ボタンだけで閉じます。
  overlay.querySelector(".clsvr-fortune-close").addEventListener("click", close);
})();
