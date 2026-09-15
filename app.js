const toast = document.querySelector("#toast");
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
};

document.querySelector("[data-copy-ip]").addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText("play.miprison.dk");
    event.currentTarget.innerHTML = "IP kopieret <span>✓</span>";
    showToast("Server-IP kopieret: play.miprison.dk");
    window.setTimeout(() => { event.currentTarget.innerHTML = "Spil nu <span>→</span>"; }, 2200);
  } catch {
    showToast("Forbind til play.miprison.dk");
  }
});

const modal = document.querySelector("#login-modal");
const ownerModal = document.querySelector("#owner-modal");
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
  button.textContent = "Åbnet ✓";
  showToast("Ansøgningen er åbnet i demo-visning.");
}));

document.querySelector("#application-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.querySelector(".form-message").textContent = "Tak! Din ansøgning er klar til at blive sendt.";
  event.currentTarget.reset();
});

document.querySelectorAll("[data-rank]").forEach((button) => button.addEventListener("click", () => {
  showToast(`${button.dataset.rank} er valgt — webshop kommer snart.`);
}));

const menu = document.querySelector(".menu-toggle");
menu.addEventListener("click", () => menu.classList.toggle("open"));
document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => menu.classList.remove("open")));
