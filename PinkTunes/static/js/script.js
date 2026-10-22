document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  document.querySelectorAll("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const message = form.getAttribute("data-confirm") || "Tem certeza?";
      if (!window.confirm(message)) event.preventDefault();
    });
  });

  // Busca rápida: envia o formulário ao pressionar Enter.
  document.querySelectorAll(".searchbar input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") input.value = "";
    });
  });
});
