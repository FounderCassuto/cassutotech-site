(function () {
  "use strict";

  const contact = {
    phoneDisplay: "618-816-5274",
    phoneE164: "+16188165274",
    email: "founder.cassutotech@gmail.com"
  };

  const quickTextMessage = "Hi Preston, I found CassutoTech online and need help with a tech problem.";
  const categories = [
    {
      id: "windows",
      code: "PC-01",
      label: "Windows PC or laptop",
      description: "Setup, slow performance, software, updates, and everyday Windows problems.",
      problems: ["It is running slowly", "It will not start correctly", "A program or account is not working", "I need help setting it up"]
    },
    {
      id: "network",
      code: "NET-02",
      label: "Printer or Wi-Fi",
      description: "Printer setup, connection problems, and help with home Wi-Fi.",
      problems: ["The printer will not print", "Wi-Fi is slow or disconnecting", "A device will not connect", "I need help with a new setup"]
    },
    {
      id: "gaming",
      code: "GAME-03",
      label: "Gaming PC or console",
      description: "Setup, performance problems, connections, controllers, and accessories.",
      problems: ["Games are slow or crashing", "The system will not start", "A controller or accessory is not working", "I need setup or upgrade advice"]
    },
    {
      id: "smart-home",
      code: "HOME-04",
      label: "Smart-home device",
      description: "Setup and basic troubleshooting for smart home devices and their apps.",
      problems: ["The device will not connect", "The app or account is not working", "I need help with a new device", "My devices stopped responding"]
    }
  ];
  const usabilityOptions = [
    "It still works, but the problem is annoying",
    "It is barely usable",
    "It is not working at all",
    "I am not sure"
  ];

  const diagnostic = {
    step: 1,
    categoryId: "",
    problem: "",
    usability: "",
    name: "",
    town: "",
    details: ""
  };

  const stage = document.getElementById("diagnostic-stage");
  const stepLabel = document.getElementById("diagnostic-step");
  const diagnosticSection = document.getElementById("help");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function createDeviceTextHref(message) {
    const encodedMessage = encodeURIComponent(message);
    const userAgent = navigator.userAgent;
    const modernIPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

    if (/Android/i.test(userAgent)) {
      return `smsto:${contact.phoneE164}?body=${encodedMessage}`;
    }
    if (/iPhone|iPad|iPod/i.test(userAgent) || modernIPad) {
      return `sms:${contact.phoneE164}&body=${encodedMessage}`;
    }
    return `sms:${contact.phoneE164}?body=${encodedMessage}`;
  }

  function bindTextAction(link, getMessage) {
    const prepare = function () {
      link.href = createDeviceTextHref(getMessage());
    };
    link.addEventListener("pointerdown", prepare);
    link.addEventListener("click", prepare);
  }

  function copyText(value, button, successText, normalText) {
    const showSuccess = function () {
      button.textContent = successText;
      window.setTimeout(function () { button.textContent = normalText; }, 2200);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(showSuccess).catch(function () { fallbackCopy(value, showSuccess); });
    } else {
      fallbackCopy(value, showSuccess);
    }
  }

  function fallbackCopy(value, done) {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
    done();
  }

  function selectedCategory() {
    return categories.find(function (item) { return item.id === diagnostic.categoryId; });
  }

  function preparedDiagnosticMessage() {
    const category = selectedCategory();
    const extra = diagnostic.details.trim() ? ` Here are a few more details: ${diagnostic.details.trim()}` : "";
    return `Hi Preston, my name is ${diagnostic.name.trim() || "[name]"}, and I'm in ${diagnostic.town.trim() || "[town or ZIP code]"}. I need help with this: ${category ? category.label : "Home technology"}. The main problem is: ${diagnostic.problem || "[problem]"}. Right now: ${diagnostic.usability || "[current condition]"}.${extra}`;
  }

  function moveDiagnostic(nextStep) {
    diagnostic.step = nextStep;
    renderDiagnostic();
    window.setTimeout(function () {
      diagnosticSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 20);
  }

  function answerButtons(items, includeDescription, codePrefix) {
    return items.map(function (item, index) {
      if (typeof item === "string") {
        return `<button type="button" data-answer="${escapeHtml(item)}"><small>${escapeHtml(codePrefix)}-${index + 1}</small><strong>${escapeHtml(item)}</strong><b aria-hidden="true">Choose →</b></button>`;
      }
      const description = includeDescription ? `<span>${escapeHtml(item.description)}</span>` : "";
      return `<button type="button" data-answer="${escapeHtml(item.id)}"><small>${escapeHtml(item.code)}</small><strong>${escapeHtml(item.label)}</strong>${description}<b aria-hidden="true">Start →</b></button>`;
    }).join("");
  }

  function renderDiagnostic() {
    stepLabel.textContent = diagnostic.step <= 4 ? `${diagnostic.step} of 4` : "Ready";
    const category = selectedCategory();

    if (diagnostic.step === 1) {
      stage.innerHTML = `<div class="question-panel service-routing"><div class="route-heading"><h3>What needs help?</h3><p>Choose one line to start.</p></div><div class="answer-list route-list">${answerButtons(categories, true, "01")}</div></div>`;
      stage.querySelectorAll("[data-answer]").forEach(function (button) {
        button.addEventListener("click", function () {
          diagnostic.categoryId = button.dataset.answer;
          diagnostic.problem = "";
          diagnostic.usability = "";
          moveDiagnostic(2);
        });
      });
      return;
    }

    if (diagnostic.step === 2 && category) {
      stage.innerHTML = `<div class="question-panel"><button class="back-button" type="button" data-back>Back</button><p class="current-answer">You chose: <strong>${escapeHtml(category.label)}</strong></p><h3>Which description is closest?</h3><div class="answer-list compact">${answerButtons(category.problems, false, "02")}</div></div>`;
      stage.querySelector("[data-back]").addEventListener("click", function () { moveDiagnostic(1); });
      stage.querySelectorAll("[data-answer]").forEach(function (button) {
        button.addEventListener("click", function () {
          diagnostic.problem = button.dataset.answer;
          diagnostic.usability = "";
          moveDiagnostic(3);
        });
      });
      return;
    }

    if (diagnostic.step === 3) {
      stage.innerHTML = `<div class="question-panel"><button class="back-button" type="button" data-back>Back</button><p class="current-answer">Closest problem: <strong>${escapeHtml(diagnostic.problem)}</strong></p><h3>How usable is it right now?</h3><div class="answer-list compact">${answerButtons(usabilityOptions, false, "03")}</div></div>`;
      stage.querySelector("[data-back]").addEventListener("click", function () { moveDiagnostic(2); });
      stage.querySelectorAll("[data-answer]").forEach(function (button) {
        button.addEventListener("click", function () {
          diagnostic.usability = button.dataset.answer;
          moveDiagnostic(4);
        });
      });
      return;
    }

    if (diagnostic.step === 4) {
      stage.innerHTML = `<form class="question-panel details-form" id="diagnostic-details"><button class="back-button" type="button" data-back>Back</button><h3>Who should Preston reply to?</h3><div class="form-grid"><label><span>Your first name</span><input required name="name" autocomplete="given-name" value="${escapeHtml(diagnostic.name)}"></label><label><span>Your town or ZIP code</span><input required name="town" autocomplete="postal-code" value="${escapeHtml(diagnostic.town)}"></label></div><label><span>Anything else Preston should know? <small>Optional</small></span><textarea name="details" rows="4">${escapeHtml(diagnostic.details)}</textarea></label><button class="primary-action" type="submit">Review my prepared text</button></form>`;
      stage.querySelector("[data-back]").addEventListener("click", function () { moveDiagnostic(3); });
      stage.querySelector("#diagnostic-details").addEventListener("submit", function (event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        diagnostic.name = String(data.get("name") || "");
        diagnostic.town = String(data.get("town") || "");
        diagnostic.details = String(data.get("details") || "");
        moveDiagnostic(5);
      });
      return;
    }

    const message = preparedDiagnosticMessage();
    stage.innerHTML = `<div class="question-panel result-panel"><p class="result-label">Your message is ready</p><h3>Review it before sending.</h3><blockquote id="diagnostic-message"></blockquote><div class="result-actions"><a class="primary-action" href="sms:${contact.phoneE164}" id="open-diagnostic-text">Open my text message</a><button type="button" id="use-diagnostic-booking">Request a day</button><button type="button" id="copy-diagnostic">Copy message</button><button type="button" id="restart-diagnostic">Start over</button></div></div>`;
    stage.querySelector("#diagnostic-message").textContent = message;
    bindTextAction(stage.querySelector("#open-diagnostic-text"), function () { return message; });
    stage.querySelector("#use-diagnostic-booking").addEventListener("click", carryDiagnosticToBooking);
    stage.querySelector("#copy-diagnostic").addEventListener("click", function (event) { copyText(message, event.currentTarget, "Copied", "Copy message"); });
    stage.querySelector("#restart-diagnostic").addEventListener("click", function () {
      Object.assign(diagnostic, { step: 1, categoryId: "", problem: "", usability: "", name: "", town: "", details: "" });
      moveDiagnostic(1);
    });
  }

  function displayDate(value) {
    if (!value) return "[preferred day]";
    const parts = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function bookingMessageFrom(data) {
    const secondChoice = data.backupDate ? ` My backup choice is ${displayDate(data.backupDate)}.` : "";
    const extra = data.details.trim() ? ` The problem is: ${data.details.trim()}` : "";
    return `Hi Preston, I'd like to request a CassutoTech service day. My name is ${data.name.trim() || "[name]"}, and I'm in ${data.town.trim() || "[town or ZIP code]"}. I need help with ${data.service || "[type of technology]"}. My preferred day is ${displayDate(data.preferredDate)}.${secondChoice} ${data.timePreference || "[time preference]"} works best. I prefer ${data.support || "[remote or local service]"}.${extra} I understand this is a request and is not confirmed until you reply.`;
  }

  const bookingForm = document.getElementById("booking-form");
  const bookingResult = document.getElementById("booking-result");
  let currentBookingMessage = "";

  function carryDiagnosticToBooking() {
    const category = selectedCategory();
    bookingForm.elements.name.value = diagnostic.name;
    bookingForm.elements.town.value = diagnostic.town;
    bookingForm.elements.service.value = category ? category.label : "";
    bookingForm.elements.details.value = [diagnostic.problem, diagnostic.usability, diagnostic.details.trim()].filter(Boolean).join(". ");
    bookingResult.hidden = true;
    bookingForm.hidden = false;
    document.getElementById("booking").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(bookingForm).entries());
    currentBookingMessage = bookingMessageFrom(values);
    document.getElementById("booking-message").textContent = currentBookingMessage;
    bookingForm.hidden = true;
    bookingResult.hidden = false;
    const openText = document.getElementById("open-booking-text");
    openText.replaceWith(openText.cloneNode(true));
    bindTextAction(document.getElementById("open-booking-text"), function () { return currentBookingMessage; });
  });

  document.getElementById("copy-booking").addEventListener("click", function (event) {
    copyText(currentBookingMessage, event.currentTarget, "Copied", "Copy request");
  });
  document.getElementById("edit-booking").addEventListener("click", function () {
    bookingResult.hidden = true;
    bookingForm.hidden = false;
  });

  document.querySelectorAll("[data-quick-text]").forEach(function (link) {
    bindTextAction(link, function () { return quickTextMessage; });
  });

  document.querySelectorAll("[data-copy-email]").forEach(function (button) {
    button.addEventListener("click", function () {
      const originalText = button.querySelector("[data-email-label]") ? null : "Copy email";
      if (button.querySelector("[data-email-label]")) {
        const label = button.querySelector("[data-email-label]");
        copyText(contact.email, label, "Email copied", contact.email);
      } else {
        copyText(contact.email, button, "Copied", originalText);
      }
    });
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minimumDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  document.querySelectorAll("[data-booking-date]").forEach(function (field) { field.min = minimumDate; });
  document.getElementById("year").textContent = new Date().getFullYear();
  renderDiagnostic();
}());
