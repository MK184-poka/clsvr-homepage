const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");
const copyButtons = document.querySelectorAll("[data-copy-target]");
const bookingChoiceButtons = document.querySelectorAll("[data-booking-choice]");
const dateInputs = document.querySelectorAll('input[type="date"]');
const secretLogos = document.querySelectorAll(".js-secret-logo");
const catLogoButton = document.querySelector(".cat-logo-button");
const catStaffBubble = document.getElementById("cat-staff-bubble");
const storeEntry = document.getElementById("store-entry");
const storeEntryGuide = storeEntry?.querySelector(".store-entry-guide");
const storeEntryOpenGreeting = document.getElementById("store-entry-open-greeting");
const greetings = [
  "今日はどうされましたか。<br>あなたの自分時間を、今日もお届けします。",
  "暮らしのお困りごと、<br>今日もお手伝いします。",
  "少しでもラクになる時間を。<br>本日もサポートにうかがいます。",
  "今日は少し、<br>自分の時間をつくりませんか。",
  "小さなお困りごとも、<br>気軽にご相談ください。",
  "本日も、<br>暮らしサポート受付中です。"
];
const fallbackImageSources = {
  "store-entry-bg": "public/images/entrance/entrance-main.png",
  "store-entry-open-bg": "public/images/entrance/entrance-open.png",
  "hero-store-art": "public/images/inside/shop-inside.png",
  "world-photo": "public/images/inside/shop-inside.png",
  "visit-photo": "public/images/car/clsvr-car.png"
};
const contactLinks = window.CLSVR_CONTACT_LINKS || {};
const contactLinkAnchors = document.querySelectorAll("[data-contact-link]");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const logoStorageKey = "clsvr-logo-gacha-source";
const logoVariantSources = [
  "logo-black.webp",
  "logo-lightgray.webp",
  "logo-beige.webp",
  "logo-bluegray.webp",
  "logo-brown.webp",
  "logo-orange.webp",
  "logo-gray.webp",
  "logo-darkbrown.webp",
  "logo-orange-black.webp"
];
const secretLogoSources = ["logo-secret-calico.webp"];
const allLogoSources = [...logoVariantSources, ...secretLogoSources];
const defaultLogoSource = logoVariantSources[0];
const logoMessages = {
  "logo-black.webp": ["少し休んでいくニャ", "無理しすぎないでニャ"],
  "logo-lightgray.webp": ["今日はゆっくり整えるニャ", "休む時間も大切だニャ"],
  "logo-beige.webp": ["ひと息ついてからで大丈夫ニャ", "深呼吸していくニャ"],
  "logo-bluegray.webp": ["肩の力を抜くニャ", "あせらなくて大丈夫ニャ"],
  "logo-brown.webp": ["その作業、相談してニャ", "小さな困りごとも聞くニャ"],
  "logo-orange.webp": ["いい一日になりますようにニャ", "今日は少し運がいいニャ"],
  "logo-gray.webp": ["ちゃんと休む時間を作るニャ", "頑張りすぎ注意だニャ"],
  "logo-darkbrown.webp": ["秘密基地へようこそニャ", "また来てほしいニャ"],
  "logo-orange-black.webp": ["自分時間も大切にするニャ", "用事は分けても大丈夫ニャ"],
  "logo-secret-calico.webp": ["レア演出だニャ", "秘密を見つけたニャ", "今日は運がいいニャ"]
};

let secretTapCount = 0;
let secretResetTimer;
let logoSwitchTimer;
let logoDrawUnlockTimer;
let logoDrawActive = false;
let nextLogoDrawCount = 18 + Math.floor(Math.random() * 5);
let catLogoTapTimer;
let catBubbleTimer;
let storeEntryTimer;
const storeEntrySeenKey = "clsvr-store-entry-seen";

const rememberStoreEntry = () => {
  try {
    sessionStorage.setItem(storeEntrySeenKey, "1");
  } catch {
    // Ignore storage errors; the entrance still works without persistence.
  }
};

const hasSeenStoreEntry = () => {
  try {
    return sessionStorage.getItem(storeEntrySeenKey) === "1";
  } catch {
    return false;
  }
};

const setStoreEntryOpenGreeting = (target = storeEntryOpenGreeting) => {
  if (!target || target.dataset.greetingReady === "true") return;

  target.innerHTML = greetings[Math.floor(Math.random() * greetings.length)];
  target.dataset.greetingReady = "true";
};

const initStoreEntryOpenGreeting = () => {
  setStoreEntryOpenGreeting(document.getElementById("store-entry-open-greeting"));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStoreEntryOpenGreeting, { once: true });
} else {
  initStoreEntryOpenGreeting();
}

