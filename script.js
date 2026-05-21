const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");
const copyButtons = document.querySelectorAll("[data-copy-target]");
const bookingChoiceButtons = document.querySelectorAll("[data-booking-choice]");
const dateInputs = document.querySelectorAll('input[type="date"]');
const secretLogos = document.querySelectorAll(".js-secret-logo");
const contactLinks = window.CLSVR_CONTACT_LINKS || {};
const contactLinkAnchors = document.querySelectorAll("[data-contact-link]");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const logoStorageKey = "clsvr-logo-source";
const logoSources = [
  "logo-black.webp",
  "logo-lightgray.webp",
  "logo-beige.webp",
  "logo-bluegray.webp",
  "logo-brown.webp",
  "logo-orange.webp",
  "logo-gray.webp",
  "logo-darkbrown.webp",
  "logo-orange-black.webp",
  "logo-secret-calico.webp"
];

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
    return logoSources.includes(source) ? source : logoSources[0];
  } catch {
    return logoSources[0];
  }
};

const storeLogoSource = (source) => {
  try {
    sessionStorage.setItem(logoStorageKey, source);
  } catch {
    // Storage may be unavailable in private browsing modes.
  }
};

const rotateLogo = (event) => {
  event.preventDefault();
  const currentSource = secretLogos[0]?.getAttribute("src") || logoSources[0];
  const currentIndex = logoSources.indexOf(currentSource);
  const nextSource = logoSources[(currentIndex + 1) % logoSources.length];
  setLogoSource(nextSource);
  storeLogoSource(nextSource);
};

secretLogos.forEach((logo) => {
  logo.addEventListener("click", rotateLogo);
  logo.addEventListener("error", () => setLogoSource(logoSources[0]));
});

const buildBookingMessage = () => {
  if (!bookingForm) return "";

  const formData = new FormData(bookingForm);
  const preferredDateTime = formData.get("preferredDateTime")?.toString().trim() || "未入力";
  const residence = formData.get("residence")?.toString().trim() || "未入力";
  const memo = formData.get("memo")?.toString().trim() || "未入力";
  const name = formData.get("name")?.toString().trim() || "未入力";
  const menu = bookingSelection.menu || "未選択";
  const area = bookingSelection.area || "未選択";

  return [
    "予約・相談希望です。",
    `メニュー番号：${menu}`,
    `エリア番号：${area}`,
    `希望日時：${preferredDateTime}`,
    `お住まい：${residence}`,
    `備考：${memo}`,
    `お名前：${name}`
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
    button.innerText = "コピーしました";
  } catch {
    button.innerText = "コピーできませんでした";
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
