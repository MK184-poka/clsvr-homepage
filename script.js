const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");
const copyButtons = document.querySelectorAll("[data-copy-target]");
const bookingChoiceButtons = document.querySelectorAll("[data-booking-choice]");
const bookingMenuNumber = document.getElementById("booking-menu-number");
const bookingAreaNumber = document.getElementById("booking-area-number");
const dateInputs = document.querySelectorAll('input[type="date"]');
const secretLogos = document.querySelectorAll(".js-secret-logo");
const floatingConsult = document.querySelector(".floating-consult");
const catLogoButton = document.querySelector(".cat-logo-button");
const catStaffBubble = document.getElementById("cat-staff-bubble");
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
const catStaffLines = {
  "logo-black.webp": ["疲れてニャいかニャ？", "少し休んでいくニャ"],
  "logo-lightgray.webp": ["今日は休んでもいいニャ", "今日はゆっくりモードだニャ"],
  "logo-beige.webp": ["お茶でも飲むニャ", "深呼吸するニャ"],
  "logo-bluegray.webp": ["深呼吸するニャ", "肩の力をぬくニャ"],
  "logo-brown.webp": ["その作業、預けてもいいニャ", "無理しすぎ注意ニャ"],
  "logo-orange.webp": ["いい日になる気がするニャ", "今日はゆっくり進むニャ"],
  "logo-gray.webp": ["頑張りすぎ注意ニャ", "ちゃんと休むニャ"],
  "logo-darkbrown.webp": ["ちょっと肩の力ぬくニャ", "焦らなくていいニャ"],
  "logo-orange-black.webp": ["自分時間、忘れてニャい？", "その用事、分けてもいいニャ"],
  "logo-secret-calico.webp": ["今日はラッキーだニャ", "秘密の三毛猫だニャ", "自分時間をプレゼントだニャ"]
};
const defaultLogoSource = logoVariantSources[0];
const allLogoSources = [...logoVariantSources, ...secretLogoSources];
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let secretTapCount = 0;
let secretResetTimer;
let logoEffectTimer;
let logoSwitchTimer;
let logoDrawUnlockTimer;
let logoDrawActive = false;
let nextLogoDrawCount = 18 + Math.floor(Math.random() * 5);
let catLogoTapTimer;
let pawTimer;
let catBubbleTimer;
let scrollTicking = false;
const bookingSelection = {
  menu: "",
  area: ""
};

const formatDate = (value) => {
  if (!value) return "未選択";
  const date = new Date(`${value}T00:00:00`);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const fieldValue = (formData, key) => {
  const value = formData.get(key);
  return value && value.toString().trim() ? value.toString().trim() : "未入力";
};

const buildBookingMessage = () => {
  if (!bookingForm) return "";

  const formData = new FormData(bookingForm);
  const preferredDateTime = formData.get("preferredDateTime")?.toString().trim() || "";
  const name = formData.get("name")?.toString().trim() || "";

  return [
    "予約希望です",
    `メニュー：${bookingSelection.menu}`,
    `エリア：${bookingSelection.area}`,
    `希望日時：${preferredDateTime}`,
    `お名前：${name}`
  ].join("\n");
};

const updateMessage = () => {
  if (!bookingMessage) return;
  bookingMessage.innerText = buildBookingMessage();
  if (bookingMenuNumber) bookingMenuNumber.innerText = bookingSelection.menu;
  if (bookingAreaNumber) bookingAreaNumber.innerText = bookingSelection.area;
};

const copyText = async (text, button) => {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.innerText;
    button.innerText = "コピー済み";
    setTimeout(() => {
      button.innerText = originalText;
    }, 1800);
  } catch {
    button.innerText = "選択してコピー";
  }
};

const setSecretLogo = (source) => {
  secretLogos.forEach((logo) => {
    logo.src = source;
  });
};

const rememberLogoSource = (source) => {
  try {
    sessionStorage.setItem(logoStorageKey, source);
  } catch {
    // Storage can be unavailable in strict private browsing modes.
  }
};

const readRememberedLogoSource = () => {
  try {
    const source = sessionStorage.getItem(logoStorageKey);
    return allLogoSources.includes(source) ? source : defaultLogoSource;
  } catch {
    return defaultLogoSource;
  }
};

const pickCatStaffLine = (source) => {
  const lines = catStaffLines[source] || ["少し休んでいくニャ。"];
  return lines[Math.floor(Math.random() * lines.length)];
};