const enterStore = () => {
  if (!storeEntry || storeEntry.classList.contains("is-opening")) return;

  window.clearTimeout(storeEntryTimer);
  rememberStoreEntry();
  if (storeEntryGuide) storeEntryGuide.textContent = "入口を開けています…";
  initStoreEntryOpenGreeting();
  storeEntry.classList.add("is-opening");
  document.body.classList.add("store-is-entering");

  window.setTimeout(() => {
    storeEntry.classList.add("is-hidden");
    document.body.classList.remove("store-entry-active", "store-is-entering");
    document.body.classList.add("store-entered");
  }, motionQuery.matches ? 80 : 4200);
};

if (storeEntry) {
  const shouldSkipStoreEntry = hasSeenStoreEntry() || window.location.hash.length > 0;
  initStoreEntryOpenGreeting();

  storeEntry.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.src = image.classList.contains("store-entry-bg")
        ? fallbackImageSources["store-entry-bg"]
        : image.classList.contains("store-entry-open-bg")
          ? fallbackImageSources["store-entry-open-bg"]
          : fallbackImageSources["store-entry-bg"];
    }, { once: true });
  });

  if (shouldSkipStoreEntry) {
    storeEntry.classList.add("is-hidden");
    document.body.classList.add("store-entered");
  } else {
    document.body.classList.add("store-entry-active");
    storeEntry.addEventListener("click", enterStore);
    storeEntry.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        enterStore();
      }
    });
    storeEntryTimer = window.setTimeout(enterStore, motionQuery.matches ? 1200 : 10000);
  }
}

document.querySelectorAll(".hero-store-art, .world-photo img, .visit-photo img").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.classList.contains("hero-store-art") || image.closest(".world-photo")) {
      image.src = fallbackImageSources["hero-store-art"];
      return;
    }
    image.src = fallbackImageSources["visit-photo"];
  }, { once: true });
});

const bookingSelection = {
  menu: "",
  area: ""
};

contactLinkAnchors.forEach((anchor) => {
  const linkKey = anchor.dataset.contactLink;
  if (linkKey && contactLinks[linkKey]) {
    anchor.href = contactLinks[linkKey];
  }
});

const setLogoSource = (source) => {
  secretLogos.forEach((logo) => {
    logo.src = source;
  });
};

const getStoredLogoSource = () => {
  try {
    const source = sessionStorage.getItem(logoStorageKey);
    return allLogoSources.includes(source) ? source : defaultLogoSource;
  } catch {
    return defaultLogoSource;
  }
};

const storeLogoSource = (source) => {
  try {
    sessionStorage.setItem(logoStorageKey, source);
  } catch {
    // Storage may be unavailable in private browsing modes.
  }
};

const pickMessage = (source) => {
  const messages = logoMessages[source] || logoMessages[defaultLogoSource];
  return messages[Math.floor(Math.random() * messages.length)];
};

const showLogoMessage = (source, isSecret) => {
  if (!catStaffBubble) return;

  window.clearTimeout(catBubbleTimer);
  catStaffBubble.textContent = pickMessage(source);
  catStaffBubble.classList.remove("is-visible", "is-rare");

  window.requestAnimationFrame(() => {
    catStaffBubble.classList.toggle("is-rare", isSecret);
    catStaffBubble.classList.add("is-visible");
  });

  catBubbleTimer = window.setTimeout(() => {
    catStaffBubble.classList.remove("is-visible", "is-rare");
  }, isSecret ? 4600 : 3600);
};

const drawLogoSource = () => {
  const secretRate = secretTapCount >= 100 ? 0.05 : 0.015;
  const isSecret = Math.random() < secretRate;

  return {
    isSecret,
    source: isSecret
      ? secretLogoSources[0]
      : logoVariantSources[Math.floor(Math.random() * logoVariantSources.length)]
  };
};

const switchLogoSource = (source, isSecret) => {
  window.clearTimeout(logoSwitchTimer);
  document.body.classList.add("logo-switching");

  logoSwitchTimer = window.setTimeout(
    () => {
      setLogoSource(source);
      storeLogoSource(source);
      window.requestAnimationFrame(() => {
        document.body.classList.remove("logo-switching");
        document.body.classList.add("hidden-mode");
        document.body.classList.toggle("secret-rare-mode", isSecret);
      });
    },
    motionQuery.matches ? 0 : 150
  );
};

const createFloatingPaw = () => {
  if (motionQuery.matches) return;

  const paw = document.createElement("span");
  paw.className = "paw-float";
  paw.setAttribute("aria-hidden", "true");
  document.body.appendChild(paw);
  paw.addEventListener("animationend", () => paw.remove(), { once: true });
};

const activateLogoDraw = () => {
  if (logoDrawActive) return;

  logoDrawActive = true;
  nextLogoDrawCount = 18 + Math.floor(Math.random() * 5);
  window.clearTimeout(logoDrawUnlockTimer);

  const result = drawLogoSource();
  document.body.classList.remove("hidden-mode", "secret-rare-mode");
  switchLogoSource(result.source, result.isSecret);
  showLogoMessage(result.source, result.isSecret);

  if (result.isSecret) {
    createFloatingPaw();
    window.setTimeout(createFloatingPaw, 240);
    window.setTimeout(createFloatingPaw, 520);
  }

  logoDrawUnlockTimer = window.setTimeout(() => {
    logoDrawActive = false;
  }, 720);
};

