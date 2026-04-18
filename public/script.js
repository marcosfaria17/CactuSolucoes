const WHATSAPP_NUMBER = "5511999999999";
const WHATSAPP_MESSAGE =
  "Olá! Quero entender como a Cactu Soluções pode organizar meus dados e criar dashboards para minha empresa.";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  link.setAttribute("href", WHATSAPP_LINK);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const header = document.querySelector(".site-header");
const backToTopButton = document.querySelector(".back-to-top");

const updateFloatingUi = () => {
  const isScrolled = window.scrollY > 12;

  if (header) {
    header.classList.toggle("is-scrolled", isScrolled);
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle("is-visible", window.scrollY > 520);
  }
};

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

updateFloatingUi();
window.addEventListener("scroll", updateFloatingUi, { passive: true });
