const toast = document.querySelector("#toast");
const db = window.supabaseClient;
const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
};
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
};

async function refreshServerStatus() {
  try {
    const response = await fetch("https://api.mcsrvstat.us/3/stammers-shinedown.tun.ply.gg");
    if (!response.ok) throw new Error("Server status request failed");
    const data = await response.json();
    const online = Boolean(data.online);
    const players = online && data.players ? data.players.online : 0;
    setText("#player-count", online ? players : "—");
    setText("#dashboard-player-count", online ? players : "—");
    setText("#server-health", online ? "Online" : "Offline");
    document.querySelector(".server-meta .status-dot")?.classList.toggle("offline", !online);
  } catch {
    setText("#player-count", "—");
    setText("#dashboard-player-count", "—");
    setText("#server-health", "Ukendt");
  }
}
refreshServerStatus();
window.setInterval(refreshServerStatus, 30000);

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
  const password = new FormData(form).get("password");
  const message = form.querySelector(".form-message");
  if (!db) {
    message.textContent = "Owner-login er ikke konfigureret endnu. Indsæt Supabase-nøglerne først.";
    return;
  }
  (async () => {
    const { data, error } = await db.auth.signInWithPassword({ email: username, password });
    if (error || !data.user) {
      message.textContent = "Login afvist. Kontrollér email og adgangskode.";
      return;
    }
    const { data: member, error: roleError } = await db.from("team_members").select("role").eq("user_id", data.user.id).single();
    if (roleError || member?.role !== "Owner") {
      await db.auth.signOut();
      message.textContent = "Adgang afvist. Din konto har ikke Owner-rollen.";
      return;
    }
    setText("#owner-name", `${username}.`);
    document.querySelector("#owner-dashboard").hidden = false;
    document.querySelector("#owner-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    form.reset();
    await loadApplications();
  })();
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
document.querySelectorAll("[data-application-action]").forEach((button) => button.addEventListener("click", () => {
  document.querySelector("#review-title").textContent = `${button.dataset.applicant} søger`;
  document.querySelector("#review-summary").textContent = `${button.dataset.role} · Minecraft-navn: ${button.dataset.applicant} · Skal gennemgås før adgang`;
  reviewModal.dataset.sourceButton = button.dataset.applicant;
  reviewModal.classList.add("open");
  reviewModal.setAttribute("aria-hidden", "false");
}));

async function loadApplications() {
  if (!db) return;
  const { data, error } = await db.from("applications").select("id,minecraft_name,discord_name,role,status").order("created_at", { ascending: false });
  if (error) {
    showToast("Kunne ikke hente ansøgninger.");
    return;
  }
  const list = document.querySelector("#application-list");
  list.innerHTML = "";
  const pending = data.filter((item) => item.status === "pending");
  setText("#application-total", pending.length);
  setText("#application-badge", `${pending.length} AFVENTER`);
  if (!data.length) {
    list.innerHTML = '<div class="empty-state">Ingen ansøgninger endnu.</div>';
    return;
  }
  data.forEach((item) => {
    const row = document.createElement("div");
    row.innerHTML = `<b>${item.minecraft_name}</b><span>${item.role} · Discord: ${item.discord_name}</span><button data-live-application="${item.id}" ${item.status !== "pending" ? "disabled" : ""}>${item.status === "pending" ? "Gennemgå" : item.status === "accepted" ? "Accepteret ✓" : "Afvist ✓"}</button>`;
    list.appendChild(row);
    row.querySelector("button").addEventListener("click", () => openLiveReview(item));
  });
}
function openLiveReview(application) {
  reviewModal.dataset.applicationId = application.id;
  setText("#review-title", `${application.minecraft_name} søger`);
  setText("#review-summary", `${application.role} · Minecraft-navn: ${application.minecraft_name} · Discord: ${application.discord_name}`);
  reviewModal.classList.add("open");
  reviewModal.setAttribute("aria-hidden", "false");
}

document.querySelector("[data-close-review]").addEventListener("click", () => {
  reviewModal.classList.remove("open");
  reviewModal.setAttribute("aria-hidden", "true");
});
document.querySelectorAll("[data-review-decision]").forEach((button) => button.addEventListener("click", async () => {
  if (!db || !reviewModal.dataset.applicationId) {
    reviewModal.querySelector(".form-message").textContent = "Der er ingen databaseforbindelse.";
    return;
  }
  const status = button.dataset.reviewDecision;
  const { data: userData } = await db.auth.getUser();
  const { error } = await db.from("applications").update({ status, reviewed_by: userData.user?.id }).eq("id", reviewModal.dataset.applicationId);
  if (error) {
    reviewModal.querySelector(".form-message").textContent = "Kunne ikke gemme beslutningen.";
    return;
  }
  reviewModal.querySelector(".form-message").textContent = status === "accepted"
    ? "Ansøgningen er accepteret. Adgang skal oprettes separat af Owner."
    : "Ansøgningen er afvist. Ingen adgang er givet.";
  await loadApplications();
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
  const payload = { minecraft_name: formData.get("minecraft"), discord_name: formData.get("discord"), role: formData.get("role"), message: formData.get("message") };
  if (!db) {
    form.querySelector(".form-message").textContent = "Ansøgninger er midlertidigt lukket, indtil systemet er konfigureret.";
    return;
  }
  db.from("applications").insert(payload).then(({ error }) => {
    if (error) {
      form.querySelector(".form-message").textContent = "Ansøgningen kunne ikke sendes. Prøv igen.";
      return;
    }
    form.querySelector(".form-message").textContent = "Ansøgningen er sendt til Owner-teamet.";
    showToast("Ansøgningen er sendt.");
    form.reset();
  });
});

document.querySelectorAll("[data-rank]").forEach((button) => button.addEventListener("click", () => {
  showToast(`${button.dataset.rank} er valgt — webshop kommer snart.`);
}));

document.querySelector("[data-logout]").addEventListener("click", async () => {
  if (db) await db.auth.signOut();
  document.querySelector("#owner-dashboard").hidden = true;
  showToast("Du er logget ud af Owner Console.");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const menu = document.querySelector(".menu-toggle");
menu.addEventListener("click", () => menu.classList.toggle("open"));
document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => menu.classList.remove("open")));
