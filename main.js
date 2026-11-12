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
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".service-card, .process-step, .capability-card, .care-card, .values-grid article, .audience-card, .faq-list details, .check-scope-card, .check-output-card").forEach((el) => {
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


/* Conversion tools + accessibility */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav-links");
  if (nav && !nav.querySelector('a[href="/projekte/"]')) {
    const solutions = nav.querySelector('a[href="/#services"]');
    const projectsLink = document.createElement("a");
    projectsLink.href = "/projekte/";
    projectsLink.textContent = "Projekte";
    if (solutions) solutions.insertAdjacentElement("afterend", projectsLink);
    else nav.prepend(projectsLink);
  }

  const footerColumns = [...document.querySelectorAll(".footer-column")];
  const novaDevFooter = footerColumns.find((column) => column.querySelector("strong")?.textContent.trim() === "NovaDev");

  if (novaDevFooter) {
    let instagramLink = novaDevFooter.querySelector('a[href*="instagram.com"]');
    if (!instagramLink) {
      instagramLink = document.createElement("a");
      instagramLink.href = "https://instagram.com/novadev_webdev";
      instagramLink.target = "_blank";
      instagramLink.rel = "noopener noreferrer";
      novaDevFooter.appendChild(instagramLink);
    }
    instagramLink.classList.add("footer-social-link", "footer-instagram");
    instagramLink.setAttribute("aria-label", "NovaDev Studio auf Instagram öffnen");
    instagramLink.innerHTML = '<span class="footer-social-icon instagram-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="5" y="5" width="14" height="14" rx="4"></rect><circle cx="12" cy="12" r="3.2"></circle><circle class="instagram-dot" cx="16.8" cy="7.2" r="1"></circle></svg></span><span>Instagram</span><span class="footer-social-arrow" aria-hidden="true">↗</span>';

    let fiverrLink = novaDevFooter.querySelector(".footer-fiverr");
    if (!fiverrLink) {
      fiverrLink = document.createElement("a");
      fiverrLink.href = "https://www.fiverr.com/pe/Webmdbd";
      fiverrLink.target = "_blank";
      fiverrLink.rel = "noopener noreferrer";
      novaDevFooter.appendChild(fiverrLink);
    }
    fiverrLink.className = "footer-social-link footer-fiverr";
    fiverrLink.setAttribute("aria-label", "NovaDev Studio auf Fiverr öffnen");
    fiverrLink.innerHTML = '<span class="footer-social-icon fiverr-icon" aria-hidden="true"><span>fi</span></span><span>Fiverr</span><span class="footer-social-arrow" aria-hidden="true">↗</span>';
  }

  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main-content";

  if (!document.querySelector(".skip-link")) {
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "Zum Inhalt springen";
    document.body.prepend(skip);
  }

  document.querySelectorAll(".nav-links a").forEach((link) => {
    try {
      const linkPath = new URL(link.href, location.origin).pathname.replace(/\/$/, "") || "/";
      const currentPath = location.pathname.replace(/\/$/, "") || "/";
      if (linkPath === currentPath) link.setAttribute("aria-current", "page");
    } catch (_) {}
  });

  document.querySelectorAll("img:not([fetchpriority='high'])").forEach((img) => {
    if (!img.hasAttribute("loading")) img.loading = "lazy";
    if (!img.hasAttribute("decoding")) img.decoding = "async";
  });

  const pathname = location.pathname;
  const hideSticky = ["/kontakt/","/anfrage/","/termin/"].some((p) => pathname.startsWith(p));
  if (!hideSticky && !document.querySelector(".mobile-sticky-cta")) {
    const sticky = document.createElement("nav");
    sticky.className = "mobile-sticky-cta";
    sticky.setAttribute("aria-label", "Schnellaktionen");
    sticky.innerHTML = '<a href="/anfrage/">Anfrage starten</a><a href="/termin/">Termin</a>';
    document.body.appendChild(sticky);
  }

  const asyncForms = document.querySelectorAll("form[data-ajax-form]");
  asyncForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector(".form-status");
      const original = button?.innerHTML || "Senden";
      if (button) { button.disabled = true; button.textContent = "Wird gesendet..."; }
      if (status) { status.textContent = ""; status.dataset.state = ""; }
      try {
        const response = await fetch(form.action, {
          method:"POST",
          body:new FormData(form),
          headers:{Accept:"application/json"}
        });
        if (!response.ok) throw new Error("submit");
        window.location.href="/success/";
      } catch (_) {
        if (status) {
          status.textContent="Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut oder schreibe an contact@novadev-studio.at.";
          status.dataset.state="error";
        }
      } finally {
        if (button) { button.disabled=false; button.innerHTML=original; }
      }
    });
  });

  const wizard = document.querySelector("[data-configurator]");
  if (wizard) {
    const steps=[...wizard.querySelectorAll(".wizard-step")];
    const bars=[...wizard.querySelectorAll(".wizard-progress span")];
    const summary=wizard.querySelector('input[name="konfiguration"]');
    let current=0;
    const show=(index, shouldScroll=true)=>{
      current=Math.max(0,Math.min(index,steps.length-1));
      steps.forEach((step,i)=>step.hidden=i!==current);
      bars.forEach((bar,i)=>bar.classList.toggle("active",i<=current));
      wizard.dataset.step=String(current+1);
      if (shouldScroll) {
        steps[current].querySelector("input,select,textarea")?.focus({preventScroll:true});
        wizard.scrollIntoView({behavior:"smooth",block:"start"});
      }
    };
    wizard.addEventListener("click",(event)=>{
      const next=event.target.closest("[data-next]");
      const prev=event.target.closest("[data-prev]");
      if(next){
        const required=[...steps[current].querySelectorAll("input[required],select[required],textarea[required]")];
        if(required.some((el)=>!el.checkValidity())) { required.find((el)=>!el.checkValidity())?.reportValidity(); return; }
        show(current+1);
      }
      if(prev) show(current-1);
    });
    wizard.addEventListener("change",()=>{
      if(summary){
        const data=new FormData(wizard);
        const parts=[];
        for(const [key,value] of data.entries()){
          if(["konfiguration","_subject"].includes(key) || !value) continue;
          parts.push(`${key}: ${value}`);
        }
        summary.value=parts.join(" | ");
      }
    });
    show(0,false);
  }

  const bookingDate=document.getElementById("booking-date");
  const bookingTime=document.getElementById("booking-time");
  const bookingType=document.getElementById("booking-type");
  const bookingTimeLabel=document.getElementById("booking-time-label");
  const bookingTimeNote=document.getElementById("booking-time-note");
  const bookingTypeNote=document.getElementById("booking-type-note");
  const bookingRuleStatus=document.getElementById("booking-rule-status");

  if(bookingDate){
    const now=new Date();
    const localDate=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    if(!bookingDate.min) bookingDate.min=localDate;

    const setOptions=(select,options,placeholder)=>{
      if(!select) return;
      select.innerHTML="";
      const empty=document.createElement("option");
      empty.value="";
      empty.textContent=placeholder;
      select.appendChild(empty);
      options.forEach(({value,label})=>{
        const option=document.createElement("option");
        option.value=value;
        option.textContent=label;
        select.appendChild(option);
      });
      select.disabled=false;
      select.value="";
    };

    const resetBooking=(message)=>{
      if(bookingTime){
        bookingTime.innerHTML='<option value="">Bitte zuerst Datum auswählen</option>';
        bookingTime.disabled=true;
      }
      if(bookingType){
        bookingType.innerHTML='<option value="">Bitte zuerst Datum auswählen</option>';
        bookingType.disabled=true;
      }
      if(bookingRuleStatus){
        bookingRuleStatus.classList.toggle("is-error",Boolean(message));
        if(message){
          bookingRuleStatus.innerHTML='<span>HINWEIS</span><strong>'+message+'</strong>';
        }else{
          bookingRuleStatus.innerHTML='<span>MO–DO</span><strong>16:00–19:00 · Telefon oder Online</strong><span>FR</span><strong>Flexible Zeitfenster · Vor Ort nach Absprache möglich</strong>';
        }
      }
    };

    const updateAvailability=()=>{
      const value=bookingDate.value;
      bookingDate.setCustomValidity("");
      if(!value){ resetBooking(""); return; }

      const [year,month,day]=value.split("-").map(Number);
      const selected=new Date(year,month-1,day);
      const weekday=selected.getDay();

      if(weekday===0 || weekday===6){
        bookingDate.setCustomValidity("Termine sind nur Montag bis Freitag möglich.");
        bookingDate.reportValidity();
        resetBooking("Am Samstag und Sonntag sind derzeit keine Termine verfügbar. Bitte wähle Montag bis Freitag.");
        return;
      }

      if(weekday>=1 && weekday<=4){
        setOptions(bookingTime,[
          {value:"16:00–17:00",label:"16:00–17:00"},
          {value:"17:00–18:00",label:"17:00–18:00"},
          {value:"18:00–19:00",label:"18:00–19:00"}
        ],"Zeit zwischen 16:00 und 19:00 wählen");
        setOptions(bookingType,[
          {value:"Telefon",label:"Telefon"},
          {value:"Online / Videocall",label:"Online / Videocall"}
        ],"Telefon oder Online auswählen");
        if(bookingTimeLabel) bookingTimeLabel.textContent="Verfügbare Zeit (Mo–Do 16:00–19:00) *";
        if(bookingTimeNote) bookingTimeNote.textContent="Montag bis Donnerstag sind ausschließlich Termine zwischen 16:00 und 19:00 Uhr verfügbar.";
        if(bookingTypeNote) bookingTypeNote.textContent="Montag bis Donnerstag sind nur Telefon- oder Online-Termine möglich.";
        if(bookingRuleStatus){
          bookingRuleStatus.classList.remove("is-error");
          bookingRuleStatus.innerHTML='<span>GEWÄHLT</span><strong>Mo–Do · 16:00–19:00 · Telefon oder Online</strong>';
        }
        return;
      }

      setOptions(bookingTime,[
        {value:"08:00–10:00",label:"08:00–10:00"},
        {value:"10:00–12:00",label:"10:00–12:00"},
        {value:"12:00–14:00",label:"12:00–14:00"},
        {value:"14:00–16:00",label:"14:00–16:00"},
        {value:"16:00–18:00",label:"16:00–18:00"},
        {value:"Anderer Zeitraum",label:"Anderer Zeitraum"}
      ],"Zeitfenster auswählen");
      setOptions(bookingType,[
        {value:"Telefon",label:"Telefon"},
        {value:"Online / Videocall",label:"Online / Videocall"},
        {value:"Vor Ort nach Absprache",label:"Vor Ort nach Absprache"}
      ],"Gesprächsart auswählen");
      if(bookingTimeLabel) bookingTimeLabel.textContent="Bevorzugtes Zeitfenster (Freitag) *";
      if(bookingTimeNote) bookingTimeNote.textContent="Am Freitag stehen die bisherigen flexiblen Zeitfenster zur Verfügung.";
      if(bookingTypeNote) bookingTypeNote.textContent="Freitag ist zusätzlich ein Vor-Ort-Termin nach Absprache möglich.";
      if(bookingRuleStatus){
        bookingRuleStatus.classList.remove("is-error");
        bookingRuleStatus.innerHTML='<span>GEWÄHLT</span><strong>Freitag · flexible Zeitfenster · Vor Ort nach Absprache möglich</strong>';
      }
    };

    bookingDate.addEventListener("change",updateAvailability);
    updateAvailability();
  }

  const calculator=document.querySelector("[data-price-calculator]");
  if(calculator){
    const result=calculator.querySelector("[data-price-result]");
    const monthly=calculator.querySelector("[data-monthly-result]");
    const update=()=>{
      const type=calculator.querySelector("[name='siteType']")?.value || "business";
      const pages=Math.max(0,Number(calculator.querySelector("[name='extraPages']")?.value || 0));
      const base={landing:599,business:999,custom:1499}[type] || 999;
      let total=base + pages*120;
      calculator.querySelectorAll("[data-addon]:checked").forEach((el)=> total+=Number(el.dataset.addon||0));
      let monthlyValue=0;
      const care=calculator.querySelector("[name='care']")?.value || "none";
      if(care==="web") monthlyValue=39;
      if(care==="business") monthlyValue=99;
      if(result) result.textContent=`ab ${new Intl.NumberFormat("de-AT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(total)}`;
      if(monthly) monthly.textContent=monthlyValue ? `zzgl. ab ${monthlyValue} € / Monat` : "keine laufende Betreuung ausgewählt";
    };
    calculator.addEventListener("input",update);
    calculator.addEventListener("change",update);
    update();
  }
});
