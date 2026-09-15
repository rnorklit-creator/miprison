const toast = document.querySelector("#toast");
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
};

document.querySelector("[data-copy-ip]").addEventListener("click", async (event) => {
  openPlayModal();
});
document.querySelector("[data-close-play]").addEventListener("click", () => {
  playModal.classList.remove("open");
  playModal.setAttribute("aria-hidden", "true");
});
document.querySelector("[data-copy-modal-ip]").addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText(serverIp);
    event.currentTarget.textContent = "✓";
    showToast(`IP kopieret: ${serverIp}`);
  } catch {
    showToast(`Kopiér IP: ${serverIp}`);
  }
});

const modal = document.querySelector("#login-modal");
const ownerModal = document.querySelector("#owner-modal");
const playModal = document.querySelector("#play-modal");
const reviewModal = document.querySelector("#application-review-modal");
const checkoutModal = document.querySelector("#checkout-modal");
const serverIp = "stammers-shinedown.tun.ply.gg";
const openPlayModal = () => {
  playModal.classList.add("open");
  playModal.setAttribute("aria-hidden", "false");
};
document.querySelectorAll("[data-open-login]").forEach((button) => button.addEventListener("click", () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  modal.querySelector("input").focus();
}));
document.querySelector("[data-close-login]").addEventListener("click", () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
});
modal.addEventListener("click", (event) => {
  if (event.target === modal) document.querySelector("[data-close-login]").click();
});
document.querySelector("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const username = new FormData(form).get("username");
  form.querySelector(".form-message").textContent = "Owner Console åbnes...";
  window.setTimeout(() => {
    document.querySelector("#owner-name").textContent = `${username}.`;
    document.querySelector("#owner-dashboard").hidden = false;
    document.querySelector("#owner-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    form.reset();
  }, 350);
});

document.querySelector("[data-open-owner-confirm]").addEventListener("click", () => {
  ownerModal.classList.add("open");
  ownerModal.setAttribute("aria-hidden", "false");
});
document.querySelector("[data-close-owner]").addEventListener("click", () => {
  ownerModal.classList.remove("open");
  ownerModal.setAttribute("aria-hidden", "true");
});
document.querySelector("[data-confirm-owner]").addEventListener("click", (event) => {
  event.currentTarget.parentElement.querySelector(".form-message").textContent = "Bekræftelse godkendt i lokal demo.";
  window.setTimeout(() => {
    ownerModal.classList.remove("open");
    ownerModal.setAttribute("aria-hidden", "true");
    document.querySelector("#owner-dashboard").hidden = false;
    document.querySelector("#owner-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 500);
});

document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== button.dataset.tab; });
  button.classList.add("active");
}));
document.querySelector("[data-logout]").addEventListener("click", () => {
  document.querySelector("#owner-dashboard").hidden = true;
  showToast("Du er logget ud af Owner Console.");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelectorAll("[data-application-action]").forEach((button) => button.addEventListener("click", () => {
  document.querySelector("#review-title").textContent = `${button.dataset.applicant} søger`;
  document.querySelector("#review-summary").textContent = `${button.dataset.role} · Minecraft-navn: ${button.dataset.applicant} · Skal gennemgås før adgang`;
  reviewModal.dataset.sourceButton = button.dataset.applicant;
  reviewModal.classList.add("open");
  reviewModal.setAttribute("aria-hidden", "false");
}));

document.querySelector("[data-close-review]").addEventListener("click", () => {
  reviewModal.classList.remove("open");
  reviewModal.setAttribute("aria-hidden", "true");
});
document.querySelectorAll("[data-review-decision]").forEach((button) => button.addEventListener("click", () => {
  const source = document.querySelector(`[data-applicant="${reviewModal.dataset.sourceButton}"]`);
  source.textContent = button.dataset.reviewDecision === "accepted" ? "Accepteret ✓" : "Afvist ✓";
  source.disabled = true;
  source.classList.add(button.dataset.reviewDecision === "accepted" ? "accepted" : "denied");
  reviewModal.querySelector(".form-message").textContent = button.dataset.reviewDecision === "accepted"
    ? "Ansøgningen er accepteret. Adgang skal stadig oprettes separat af Owner."
    : "Ansøgningen er afvist. Ingen adgang er givet.";
}));

document.querySelectorAll("[data-product]").forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.points === "0") {
    document.querySelector("#ansogninger").scrollIntoView({ behavior: "smooth" });
    showToast("Builder kræver en almindelig ansøgning.");
    return;
  }
  document.querySelector("#checkout-item").textContent = `${button.dataset.product} · Version 1.21.11`;
  document.querySelector("#checkout-price").textContent = `${button.dataset.points} Discord Points`;
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
}));
document.querySelector("[data-close-checkout]").addEventListener("click", () => {
  checkoutModal.classList.remove("open");
  checkoutModal.setAttribute("aria-hidden", "true");
});
document.querySelector("[data-confirm-purchase]").addEventListener("click", (event) => {
  const discord = document.querySelector("#checkout-discord");
  const message = checkoutModal.querySelector(".form-message");
  if (!discord.value.trim()) {
    discord.focus();
    message.textContent = "Skriv dit Discord-navn først.";
    return;
  }
  message.textContent = "Demo-betaling oprettet. Discord-botten skal bekræfte pointene.";
  event.currentTarget.disabled = true;
});

document.querySelector("#application-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  form.querySelector(".form-message").textContent = `Ansøgningen fra ${formData.get("minecraft")} er sendt til teamet.`;
  showToast("Ansøgningen er sendt — du får svar på Discord.");
  event.currentTarget.reset();
});

document.querySelectorAll("[data-rank]").forEach((button) => button.addEventListener("click", () => {
  showToast(`${button.dataset.rank} er valgt — webshop kommer snart.`);
}));

const menu = document.querySelector(".menu-toggle");
menu.addEventListener("click", () => menu.classList.toggle("open"));
document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => menu.classList.remove("open")));
