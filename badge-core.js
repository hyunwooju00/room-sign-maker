(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BadgeCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function parseRows(source) {
    const text = String(source || '').replace(/^\uFEFF/, '');
    if (text.includes('\uFFFD')) throw new Error('Some characters could not be read. Export the file as UTF-8 CSV and try again.');
    if (!text.trim()) throw new Error('Paste a CSV or choose a CSV file first.');
    const firstLine = text.split(/\r?\n/, 1)[0];
    const delimiter = ['\t', ',', ';'].reduce((best, candidate) =>
      firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best, ',');
    const rows = [];
    let row = [], field = '', quoted = false, atFieldStart = true;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') quoted = false;
        else field += c;
      } else if (c === '"' && (atFieldStart || !field.trim())) {
        quoted = true; atFieldStart = false;
      } else if (c === delimiter) {
        row.push(field.trim()); field = ''; atFieldStart = true;
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        row = []; field = ''; atFieldStart = true;
      } else {
        field += c; atFieldStart = false;
      }
    }
    if (quoted) throw new Error('A quoted CSV field is not closed. Fix the source file and try again.');
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
    return rows;
  }

  function parseBadges(source) {
    const rows = parseRows(source);
    if (rows.length < 2) throw new Error('Add at least one person below the header row.');
    const norm = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const headers = rows.shift().map(norm);
    const find = names => headers.findIndex(header => names.includes(header));
    const columns = {
      name: find(['name', 'fullname', 'attendeename', 'participantname']),
      first: find(['firstname', 'givenname', 'forename']),
      last: find(['lastname', 'surname', 'familyname']),
      org: find(['organization', 'organisation', 'company', 'org', 'affiliation']),
      role: find(['role', 'type', 'category', 'tickettype', 'jobtitle', 'title'])
    };
    if (columns.name < 0 && columns.first < 0 && columns.last < 0)
      throw new Error('The CSV needs “name” or first/last name columns. Optional columns: organization and role.');
    const people = [];
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i];
      const name = columns.name >= 0 ? (cells[columns.name] || '').trim() :
        [columns.first, columns.last].filter(index => index >= 0).map(index => (cells[index] || '').trim()).filter(Boolean).join(' ');
      if (!name) throw new Error(`Row ${i + 2} has no name. Add one or remove that row.`);
      const organization = columns.org < 0 ? '' : (cells[columns.org] || '').trim();
      const role = columns.role < 0 ? '' : (cells[columns.role] || '').trim();
      if (name.length > 70 || organization.length > 70 || role.length > 30)
        throw new Error(`Row ${i + 2} is too long for a badge (name 70, organization 70, role 30 characters maximum).`);
      people.push({ name, organization, role });
      if (people.length > 250) throw new Error('This tool handles up to 250 badges at a time. Split a larger file into batches.');
    }
    return people;
  }

  function pagesFor(people) {
    const pages = [];
    for (let i = 0; i < people.length; i += 4) pages.push(people.slice(i, i + 4));
    return pages;
  }
  return { parseRows, parseBadges, pagesFor };
});