const switchLogoSource = (source, isSecret) => {
  window.clearTimeout(logoSwitchTimer);
  document.body.classList.add("logo-switching");

  logoSwitchTimer = window.setTimeout(
    () => {
      setSecretLogo(source);
      rememberLogoSource(source);
      window.requestAnimationFrame(() => {
        document.body.classList.remove("logo-switching");
        document.body.classList.add("hidden-mode");
        document.body.classList.toggle("secret-rare-mode", isSecret);
      });
    },
    motionQuery.matches ? 0 : 150
  );
};

const showCatStaffLine = (source, isSecret) => {
  if (!catStaffBubble) return;

  window.clearTimeout(catBubbleTimer);
  catStaffBubble.textContent = pickCatStaffLine(source);
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

  if (isSecret) {
    return {
      isSecret,
      source: secretLogoSources[0]
    };
  }

  return {
    isSecret,
    source: logoVariantSources[Math.floor(Math.random() * logoVariantSources.length)]
  };
};

const activateLogoDraw = () => {
  if (logoDrawActive) return;

  logoDrawActive = true;
  nextLogoDrawCount = 18 + Math.floor(Math.random() * 5);
  window.clearTimeout(logoEffectTimer);
  window.clearTimeout(logoDrawUnlockTimer);

  const result = drawLogoSource();
  document.body.classList.remove("hidden-mode");
  document.body.classList.remove("secret-rare-mode");
  switchLogoSource(result.source, result.isSecret);
  showCatStaffLine(result.source, result.isSecret);

  if (result.isSecret) {
    createFloatingPaw();
    window.setTimeout(createFloatingPaw, 240);
    window.setTimeout(createFloatingPaw, 520);
  }

  logoDrawUnlockTimer = window.setTimeout(() => {
    logoDrawActive = false;
  }, 720);

  logoEffectTimer = window.setTimeout(() => {
    document.body.classList.remove("hidden-mode");
    document.body.classList.remove("secret-rare-mode");
  }, result.isSecret ? 8200 : 6200);
};

const handleSecretLogoTap = (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (catLogoButton && !motionQuery.matches) {
    window.clearTimeout(catLogoTapTimer);
    catLogoButton.classList.remove("is-tapped");
    // Force a reflow so rapid taps restart the soft press animation.
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
  logo.addEventListener("click", (event) => {
    event.preventDefault();
  });
  logo.addEventListener("error", () => {
    logo.src = defaultLogoSource;
  });
});

if (catLogoButton) {
  catLogoButton.addEventListener("pointerup", handleSecretLogoTap);
  catLogoButton.addEventListener("click", (event) => {
    event.preventDefault();
  });
}

const revealTargets = document.querySelectorAll(
  ".section, .quick-links, .time-gift, .line-contact, .booking-form, .notice, .price-card, .area-card, .service-examples > div, .hero-reception-art, .hero-request-art, .hero-soft-panel, .counter-card, .memo-pin, .service-menu-showcase"
);

if (!motionQuery.matches && "IntersectionObserver" in window) {
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
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const createFloatingPaw = () => {
  if (motionQuery.matches) return;

  const paw = document.createElement("span");
  paw.className = "paw-float";
  paw.setAttribute("aria-hidden", "true");
  document.body.appendChild(paw);
  paw.addEventListener("animationend", () => paw.remove(), { once: true });
};

const scheduleFloatingPaw = () => {
  if (motionQuery.matches) return;

  window.clearTimeout(pawTimer);
  pawTimer = window.setTimeout(() => {
    createFloatingPaw();
    scheduleFloatingPaw();
  }, 11000 + Math.random() * 7000);
};

if (floatingConsult) {
  floatingConsult.addEventListener("pointerup", createFloatingPaw);
  scheduleFloatingPaw();
}

const updateShopScroll = () => {
  const drift = Math.min(window.scrollY * 0.08, 42).toFixed(2);
  document.documentElement.style.setProperty("--shop-scroll", `${drift}px`);
  scrollTicking = false;
};

if (!motionQuery.matches) {
  updateShopScroll();
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateShopScroll);
    },
    { passive: true }
  );
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;
    await copyText(target.innerText, button);
  });
});

bookingChoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const choiceType = button.dataset.bookingChoice;
    if (!choiceType || !(choiceType in bookingSelection)) return;

    bookingSelection[choiceType] = button.dataset.value || "";
    bookingChoiceButtons.forEach((choiceButton) => {
      if (choiceButton.dataset.bookingChoice !== choiceType) return;
      choiceButton.classList.toggle("is-selected", choiceButton === button);
      choiceButton.setAttribute("aria-pressed", choiceButton === button ? "true" : "false");
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
    setTimeout(updateMessage, 0);
  });
}

updateMessage();
const rememberedLogoSource = readRememberedLogoSource();
setSecretLogo(rememberedLogoSource);
document.body.classList.toggle("secret-rare-mode", secretLogoSources.includes(rememberedLogoSource));