const handleSecretLogoTap = (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (catLogoButton && !motionQuery.matches) {
    window.clearTimeout(catLogoTapTimer);
    catLogoButton.classList.remove("is-tapped");
    void catLogoButton.offsetWidth;
    catLogoButton.classList.add("is-tapped");
    catLogoTapTimer = window.setTimeout(() => {
      catLogoButton.classList.remove("is-tapped");
    }, 520);
  }

  if (logoDrawActive) return;

  secretTapCount += 1;
  window.clearTimeout(secretResetTimer);

  if (secretTapCount >= nextLogoDrawCount) {
    activateLogoDraw();
    secretTapCount = 0;
    return;
  }

  secretResetTimer = window.setTimeout(() => {
    secretTapCount = 0;
  }, 1400);
};

secretLogos.forEach((logo) => {
  logo.addEventListener("pointerup", handleSecretLogoTap);
  logo.addEventListener("click", (event) => event.preventDefault());
  logo.addEventListener("error", () => setLogoSource(defaultLogoSource));
});

if (catLogoButton) {
  catLogoButton.addEventListener("pointerup", handleSecretLogoTap);
  catLogoButton.addEventListener("click", (event) => event.preventDefault());
}

const buildBookingMessage = () => {
  if (!bookingForm) return "";

  const formData = new FormData(bookingForm);
  const preferredDateTime = formData.get("preferredDateTime")?.toString().trim() || "\u672a\u5165\u529b";
  const residence = formData.get("residence")?.toString().trim() || "\u672a\u5165\u529b";
  const memo = formData.get("memo")?.toString().trim() || "\u672a\u5165\u529b";
  const name = formData.get("name")?.toString().trim() || "\u672a\u5165\u529b";
  const menu = bookingSelection.menu || "\u672a\u9078\u629e";
  const area = bookingSelection.area || "\u672a\u9078\u629e";

  return [
    "\u4e88\u7d04\u30fb\u76f8\u8ac7\u5e0c\u671b\u3067\u3059\u3002",
    `\u30e1\u30cb\u30e5\u30fc\u756a\u53f7\uff1a${menu}`,
    `\u30a8\u30ea\u30a2\u756a\u53f7\uff1a${area}`,
    `\u5e0c\u671b\u65e5\u6642\uff1a${preferredDateTime}`,
    `\u304a\u4f4f\u307e\u3044\uff1a${residence}`,
    `\u5099\u8003\uff1a${memo}`,
    `\u304a\u540d\u524d\uff1a${name}`
  ].join("\n");
};

const updateMessage = () => {
  if (bookingMessage) {
    bookingMessage.innerText = buildBookingMessage();
  }
};

const copyText = async (text, button) => {
  const originalText = button.innerText;

  try {
    await navigator.clipboard.writeText(text);
    button.innerText = "\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f";
  } catch {
    button.innerText = "\u30b3\u30d4\u30fc\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f";
  }

  window.setTimeout(() => {
    button.innerText = originalText;
  }, 1800);
};

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (target) {
      await copyText(target.innerText, button);
    }
  });
});

bookingChoiceButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");

  button.addEventListener("click", () => {
    const choiceType = button.dataset.bookingChoice;
    if (!choiceType || !(choiceType in bookingSelection)) return;

    bookingSelection[choiceType] = button.dataset.value || "";

    bookingChoiceButtons.forEach((choiceButton) => {
      if (choiceButton.dataset.bookingChoice !== choiceType) return;
      const isSelected = choiceButton.dataset.value === bookingSelection[choiceType];
      choiceButton.classList.toggle("is-selected", isSelected);
      choiceButton.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    updateMessage();
  });
});

if (bookingForm) {
  const today = new Date().toISOString().slice(0, 10);

  dateInputs.forEach((input) => {
    input.min = today;
  });

  bookingForm.addEventListener("input", updateMessage);
  bookingForm.addEventListener("change", updateMessage);
  bookingForm.addEventListener("reset", () => {
    bookingSelection.menu = "";
    bookingSelection.area = "";
    bookingChoiceButtons.forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    window.setTimeout(updateMessage, 0);
  });
}

if (!motionQuery.matches && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".section, .quick-links, .line-contact, .booking-contact-card, .booking-form, .notice, .price-card, .area-card, .service-examples > div"
  );

  revealTargets.forEach((target) => target.classList.add("reveal-on-scroll"));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.01,
      rootMargin: "0px 0px -4% 0px"
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

setLogoSource(getStoredLogoSource());
updateMessage();

