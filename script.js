const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");
const copyButtons = document.querySelectorAll("[data-copy-target]");
const bookingChoiceButtons = document.querySelectorAll("[data-booking-choice]");
const dateInputs = document.querySelectorAll('input[type="date"]');
const secretLogos = document.querySelectorAll(".js-secret-logo");
const catLogoButton = document.querySelector(".cat-logo-button");
const catStaffBubble = document.getElementById("cat-staff-bubble");
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
  "logo-black.webp": ["\u5c11\u3057\u4f11\u3093\u3067\u3044\u304d\u307e\u305b\u3093\u304b", "\u7121\u7406\u306a\u304f\u9032\u3081\u307e\u3057\u3087\u3046"],
  "logo-lightgray.webp": ["\u4eca\u65e5\u306f\u3086\u3063\u304f\u308a\u6574\u3048\u307e\u3057\u3087\u3046", "\u4f11\u3080\u6642\u9593\u3082\u5927\u5207\u3067\u3059"],
  "logo-beige.webp": ["\u3072\u3068\u606f\u3064\u3044\u3066\u304b\u3089\u3067\u5927\u4e08\u592b\u3067\u3059", "\u6df1\u547c\u5438\u3057\u3066\u3044\u304d\u307e\u3057\u3087\u3046"],
  "logo-bluegray.webp": ["\u80a9\u306e\u529b\u3092\u629c\u3044\u3066\u304f\u3060\u3055\u3044", "\u6df1\u547c\u5438\u3057\u3066\u3044\u304d\u307e\u3057\u3087\u3046"],
  "logo-brown.webp": ["\u305d\u306e\u4f5c\u696d\u3001\u3054\u76f8\u8ac7\u304f\u3060\u3055\u3044", "\u7121\u7406\u3057\u3059\u304e\u306a\u3044\u3067\u304f\u3060\u3055\u3044"],
  "logo-orange.webp": ["\u3044\u3044\u4e00\u65e5\u306b\u306a\u308a\u307e\u3059\u3088\u3046\u306b", "\u4eca\u65e5\u306f\u3086\u3063\u304f\u308a\u9032\u3081\u307e\u3057\u3087\u3046"],
  "logo-gray.webp": ["\u9811\u5f35\u308a\u3059\u304e\u306b\u3054\u6ce8\u610f\u304f\u3060\u3055\u3044", "\u3061\u3083\u3093\u3068\u4f11\u3080\u6642\u9593\u3092"],
  "logo-darkbrown.webp": ["\u5c11\u3057\u80a9\u306e\u529b\u3092\u629c\u304d\u307e\u3057\u3087\u3046", "\u7126\u3089\u306a\u304f\u3066\u5927\u4e08\u592b\u3067\u3059"],
  "logo-orange-black.webp": ["\u81ea\u5206\u306e\u6642\u9593\u3082\u5927\u5207\u306b", "\u305d\u306e\u7528\u4e8b\u3001\u5206\u3051\u3066\u3082\u5927\u4e08\u592b\u3067\u3059"],
  "logo-secret-calico.webp": ["\u4eca\u65e5\u306f\u30e9\u30c3\u30ad\u30fc\u3067\u3059", "\u79d8\u5bc6\u306e\u30ed\u30b4\u3067\u3059", "\u81ea\u5206\u6642\u9593\u3092\u5c11\u3057\u5897\u3084\u3057\u307e\u3057\u3087\u3046"]
};

let secretTapCount = 0;
let secretResetTimer;
let logoSwitchTimer;
let logoDrawUnlockTimer;
let logoDrawActive = false;
let nextLogoDrawCount = 18 + Math.floor(Math.random() * 5);
let catLogoTapTimer;
let catBubbleTimer;

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
    ".section, .quick-links, .line-contact, .booking-form, .notice, .price-card, .area-card, .service-examples > div"
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
