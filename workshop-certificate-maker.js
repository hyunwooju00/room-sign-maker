(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const inputs = ["kind", "paper", "recipient", "event", "issuer", "note", "date", "accent"];
  const cert = $("certificate");
  const viewport = $("preview-viewport");
  const printButton = $("print");
  const error = $("error");
  const status = $("status");

  function setFeedback(message, isError) {
    const shown = isError ? error : status;
    const hidden = isError ? status : error;
    hidden.hidden = true;
    if (hidden.textContent) hidden.textContent = "";
    if (shown.textContent !== message) shown.textContent = message;
    shown.hidden = false;
  }
  function clean(value) { return value.trim().replace(/\s+/g, " "); }
  function formatDate(value) {
    if (!value) return "—";
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return "—";
    return new Intl.DateTimeFormat("en-US", {month:"long",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(year,month-1,day)));
  }
  function fitOneLine(element, maxPt, minPt) {
    element.style.fontSize = `${maxPt}pt`;
    for (let size = maxPt; size >= minPt; size -= .5) {
      element.style.fontSize = `${size}pt`;
      if (element.scrollWidth <= element.clientWidth + 1) return true;
    }
    return element.scrollWidth <= element.clientWidth + 1;
  }
  function fitEvent(element) {
    const maxHeight = parseFloat(getComputedStyle(element).maxHeight);
    element.style.maxHeight = "none";
    element.style.overflow = "visible";
    for (let size = 19; size >= 13; size -= .5) {
      element.style.fontSize = `${size}pt`;
      if (element.offsetHeight <= maxHeight + 1 && element.scrollWidth <= element.clientWidth + 1) {
        element.style.maxHeight = "";
        element.style.overflow = "";
        return true;
      }
    }
    element.style.maxHeight = "";
    element.style.overflow = "";
    return false;
  }
  function scalePreview() {
    const width = cert.offsetWidth;
    const height = cert.offsetHeight;
    if (!width || !height) return;
    const scale = Math.min(1, Math.max(.1, (viewport.clientWidth - 20) / width));
    cert.style.transform = `translate(10px, 10px) scale(${scale})`;
    viewport.style.height = `${Math.ceil(height * scale) + 20}px`;
  }
  function checkLayout() {
    const problems = [];
    const nameFits = fitOneLine($("preview-recipient"), 38, 20);
    const eventFits = fitEvent($("preview-event"));
    const issuerFits = fitOneLine($("preview-issuer"), 12, 8);
    const frame = cert.querySelector(".certificate-frame");
    const bottom = cert.querySelector(".certificate-bottom");
    const bottomLimit = frame.clientHeight - parseFloat(getComputedStyle(frame).paddingBottom);
    if (!nameFits || $("preview-recipient").scrollHeight > $("preview-recipient").clientHeight + 1) problems.push("recipient");
    if (!eventFits) problems.push("event");
    if (!issuerFits) problems.push("issuer");
    if (bottom.offsetTop + bottom.offsetHeight > bottomLimit + 1) problems.push("note");
    return problems;
  }
  function contrastRatio(hex) {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const linear = rgb.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
    return 1.05 / (luminance + .05);
  }
  function update() {
    const data = Object.fromEntries(inputs.map(id => [id, $(id).value]));
    const required = ["recipient", "event", "issuer"].filter(key => !clean(data[key]));
    const appreciation = data.kind === "appreciation";
    cert.classList.toggle("a4", data.paper === "a4");
    cert.classList.toggle("letter", data.paper === "letter");
    cert.style.setProperty("--accent", data.accent);
    $("page-rule").textContent = `@page { size: ${data.paper === "letter" ? "letter" : "A4"} landscape; margin: 0; }`;
    $("paper-label").textContent = `${data.paper === "letter" ? "US Letter" : "A4"} · landscape`;
    $("preview-kind-small").textContent = appreciation ? "CERTIFICATE OF APPRECIATION" : "CERTIFICATE OF ATTENDANCE";
    $("preview-lead").textContent = appreciation ? "In grateful recognition of contributions to" : "For participating in";
    $("preview-recipient").textContent = clean(data.recipient) || "Recipient name";
    $("preview-event").textContent = clean(data.event) || "Your workshop or event";
    $("preview-issuer").textContent = clean(data.issuer) || "Your organization";
    $("preview-note").textContent = clean(data.note) || (appreciation ? "With sincere thanks for your time and care." : "A moment worth remembering.");
    $("preview-note").classList.toggle("is-placeholder", !clean(data.note));
    $("preview-date").textContent = formatDate(data.date);
    $("date-block").classList.toggle("is-placeholder", !data.date);
    scalePreview();
    const layoutProblems = checkLayout();
    const colorProblem = contrastRatio(data.accent) < 3;
    const ready = required.length === 0 && layoutProblems.length === 0 && !colorProblem;
    document.body.classList.toggle("print-blocked", !ready);
    printButton.setAttribute("aria-disabled", String(!ready));
    for (const key of ["recipient", "event", "issuer", "note", "accent"]) {
      $(key).setAttribute("aria-invalid", String(required.includes(key) || layoutProblems.includes(key) || (key === "accent" && colorProblem)));
    }
    const labels = {recipient:"recipient name", event:"workshop or event", issuer:"presenter", note:"short note"};
    if (layoutProblems.length) setFeedback(`Shorten the ${[...new Set(layoutProblems)].map(x => labels[x]).join(", ")} so it fits the page.`, true);
    else if (colorProblem) setFeedback("Choose a darker accent color so the text stays readable.", true);
    else if (required.length) setFeedback(`Enter ${required.map(x => labels[x]).join(", ")} to print.`, false);
    else setFeedback(`Ready: one ${data.paper === "letter" ? "US Letter" : "A4"} landscape certificate. Check every word before printing.`, false);
    return ready;
  }
  for (const id of inputs) $(id).addEventListener(id === "kind" || id === "paper" || id === "date" ? "change" : "input", update);
  $("sample").addEventListener("click", () => {
    $("kind").value = "attendance";
    $("paper").value = "a4";
    $("recipient").value = "Jordan Lee";
    $("event").value = "Community Data Workshop";
    $("issuer").value = "Harbor Learning Lab";
    $("note").value = "For completing the hands-on data session";
    $("date").value = "2026-11-07";
    $("accent").value = "#8c4c32";
    update();
    $("recipient").focus();
  });
  $("next-recipient").addEventListener("click", () => { $("recipient").value = ""; update(); $("recipient").focus(); });
  printButton.addEventListener("click", () => {
    if (!update()) { (document.querySelector('[aria-invalid="true"]') || $("recipient")).focus(); return; }
    window.print();
  });
  window.addEventListener("beforeprint", update);
  window.addEventListener("resize", scalePreview);
  if ("ResizeObserver" in window) new ResizeObserver(scalePreview).observe(viewport);
  update();
})();
