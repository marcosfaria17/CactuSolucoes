// ===============================
// HEADER + ANIMAÇÕES (mantido)
// ===============================
(() => {
  const header = document.querySelector(".site-header");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("visible");
    });
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px"
    });

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });
  }
})();


// ===============================
// WHATSAPP CENTRALIZADO + TRACKING
// ===============================

const WHATSAPP_NUMBER = "5562981306841";

const WHATSAPP_MESSAGE =
  "Olá, acessei o site da Cactu e gostaria de entender como posso estruturar melhor os dados do meu negócio.";

const WHATSAPP_LABELS = {
  hero_cta: "Hero - Quero analisar meu negócio",
  cta_final: "CTA final - Falar agora no WhatsApp",
  whatsapp_float: "Botão flutuante - WhatsApp"
};

function buildWhatsappUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

function trackWhatsappClick(label, url) {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "whatsapp_click", {
    event_category: "engagement",
    event_label: WHATSAPP_LABELS[label] || label || "WhatsApp",
    whatsapp_button: label || "whatsapp",
    link_url: url
  });
}

function openWhatsapp(label) {
  const url = buildWhatsappUrl();
  trackWhatsappClick(label, url);
  window.open(url, "_blank", "noopener,noreferrer");
}

// Aplica em todos os botões de WhatsApp.
// O href também é preenchido como fallback caso o JavaScript falhe em algum navegador.
document.querySelectorAll("[data-whatsapp-link]").forEach((el) => {
  const url = buildWhatsappUrl();
  const label = el.dataset.whatsappLabel || "whatsapp";

  el.setAttribute("href", url);
  el.setAttribute("target", "_blank");
  el.setAttribute("rel", "noopener noreferrer");

  el.addEventListener("click", (event) => {
    event.preventDefault();
    openWhatsapp(label);
  });
});
