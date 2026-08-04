const form = document.getElementById("wasp-consultation-form");
const statusText = document.getElementById("form-status");
const lineOfficialAccountId = "%40171ltzff";
const serviceButtons = document.querySelectorAll("[data-service]");
const waspGuide = document.getElementById("wasp-guide");
const reservationTitle = document.getElementById("reservation-title");
const reservationDescription = document.getElementById("reservation-description");
const reservationSideNote = document.getElementById("reservation-side-note");
const serviceForms = {
  wasp: form,
  bodycare: document.getElementById("bodycare-consultation-form"),
  lifestyle: document.getElementById("lifestyle-consultation-form"),
  digital: document.getElementById("digital-consultation-form")
};
const serviceCopy = {
  wasp: ["蜂の巣駆除の<br>無料相談・見積もり依頼", "分かる範囲だけで大丈夫です。入力内容をLINEへ移し、写真を添えて相談できます。"],
  bodycare: ["出張もみほぐしの<br>ご相談・予約希望", "ご希望のコースや日時を入力すると、相談内容をまとめてLINEへ移せます。"],
  lifestyle: ["暮らしの困りごとを<br>お気軽にご相談ください", "鍵の開錠、荷物移動、雨どい掃除など、分かる範囲で状況をお知らせください。"],
  digital: ["ホームページ・AI・機械のことを<br>一緒に整理します", "ホームページ作成やAI活用、スマホ・パソコンの設定や操作をご相談いただけます。"]
};
const serviceNotes = {
  wasp: ["巣には近づかないでください", ["叩かない", "水をかけない", "お子様・ペットを近づけない"]],
  bodycare: ["施術前に体調を確認します", ["医療行為ではありません", "力加減は施術中も調整できます", "簡易ベッドを置ける場所をご用意ください"]],
  lifestyle: ["写真があるとご案内がスムーズです", ["作業場所と内容をお知らせください", "鍵開錠は本人確認が必要です", "作業前に料金をご案内します"]],
  digital: ["パスワードは送らないでください", ["やりたいことをそのままご記入ください", "大切なデータは事前にバックアップ", "対応方法と料金を先にご案内します"]]
};

const formatDateTime = (value) => {
  if (!value) return "希望なし";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit"
  }).format(date);
};

const buildMessage = (data) => [
  "【蜂の巣駆除のご相談】",
  "",
  "① 分かる範囲での状況",
  `・巣の確認：${data.nestStatus}`,
  `・蜂の種類：${data.beeType}`,
  `・巣の大きさ：${data.nestSize}`,
  `・高さ：${data.nestHeight}`,
  `・場所：${data.nestLocation}`,
  `・補足：${data.situation || "なし"}`,
  `・写真：${data.hasPhoto || "今のところなし"}`,
  "",
  "② 訪問先・希望日時",
  `・エリア：${data.area}`,
  `・町名・目印：${data.addressHint || "未入力"}`,
  `・対応希望：${data.urgency}`,
  `・第1希望：${formatDateTime(data.date1)}`,
  `・第2希望：${formatDateTime(data.date2)}`,
  "",
  "③ お客様情報",
  `・お名前：${data.customerName}`,
  `・電話番号：${data.phone}`,
  "",
  data.hasPhoto ? "このあと、状況が分かる写真を添付します。" : "写真が必要な場合は撮り方を教えてください。"
].join("\n");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) {
    statusText.textContent = "未入力の必須項目があります。赤く表示された項目をご確認ください。";
    statusText.className = "form-status is-error";
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const message = buildMessage(data);
  statusText.textContent = "LINEを開きます。内容を確認し、写真があれば追加して送信してください。";
  statusText.className = "form-status is-success";
  window.location.href = `https://line.me/R/oaMessage/${lineOfficialAccountId}/?${encodeURIComponent(message)}`;
});

const switchService = (service) => {
  Object.entries(serviceForms).forEach(([key, serviceForm]) => {
    if (serviceForm) serviceForm.hidden = key !== service;
  });
  if (waspGuide) waspGuide.hidden = service !== "wasp";
  serviceButtons.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.service === service)));
  if (reservationTitle) reservationTitle.innerHTML = serviceCopy[service][0];
  if (reservationDescription) reservationDescription.textContent = serviceCopy[service][1];
  if (reservationSideNote) {
    const [heading, items] = serviceNotes[service];
    reservationSideNote.innerHTML = `<strong>${heading}</strong><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }
  document.querySelector(".service-selector")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

serviceButtons.forEach((button) => button.addEventListener("click", () => switchService(button.dataset.service)));

const requestedService = new URLSearchParams(window.location.search).get("service");
if (requestedService && serviceForms[requestedService]) switchService(requestedService);

const bindSimpleForm = (serviceForm, messageBuilder) => {
  serviceForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formStatus = serviceForm.querySelector(".form-status");
    if (!serviceForm.reportValidity()) {
      formStatus.textContent = "未入力の必須項目があります。内容をご確認ください。";
      formStatus.className = "form-status is-error";
      return;
    }
    const data = Object.fromEntries(new FormData(serviceForm).entries());
    formStatus.textContent = "LINEを開きます。内容を確認して送信してください。";
    formStatus.className = "form-status is-success";
    window.location.href = `https://line.me/R/oaMessage/${lineOfficialAccountId}/?${encodeURIComponent(messageBuilder(data))}`;
  });
};

bindSimpleForm(serviceForms.bodycare, (data) => [
  "【出張もみほぐしのご相談】", "",
  "① ご希望の施術内容", `・コース：${data.course}`, `・気になる箇所・希望：${data.request || "なし"}`,
  "", "② 訪問先・希望日時", `・訪問エリア：${data.area}`, `・住所・宿泊先：${data.address || "LINEで確認"}`,
  `・第1希望：${formatDateTime(data.date1)}`, `・第2希望：${formatDateTime(data.date2)}`,
  `・簡易ベッドのスペース：${data.bedSpace || "要相談"}`,
  "", "③ お客様情報", `・お名前：${data.customerName}`, `・電話番号：${data.phone}`
].join("\n"));

bindSimpleForm(serviceForms.lifestyle, (data) => [
  "【暮らしのご相談】", "",
  "① ご相談内容", `・内容：${data.category}`, `・詳しい内容：${data.request}`, `・写真：${data.hasPhoto || "今のところなし"}`,
  "", "② 訪問先・希望日時", `・訪問エリア：${data.area}`, `・住所・目印：${data.address || "LINEで確認"}`,
  `・第1希望：${formatDateTime(data.date1)}`, `・第2希望：${formatDateTime(data.date2)}`,
  "", "③ お客様情報", `・お名前：${data.customerName}`, `・電話番号：${data.phone}`,
  data.hasPhoto ? "このあと、状況が分かる写真を添付します。" : "写真が必要な場合はお知らせください。"
].join("\n"));

bindSimpleForm(serviceForms.digital, (data) => [
  "【ホームページ・AI・機械のご相談】", "",
  "① ご相談内容", `・内容：${data.category}`, `・詳しい内容：${data.request}`, `・画面写真：${data.hasPhoto || "今のところなし"}`,
  "", "② 相談方法・希望日時", `・相談方法：${data.method}`, `・地域：${data.area || "未入力"}`,
  `・第1希望：${formatDateTime(data.date1)}`, `・第2希望：${formatDateTime(data.date2)}`,
  "", "③ お客様情報", `・お名前：${data.customerName}`, `・電話番号：${data.phone}`,
  data.hasPhoto ? "このあと、困っている画面の写真を添付します。" : "必要な画面写真があればお知らせください。"
].join("\n"));
