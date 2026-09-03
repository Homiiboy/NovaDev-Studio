document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      burger.classList.toggle("active", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        burger.classList.remove("active");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  const serviceSelect = document.getElementById("service");
  if (serviceSelect) {
    const params = new URLSearchParams(window.location.search);
    const requested = (params.get("service") || "").toLowerCase();
    const map = {
      "digital-check": "Digital Check",
      "web-care": "Web Care",
      "business-care": "Business Care",
      "it-care": "IT Care"
    };
    if (map[requested]) serviceSelect.value = map[requested];
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton?.innerHTML || "Anfrage senden";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Wird gesendet...";
      }

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" }
        });
        if (response.ok) {
          window.location.href = "/success/";
        } else {
          alert("Die Anfrage konnte leider nicht gesendet werden. Bitte versuche es erneut oder schreibe direkt an contact@novadev-studio.at.");
        }
      } catch (_) {
        alert("Es ist ein Verbindungsfehler aufgetreten. Bitte versuche es erneut oder schreibe direkt an contact@novadev-studio.at.");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("reveal-visible");
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".service-card, .process-step, .capability-card, .care-card, .values-grid article").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
});
