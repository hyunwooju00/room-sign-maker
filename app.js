(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const MAX_SESSIONS = 6;
  let nextId = 1;
  let sessions = [blank(), blank()];
  let fitError = false;

  function blank() { return { id: nextId++, start: '', end: '', title: '', speaker: '' }; }
  function make(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function field(labelText, key, value, type, span2, maxLength) {
    const label = make('label', span2 ? 'span2' : '', labelText);
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    if (maxLength) input.maxLength = maxLength;
    input.autocomplete = 'off';
    input.dataset.key = key;
    if (key === 'title') input.placeholder = 'Opening keynote';
    if (key === 'speaker') input.placeholder = 'Optional';
    label.append(input);
    return label;
  }
  function renderRows() {
    const list = $('session-list');
    list.replaceChildren();
    sessions.forEach((item, index) => {
      const row = make('div', 'session-row');
      row.dataset.id = String(item.id);
      const top = make('div', 'row-title');
      top.append(make('span', '', `SESSION ${String(index + 1).padStart(2, '0')}`));
      const remove = make('button', 'remove', 'Remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remove session ${index + 1}`);
      remove.addEventListener('click', () => {
        sessions = sessions.filter(s => s.id !== item.id);
        if (!sessions.length) sessions = [blank()];
        renderRows(); render();
        const target = list.children[Math.min(index, list.children.length - 1)]?.querySelector('[data-key="start"]') || $('add-session');
        target.focus();
      });
      top.append(remove);
      const fields = make('div', 'session-fields');
      fields.append(
        field('Starts', 'start', item.start, 'time'),
        field('Ends (optional)', 'end', item.end, 'time'),
        field('Session title', 'title', item.title, 'text', true, 110),
        field('Speaker (optional)', 'speaker', item.speaker, 'text', true, 80)
      );
      fields.addEventListener('input', event => {
        const key = event.target.dataset.key;
        if (!key) return;
        item[key] = event.target.value;
        render();
      });
      row.append(top, fields);
      list.append(row);
    });
    $('session-count').textContent = `${sessions.length} / ${MAX_SESSIONS}`;
    $('add-session').disabled = sessions.length >= MAX_SESSIONS;
  }
  function formatTime(time) {
    if (!/^\d{2}:\d{2}$/.test(time)) return time || 'Time';
    const [h, m] = time.split(':').map(Number);
    if ($('time-style').value === '24') return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  function dateLabel(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Choose a date';
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'Choose a date';
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
  }
  function message(value, success = false) {
    const target = success ? $('message') : $('error');
    const other = success ? $('error') : $('message');
    if (other.textContent) other.textContent = '';
    if (target.textContent !== value) target.textContent = value;
  }
  function measureFit() {
    const original = $('sign');
    const copy = original.cloneNode(true);
    copy.removeAttribute('id');
    copy.style.position = 'fixed';
    copy.style.left = '-10000px';
    copy.style.top = '0';
    copy.style.visibility = 'hidden';
    copy.style.zoom = '1';
    copy.style.height = $('paper').value === 'letter' ? '278.4mm' : '296mm';
    document.body.append(copy);
    const sessionBox = copy.querySelector('.sign-sessions');
    const overflow = sessionBox.scrollHeight > sessionBox.clientHeight + 2 || copy.scrollHeight > copy.clientHeight + 2;
    copy.remove();
    return overflow;
  }
  function render() {
    $('message').textContent = '';
    if (!$('error').textContent.startsWith('The sign text does not fit')) $('error').textContent = '';
    document.querySelectorAll('[aria-invalid="true"]').forEach(el => { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); });
    const event = $('event').value.trim();
    const room = $('room').value.trim();
    const date = $('date').value;
    const paper = $('paper').value === 'letter' ? 'letter' : 'a4';
    const sign = $('sign');
    sign.className = `sign ${paper}`;
    sign.style.setProperty('--accent', $('accent').value);
    $('preview-paper').textContent = paper === 'letter' ? 'US Letter · Portrait' : 'A4 · Portrait';
    $('sign-event').textContent = event || 'Your event';
    $('sign-room').textContent = room || 'Your room';
    $('sign-date').textContent = dateLabel(date);
    $('sign-foot-date').textContent = date || '—';
    const wrap = $('sign-sessions');
    wrap.replaceChildren();
    const active = sessions.filter(s => s.start || s.end || s.title.trim() || s.speaker.trim());
    if (!active.length) wrap.append(make('p', 'sign-empty', 'Add sessions to see the room schedule.'));
    for (const s of active) {
      const row = make('div', 'sign-session');
      const time = make('div', 'sign-time', formatTime(s.start));
      if (s.end) time.append(make('span', 'sign-end', `to ${formatTime(s.end)}`));
      const body = make('div', '');
      body.append(make('div', 'sign-title', s.title.trim() || 'Session title'));
      if (s.speaker.trim()) body.append(make('div', 'sign-speaker', s.speaker.trim()));
      row.append(time, body);
      wrap.append(row);
    }
    fitError = measureFit();
    if (fitError) message('The sign text does not fit on one page. Shorten a title or speaker line, or remove a session.');
    else if ($('error').textContent.startsWith('The sign text does not fit')) $('error').textContent = '';
  }
  function validate() {
    if (fitError) return { error: 'The sign text does not fit on one page. Shorten it before printing.' };
    if (!$('event').value.trim()) return { error: 'Enter the event name.', focus: $('event') };
    if (!$('room').value.trim()) return { error: 'Enter the room name.', focus: $('room') };
    if (dateLabel($('date').value) === 'Choose a date') return { error: 'Choose the event date.', focus: $('date') };
    const active = sessions.filter(s => s.start || s.end || s.title.trim() || s.speaker.trim());
    if (!active.length) return { error: 'Add at least one session.', focus: $('session-list').querySelector('input') };
    let previousEnd = -1;
    let previousStart = -1;
    for (const s of active) {
      const label = `Session ${sessions.indexOf(s) + 1}`;
      const row = $('session-list').querySelector(`[data-id="${s.id}"]`);
      if (row.querySelector('[data-key="start"]').validity.badInput) return { error: `${label}: enter a complete start time.`, focus: row.querySelector('[data-key="start"]') };
      if (row.querySelector('[data-key="end"]').validity.badInput) return { error: `${label}: enter a complete end time or leave it blank.`, focus: row.querySelector('[data-key="end"]') };
      if (!s.start) return { error: `${label}: enter a complete start time.`, focus: row.querySelector('[data-key="start"]') };
      if (!s.title.trim()) return { error: `${label}: enter a title.`, focus: row.querySelector('[data-key="title"]') };
      const start = minutes(s.start);
      const end = s.end ? minutes(s.end) : -1;
      if (end >= 0 && end <= start) return { error: `${label}: end time must be after the start time.`, focus: row.querySelector('[data-key="end"]') };
      if (start <= previousStart || start < previousEnd) return { error: `${label}: start time overlaps or is out of order. Check the room schedule.`, focus: row.querySelector('[data-key="start"]') };
      previousEnd = end >= 0 ? end : start;
      previousStart = start;
    }
    return { error: '' };
  }
  function minutes(value) { const [h, m] = value.split(':').map(Number); return h * 60 + m; }
  function setPageRule() {
    let style = $('page-rule');
    if (!style) { style = document.createElement('style'); style.id = 'page-rule'; document.head.append(style); }
    style.textContent = `@page { size: ${$('paper').value === 'letter' ? 'letter' : 'A4'} portrait; margin: 0; }`;
  }
  function reset() {
    if (($('event').value || $('room').value || $('date').value || sessions.some(s => s.start || s.end || s.title || s.speaker)) && !window.confirm('Clear this sign? Entries in this tab cannot be recovered.')) return;
    $('event').value = '';
    $('room').value = '';
    $('date').value = '';
    $('paper').value = 'a4';
    $('time-style').value = '24';
    $('accent').value = '#a94432';
    sessions = [blank(), blank()];
    renderRows(); render(); message('Form cleared.', true);
    $('event').focus();
  }
  function sample() {
    $('event').value = 'Harbor Tech Forum';
    $('room').value = 'Harbor Hall';
    $('date').value = '2026-11-14';
    sessions = [
      { id: nextId++, start: '09:00', end: '09:45', title: 'Opening keynote: building useful systems', speaker: 'Maya Chen' },
      { id: nextId++, start: '10:00', end: '10:45', title: 'Designing trustworthy data products', speaker: 'Luis Rivera' },
      { id: nextId++, start: '11:00', end: '11:45', title: 'From prototype to practice', speaker: 'Amara Okafor' },
      { id: nextId++, start: '12:00', end: '13:00', title: 'Lunch break', speaker: '' },
      { id: nextId++, start: '13:00', end: '13:45', title: 'Making teams work across disciplines', speaker: 'Noah Kim' },
      { id: nextId++, start: '14:00', end: '14:45', title: 'Closing panel and audience questions', speaker: 'Forum speakers' }
    ];
    renderRows(); render(); message('Synthetic sample loaded. Replace it with your own event details before printing.', true);
  }
  function bind() {
    renderRows();
    ['event', 'room', 'date', 'paper', 'time-style', 'accent'].forEach(id => $(id).addEventListener(id === 'paper' || id === 'time-style' || id === 'accent' ? 'change' : 'input', render));
    $('add-session').addEventListener('click', () => {
      if (sessions.length >= MAX_SESSIONS) return;
      sessions.push(blank()); renderRows(); render();
      $('session-list').lastElementChild.querySelector('[data-key="start"]').focus();
    });
    $('sample').addEventListener('click', sample);
    $('clear').addEventListener('click', reset);
    $('print').addEventListener('click', () => {
      const result = validate();
      if (result.error) { message(result.error); if (result.focus) { result.focus.setAttribute('aria-invalid', 'true'); result.focus.setAttribute('aria-describedby', 'error'); result.focus.focus(); } return; }
      message('Ready. Check the final print preview before saving or printing.', true);
      setPageRule(); $('print-dialog').showModal();
    });
    $('cancel-print').addEventListener('click', () => $('print-dialog').close());
    $('confirm-print').addEventListener('click', () => { $('print-dialog').close(); window.print(); });
    window.addEventListener('beforeprint', () => {
      const result = validate();
      document.body.classList.toggle('print-invalid', Boolean(result.error));
      $('print-warning').textContent = result.error ? `Fix this sign before printing: ${result.error}` : '';
      if (result.error) message(result.error);
      setPageRule();
    });
    window.addEventListener('afterprint', () => document.body.classList.remove('print-invalid'));
    render();
  }
  bind();
})();
