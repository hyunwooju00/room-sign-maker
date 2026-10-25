(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const csv = $('csv-input'), file = $('csv-file'), paper = $('paper');
  const printButton = $('print'), error = $('error'), status = $('status');
  let ready = false;

  function notice(target, message) { target.textContent = message; target.hidden = !message; }
  function invalidate() {
    ready = false; printButton.disabled = true;
    csv.removeAttribute('aria-invalid'); notice(error, '');
    notice(status, 'Changes are pending. Build badges again before printing.');
  }
  function fitText(element, minPt, container) {
    let px = parseFloat(getComputedStyle(element).fontSize);
    const floor = minPt * 4 / 3;
    while ((element.scrollHeight > element.clientHeight + 1 ||
      (container && container.scrollHeight > container.clientHeight + 1)) && px > floor) {
      px = Math.max(floor, px - 1);
      element.style.fontSize = `${px}px`;
    }
    return element.scrollHeight <= element.clientHeight + 1 &&
      (!container || container.scrollHeight <= container.clientHeight + 1);
  }
  function checkFit() {
    const failures = [];
    document.querySelectorAll('.badge').forEach((card, index) => {
      const fields = [
        [card.querySelector('.badge-event'), 7],
        [card.querySelector('.badge-name'), 12, card.querySelector('.badge-main')],
        [card.querySelector('.badge-org'), 8],
        [card.querySelector('.badge-role'), 7]
      ];
      if (fields.some(([element, floor, container]) => !fitText(element, floor, container))) failures.push(index + 1);
    });
    if (failures.length) throw new Error(`Text does not fit on badge${failures.length === 1 ? '' : 's'} ${failures.slice(0, 8).join(', ')}${failures.length > 8 ? '…' : ''}. Shorten those entries.`);
  }
  function badge(person, eventName) {
    const card = document.createElement('article'); card.className = 'badge';
    const top = document.createElement('div'); top.className = 'badge-top';
    const event = document.createElement('span'); event.className = 'badge-event'; event.textContent = eventName || 'HELLO';
    const dot = document.createElement('span'); dot.className = 'badge-dot'; dot.setAttribute('aria-hidden', 'true'); dot.textContent = '●';
    top.append(event, dot);
    const main = document.createElement('div'); main.className = 'badge-main';
    const label = document.createElement('span'); label.className = 'badge-label'; label.textContent = 'MY NAME IS';
    const name = document.createElement('strong'); name.className = 'badge-name'; name.textContent = person.name;
    const n = person.name.length;
    name.style.fontSize = n > 55 ? '15pt' : n > 40 ? '18pt' : n > 27 ? '21pt' : n > 18 ? '25pt' : '30pt';
    main.append(label, name);
    const footer = document.createElement('div'); footer.className = 'badge-footer';
    const org = document.createElement('span'); org.className = 'badge-org'; org.textContent = person.organization || '\u00a0';
    const role = document.createElement('span'); role.className = 'badge-role'; role.textContent = person.role || '\u00a0';
    if (person.organization.length > 70) org.classList.add('small');
    if (person.role.length > 25) role.classList.add('small');
    footer.append(org, role); card.append(top, main, footer);
    return card;
  }
  function build() {
    notice(error, ''); notice(status, '');
    try {
      const people = BadgeCore.parseBadges(csv.value);
      const pages = BadgeCore.pagesFor(people);
      const eventName = $('event-name').value.trim();
      const fragment = document.createDocumentFragment();
      pages.forEach((peopleOnPage, index) => {
        const sheet = document.createElement('div'); sheet.className = 'sheet';
        sheet.setAttribute('aria-label', `Sheet ${index + 1} of ${pages.length}`);
        const grid = document.createElement('div'); grid.className = 'badge-grid';
        peopleOnPage.forEach(person => grid.append(badge(person, eventName)));
        sheet.append(grid); fragment.append(sheet);
      });
      $('print-pages').replaceChildren(fragment);
      checkFit();
      $('count').textContent = `${people.length} badge${people.length === 1 ? '' : 's'}`;
      $('page-count').textContent = `${pages.length} sheet${pages.length === 1 ? '' : 's'} will print. Scroll above to check every sheet.`;
      document.body.classList.toggle('paper-letter', paper.value === 'letter');
      document.body.classList.toggle('paper-a4', paper.value !== 'letter');
      $('page-rule').textContent = `@page { size: ${paper.value === 'letter' ? 'letter' : 'A4'} portrait; margin: 0; }`;
      ready = true; printButton.disabled = false;
      csv.removeAttribute('aria-invalid'); document.body.classList.remove('print-invalid');
      notice(status, `Ready: ${people.length} badge${people.length === 1 ? '' : 's'} on ${pages.length} sheet${pages.length === 1 ? '' : 's'}. Review every sheet and print one test sheet.`);
      return true;
    } catch (err) {
      ready = false; printButton.disabled = true;
      csv.setAttribute('aria-invalid', 'true'); document.body.classList.add('print-invalid');
      $('print-pages').replaceChildren(); $('count').textContent = '0 badges';
      $('page-count').textContent = 'Fix the CSV and build again.';
      notice(error, err.message || 'Could not read this CSV.');
      return false;
    }
  }
  file.addEventListener('change', async () => {
    if (!file.files || !file.files[0]) return;
    try {
      if (file.files[0].size > 1024 * 1024) throw new Error('This file is over 1 MB. Split it into smaller CSV batches.');
      csv.value = await file.files[0].text(); invalidate(); build();
    } catch (err) {
      csv.value = ''; invalidate(); document.body.classList.add('print-invalid');
      notice(error, err.message || 'Could not read this file.');
    } finally { file.value = ''; }
  });
  csv.addEventListener('input', invalidate);
  $('event-name').addEventListener('input', invalidate);
  paper.addEventListener('change', invalidate);
  $('build').addEventListener('click', build);
  printButton.addEventListener('click', () => {
    if (!ready && !build()) return;
    window.print();
  });
  window.addEventListener('beforeprint', () => { if (!ready) build(); });
  build();
})();
