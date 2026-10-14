const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => navLinks.classList.remove("open"))
);

const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".card");
const noResults = document.getElementById("noResults");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    let visible = 0;

    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hide", !show);
      if (show) visible++;
    });

    noResults.hidden = visible !== 0;
  });
});

const overlay = document.getElementById("modalOverlay");
const modalEventName = document.getElementById("modalEventName");
const form = document.getElementById("regForm");
const successBox = document.getElementById("successBox");
const successMsg = document.getElementById("successMsg");
let currentEvent = "";

function openModal(eventName) {
  currentEvent = eventName;
  modalEventName.textContent = eventName;
  form.reset();
  clearErrors();
  form.hidden = false;
  successBox.hidden = true;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("name").focus();
}

function closeModal() {
  overlay.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll(".register-btn").forEach((btn) =>
  btn.addEventListener("click", () => openModal(btn.dataset.event))
);
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("successClose").addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) closeModal(); });

function setError(id, message) {
  const input = document.getElementById(id);
  document.getElementById(id + "Error").textContent = message;
  input.closest(".form-group").classList.toggle("invalid", !!message);
}

function clearErrors() {
  ["name", "email", "phone", "year"].forEach((id) => setError(id, ""));
}

function validate() {
  clearErrors();
  let ok = true;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const year = form.year.value;

  if (name.length < 3) { setError("name", "Please enter your full name (min 3 characters)."); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Please enter a valid email address."); ok = false; }
  if (!/^[6-9]\d{9}$/.test(phone)) { setError("phone", "Enter a valid 10-digit mobile number."); ok = false; }
  if (!year) { setError("year", "Please select your year of study."); ok = false; }

  return ok;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const registration = {
    event: currentEvent,
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    year: form.year.value,
    time: new Date().toLocaleString(),
  };

  const saved = JSON.parse(localStorage.getItem("registrations") || "[]");

  const duplicate = saved.some(
    (r) => r.email.toLowerCase() === registration.email.toLowerCase() && r.event === currentEvent
  );
  if (duplicate) {
    setError("email", "This email is already registered for this event.");
    return;
  }

  saved.push(registration);
  localStorage.setItem("registrations", JSON.stringify(saved));

  successMsg.textContent = `Thank you, ${registration.name}! You are registered for "${currentEvent}". A confirmation will be sent to ${registration.email}.`;
  form.hidden = true;
  successBox.hidden = false;
});