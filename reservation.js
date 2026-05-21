const form = document.getElementById("line-reservation-form");
const areaSelect = document.getElementById("reservation-area");
const menuPrice = document.getElementById("reservation-menu-price");
const travelFee = document.getElementById("reservation-travel-fee");
const totalPrice = document.getElementById("reservation-total-price");
const statusText = document.getElementById("reservation-status");
const lineOfficialAccountId = "%40171ltzff";

const yen = (value) => `${Number(value).toLocaleString("ja-JP")}円`;

const selectedMenu = () => form?.querySelector('input[name="menu"]:checked');
const selectedArea = () => areaSelect?.selectedOptions[0];

const formatDateTime = (value) => {
  if (!value) return "未入力";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const totalLabel = () => {
  const menu = selectedMenu();
  const area = selectedArea();
  const basePrice = menu ? Number(menu.dataset.price) : 0;
  const fee = area ? Number(area.dataset.fee) : 0;

  if (basePrice && fee) return `${yen(basePrice + fee)}〜`;
  if (basePrice && area?.value) return "LINEで確認";
  return "メニューとエリアを選択";
};

const updateSummary = () => {
  const menu = selectedMenu();
  const area = selectedArea();
  const basePrice = menu ? Number(menu.dataset.price) : 0;
  const fee = area ? Number(area.dataset.fee) : 0;

  menuPrice.textContent = menu ? `${menu.value} / ${yen(basePrice)}〜` : "未選択";
  travelFee.textContent = area?.value ? (fee ? yen(fee) : "要相談") : "未選択";
  totalPrice.textContent = totalLabel();
};

const setStatus = (message, type = "") => {
  statusText.textContent = message;
  statusText.className = `reservation-status ${type}`.trim();
};

const buildMessage = (data) => {
  const menu = selectedMenu();

  return [
    "【CLSVR予約希望】",
    "",
    "■メニュー",
    menu?.value || "未選択",
    "",
    "■料金目安",
    data.total,
    "",
    "■出張エリア",
    data.area,
    "",
    "■希望日時",
    `第1希望：${formatDateTime(data.date1)}`,
    `第2希望：${formatDateTime(data.date2)}`,
    "",
    "■お客様情報",
    `お名前：${data.name}`,
    `電話番号：${data.phone}`,
    `住所・目印：${data.address}`,
    "",
    "■備考",
    data.note || "なし"
  ].join("\n");
};

form?.addEventListener("change", updateSummary);
form?.addEventListener("input", updateSummary);
form?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    setStatus("未入力の必須項目があります。内容をご確認ください。", "is-error");
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  data.total = totalLabel();

  const message = buildMessage(data);
  const lineUrl = `https://line.me/R/oaMessage/${lineOfficialAccountId}/?${encodeURIComponent(message)}`;
  setStatus("公式LINEを開きます。内容を確認して送信してください。", "is-success");
  window.location.href = lineUrl;
});

updateSummary();
