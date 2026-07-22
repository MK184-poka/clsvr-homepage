const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");
const copyButtons = document.querySelectorAll("[data-copy-target]");
const bookingChoiceButtons = document.querySelectorAll("[data-booking-choice]");
const dateInputs = document.querySelectorAll('input[type="date"]');
const secretLogos = document.querySelectorAll(".js-secret-logo");
const catLogoButton = document.querySelector(".cat-logo-button");
const catStaffBubble = document.getElementById("cat-staff-bubble");
const rareCatOverlay = document.getElementById("rare-cat-overlay");
const rareCatClose = rareCatOverlay?.querySelector(".rare-cat-close");
const rareCatDate = document.getElementById("rare-cat-date");
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
const desktopCaseQuery = window.matchMedia("(min-width: 901px)");
const caseGallery = document.querySelector(".case-grid");
const caseSlides = Array.from(caseGallery?.querySelectorAll("figure") || []);

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
  "logo-black.webp": ["蜂の巣は、近づかずにご相談くださいニャ", "写真1枚から相談できますニャ"],
  "logo-lightgray.webp": ["巣の場所が分からなくても大丈夫ですニャ", "まずは状況を教えてくださいニャ"],
  "logo-beige.webp": ["相談だけでも大丈夫ですニャ", "分かる範囲で送ってくださいニャ"],
  "logo-bluegray.webp": ["作業前に料金をご案内しますニャ", "高い場所の巣も無理をしないでくださいニャ"],
  "logo-brown.webp": ["暮らしの困りごともご相談くださいニャ", "もみほぐしの相談も受け付けていますニャ"],
  "logo-orange.webp": ["LINEなら写真を送るだけですニャ", "お急ぎの時は電話でも大丈夫ですニャ"],
  "logo-gray.webp": ["蜂を叩いたり、水をかけたりしないでくださいニャ", "安全な場所から確認してくださいニャ"],
  "logo-darkbrown.webp": ["CLSVRが山口県内へ伺いますニャ", "周南市を拠点に動いていますニャ"],
  "logo-orange-black.webp": ["ホームページの相談もできますニャ", "小さなご相談も歓迎ですニャ"],
  "logo-secret-calico.webp": ["レア猫ですニャ。今日も安全第一ですニャ", "見つけてくれてありがとうニャ"]
};

let secretTapCount = 0;
let secretResetTimer;
let logoSwitchTimer;
let logoDrawUnlockTimer;
let logoDrawActive = false;
let nextLogoDrawCount = 5 + Math.floor(Math.random() * 6);
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
  // Static-site production odds: one rare result per 100,000,000 completed draws.
  // A server-side shared counter is required to guarantee a fixed number of winners nationwide.
  const isSecret = Math.random() < 1 / 100000000;

  return {
    isSecret,
    source: isSecret
      ? secretLogoSources[0]
      : logoVariantSources[Math.floor(Math.random() * logoVariantSources.length)]
  };
};

const showRareCatOverlay = () => {
  if (!rareCatOverlay) return;
  const now = new Date();
  if (rareCatDate) {
    rareCatDate.textContent = `当選日時：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
  rareCatOverlay.hidden = false;
  window.requestAnimationFrame(() => rareCatOverlay.classList.add("is-visible"));
};

const closeRareCatOverlay = () => {
  if (!rareCatOverlay) return;
  rareCatOverlay.classList.remove("is-visible");
  window.setTimeout(() => { rareCatOverlay.hidden = true; }, 240);
};

rareCatClose?.addEventListener("click", closeRareCatOverlay);
rareCatOverlay?.addEventListener("click", (event) => {
  if (event.target === rareCatOverlay) closeRareCatOverlay();
});

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
  nextLogoDrawCount = 5 + Math.floor(Math.random() * 6);
  window.clearTimeout(logoDrawUnlockTimer);

  const result = drawLogoSource();
  document.body.classList.remove("hidden-mode", "secret-rare-mode");
  switchLogoSource(result.source, result.isSecret);
  showLogoMessage(result.source, result.isSecret);

  if (result.isSecret) {
    showRareCatOverlay();
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
  }, 2200);
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

if (caseGallery && caseSlides.length > 1) {
  caseGallery.classList.add("is-carousel-ready");
  let activeCaseIndex = 0;
  let caseTimer;

  const showCaseSlide = (index) => {
    activeCaseIndex = index;
    caseSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeCaseIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  };

  const stopCaseAutoplay = () => window.clearInterval(caseTimer);
  const startCaseAutoplay = () => {
    stopCaseAutoplay();
    if (!desktopCaseQuery.matches || motionQuery.matches) return;
    caseTimer = window.setInterval(() => {
      showCaseSlide((activeCaseIndex + 1) % caseSlides.length);
    }, 5200);
  };

  const updateCaseGallery = () => {
    if (desktopCaseQuery.matches) {
      showCaseSlide(activeCaseIndex);
      startCaseAutoplay();
      return;
    }
    stopCaseAutoplay();
    caseSlides.forEach((slide) => {
      slide.classList.remove("is-active");
      slide.removeAttribute("aria-hidden");
    });
  };

  caseGallery.addEventListener("mouseenter", stopCaseAutoplay);
  caseGallery.addEventListener("mouseleave", startCaseAutoplay);
  desktopCaseQuery.addEventListener("change", updateCaseGallery);
  motionQuery.addEventListener("change", updateCaseGallery);
  updateCaseGallery();
}

setLogoSource(getStoredLogoSource());
updateMessage();

