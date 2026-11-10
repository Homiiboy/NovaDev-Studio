(() => {
  if (!document.querySelector('link[href="/palette.css"]')) {
    const palette = document.createElement("link");
    palette.rel = "stylesheet";
    palette.href = "/palette.css";
    document.head.appendChild(palette);
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".brand-mark").forEach((mark) => {
    const img = document.createElement("img");
    img.className = "brand-logo-mark";
    img.src = "/assets/novadev-mark.webp";
    img.alt = "";
    img.width = 42;
    img.height = 42;
    mark.replaceWith(img);
  });

  const founderMark = document.querySelector(".founder-mark");
  if (founderMark && !founderMark.querySelector("img")) {
    founderMark.innerHTML = '<img src="/assets/novadev-mark.webp" alt="NovaDev N Logo" width="115" height="115">';
  }

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


/* NovaDev consent manager */
(() => {
  const CONSENT_KEY = "novadevConsentV1";
  const CONSENT_VERSION = "1.0";
  const CONSENT_LIFETIME_DAYS = 180;

  const readConsent = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
      if (!value || value.version !== CONSENT_VERSION) return null;
      if (!value.expiresAt || Date.now() > value.expiresAt) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return value;
    } catch (_) {
      return null;
    }
  };

  const activateConsentResources = (category) => {
    document.querySelectorAll(`script[type="text/plain"][data-consent="${category}"]`).forEach((placeholder) => {
      if (placeholder.dataset.activated === "true") return;

      const script = document.createElement("script");
      for (const attr of placeholder.attributes) {
        if (["type", "data-consent", "data-src", "data-activated"].includes(attr.name)) continue;
        script.setAttribute(attr.name, attr.value);
      }

      const deferredSrc = placeholder.getAttribute("data-src");
      if (deferredSrc) script.src = deferredSrc;
      if (placeholder.textContent.trim()) script.textContent = placeholder.textContent;

      placeholder.dataset.activated = "true";
      placeholder.after(script);
    });

    document.querySelectorAll(`[data-consent="${category}"][data-consent-src]`).forEach((element) => {
      if (element.dataset.activated === "true") return;
      element.setAttribute("src", element.getAttribute("data-consent-src"));
      element.dataset.activated = "true";
    });
  };

  const applyConsent = (consent) => {
    document.documentElement.dataset.consentAnalytics = String(Boolean(consent?.analytics));
    document.documentElement.dataset.consentMarketing = String(Boolean(consent?.marketing));

    if (consent?.analytics) activateConsentResources("analytics");
    if (consent?.marketing) activateConsentResources("marketing");

    window.dispatchEvent(new CustomEvent("novadevConsentChanged", { detail: consent }));
  };

  const saveConsent = (preferences) => {
    const now = Date.now();
    const consent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      savedAt: now,
      expiresAt: now + CONSENT_LIFETIME_DAYS * 24 * 60 * 60 * 1000
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (_) {}

    applyConsent(consent);
    return consent;
  };

  const initConsentManager = () => {
    if (document.getElementById("novadev-cookie-banner")) return;

    const banner = document.createElement("section");
    banner.id = "novadev-cookie-banner";
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Datenschutz-Einstellungen");
    banner.innerHTML = `
      <div class="cookie-banner__inner">
        <div class="cookie-banner__copy">
          <span class="cookie-kicker">Datenschutz & Cookies</span>
          <h2>Deine Privatsphäre. Deine Entscheidung.</h2>
          <p>Wir verwenden technisch notwendige Speicherungen für den Betrieb dieser Website. Optionale Analyse- und Marketingdienste werden nur nach deiner Zustimmung aktiviert.</p>
          <a href="/datenschutz/">Mehr zum Datenschutz</a>
        </div>
        <div class="cookie-banner__actions">
          <button class="cookie-btn cookie-btn--ghost" type="button" data-cookie-action="necessary">Nur notwendige</button>
          <button class="cookie-btn cookie-btn--secondary" type="button" data-cookie-action="settings">Einstellungen</button>
          <button class="cookie-btn cookie-btn--primary" type="button" data-cookie-action="accept-all">Alle akzeptieren</button>
        </div>
      </div>
    `;

    const modal = document.createElement("div");
    modal.id = "novadev-consent-modal";
    modal.className = "consent-modal-backdrop";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="consent-modal" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div class="consent-modal__head">
          <div>
            <span class="cookie-kicker">Cookie-Einstellungen</span>
            <h2 id="consent-title">Datenschutz-Einstellungen</h2>
          </div>
          <button type="button" class="consent-close" data-cookie-action="close-settings" aria-label="Einstellungen schließen">×</button>
        </div>

        <p class="consent-modal__intro">Du entscheidest, welche optionalen Dienste verwendet werden dürfen. Notwendige Funktionen sind immer aktiv.</p>

        <div class="consent-option">
          <div>
            <strong>Notwendig</strong>
            <p>Speichert unter anderem deine Datenschutz-Auswahl und ermöglicht grundlegende Website-Funktionen.</p>
          </div>
          <label class="consent-switch consent-switch--locked">
            <input type="checkbox" checked disabled>
            <span></span>
          </label>
        </div>

        <div class="consent-option">
          <div>
            <strong>Analyse</strong>
            <p>Erlaubt zukünftig anonyme bzw. pseudonyme Reichweiten- und Nutzungsanalysen, sofern solche Dienste eingebunden werden.</p>
          </div>
          <label class="consent-switch">
            <input id="consent-analytics" type="checkbox">
            <span></span>
          </label>
        </div>

        <div class="consent-option">
          <div>
            <strong>Marketing</strong>
            <p>Erlaubt zukünftig Marketing- und Conversion-Dienste, sofern solche Dienste eingebunden werden.</p>
          </div>
          <label class="consent-switch">
            <input id="consent-marketing" type="checkbox">
            <span></span>
          </label>
        </div>

        <div class="consent-modal__footer">
          <a href="/datenschutz/">Datenschutzerklärung</a>
          <button class="cookie-btn cookie-btn--primary" type="button" data-cookie-action="save-settings">Auswahl speichern</button>
        </div>
      </div>
    `;

    document.body.append(banner, modal);

    const footerBottom = document.querySelector(".footer-bottom");
    if (footerBottom && !document.getElementById("cookie-settings-link")) {
      const settingsButton = document.createElement("button");
      settingsButton.id = "cookie-settings-link";
      settingsButton.className = "cookie-settings-link";
      settingsButton.type = "button";
      settingsButton.textContent = "Cookie-Einstellungen";
      settingsButton.addEventListener("click", () => openSettings());
      footerBottom.appendChild(settingsButton);
    }

    const analyticsInput = modal.querySelector("#consent-analytics");
    const marketingInput = modal.querySelector("#consent-marketing");

    const closeSettings = () => {
      modal.hidden = true;
      document.body.classList.remove("consent-modal-open");
    };

    const openSettings = () => {
      const consent = readConsent();
      analyticsInput.checked = Boolean(consent?.analytics);
      marketingInput.checked = Boolean(consent?.marketing);
      modal.hidden = false;
      document.body.classList.add("consent-modal-open");
      modal.querySelector(".consent-close")?.focus();
    };

    const finish = (preferences) => {
      saveConsent(preferences);
      banner.hidden = true;
      closeSettings();
    };

    banner.addEventListener("click", (event) => {
      const action = event.target.closest("[data-cookie-action]")?.dataset.cookieAction;
      if (action === "necessary") finish({ analytics: false, marketing: false });
      if (action === "accept-all") finish({ analytics: true, marketing: true });
      if (action === "settings") openSettings();
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeSettings();
        return;
      }

      const action = event.target.closest("[data-cookie-action]")?.dataset.cookieAction;
      if (action === "close-settings") closeSettings();
      if (action === "save-settings") {
        finish({
          analytics: analyticsInput.checked,
          marketing: marketingInput.checked
        });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeSettings();
    });

    const consent = readConsent();
    if (consent) {
      banner.hidden = true;
      applyConsent(consent);
    } else {
      banner.hidden = false;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initConsentManager);
  } else {
    initConsentManager();
  }
})();
