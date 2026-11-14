import { CONFIG } from './config.js';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const SCOPE = 'https://www.googleapis.com/auth/gmail.modify';
const API = 'https://gmail.googleapis.com/gmail/v1/users/me/';
const PAGE = 25;
const MAX_ATTACH = 15 * 1024 * 1024;
// Sample-data mode for local design checks only; never available on the live domain.
const PREVIEW = new URLSearchParams(location.search).has('preview') && ['127.0.0.1', 'localhost'].includes(location.hostname);
const ADDRESS = CONFIG.address.toLowerCase();
const DOMAIN = CONFIG.domain.toLowerCase();
const ARCH_Q = 'label:' + CONFIG.archiveLabel.toLowerCase().replace(/[\s/]+/g, '-');
const SCOPE_Q = `(to:${DOMAIN} OR from:${ADDRESS})`;

const VIEWS = {
  inbox: { id: 'inbox', name: 'Inbox', icon: 'inbox', q: `to:${DOMAIN} -from:${ADDRESS} -${ARCH_Q}`, empty: ['Inbox is empty', `New mail to ${CONFIG.address} arrives here`] },
  starred: { id: 'starred', name: 'Starred', icon: 'star', q: `is:starred ${SCOPE_Q}`, empty: ['No starred conversations', 'Press S on a conversation to star it'] },
  sent: { id: 'sent', name: 'Sent', icon: 'send', q: `from:${ADDRESS} in:sent`, sent: true, empty: ['Nothing sent yet', 'Mail you send as contact@ appears here'] },
  archive: { id: 'archive', name: 'Archived', icon: 'archive', q: ARCH_Q, empty: ['Archive is empty', 'Press E on a conversation to archive it'] },
  spam: { id: 'spam', name: 'Spam', icon: 'alert', q: `in:spam to:${DOMAIN}`, spamTrash: true, empty: ['No spam', 'Mail Gmail filters as spam appears here'] },
  trash: { id: 'trash', name: 'Trash', icon: 'trash', q: `in:trash ${SCOPE_Q}`, spamTrash: true, empty: ['Trash is empty', 'Gmail deletes trash after 30 days'] },
};
const VIEW_ORDER = ['inbox', 'starred', 'sent', 'archive', 'spam', 'trash'];

const SHORTCUTS = [
  ['C', 'Compose'], ['/', 'Search'], ['J  K', 'Next / previous conversation'], ['U', 'Back to the list'],
  ['R', 'Reply'], ['A', 'Reply all'], ['F', 'Forward'], ['E', 'Archive'], ['S', 'Star'],
  ['#', 'Move to trash'], ['Shift U', 'Mark unread'], ['Ctrl Enter', 'Send'], ['Esc', 'Close'], ['?', 'This panel'],
];

const ICONS = {
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  star: '<path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  alert: '<path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  restore: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  reply: '<path d="M9 17 4 12l5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  replyAll: '<path d="m7 17-5-5 5-5"/><path d="m12 17-5-5 5-5"/><path d="M22 18v-2a4 4 0 0 0-4-4H7"/>',
  forward: '<path d="m15 17 5-5-5-5"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  minus: '<path d="M5 12h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M8 13h.01M12 13h.01M16 13h.01M7 16.5h10"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/>',
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const rand = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const oneLine = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim();

class AuthError extends Error {
  constructor() { super('Your Google session has expired.'); this.name = 'AuthError'; }
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function hashHue(s) {
  let h = 0;
  for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

function initials(p) {
  const src = (p?.name || (p?.email || '?').split('@')[0]).replace(/["']/g, '').trim();
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

const avatar = (p, size = '') => `<span class="avatar ${size}" style="--h:${hashHue(p?.email)}" aria-hidden="true">${esc(initials(p))}</span>`;

const fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtDay = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const fmtYear = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const fmtFull = new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const fmtToday = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const fmtMonth = new Intl.DateTimeFormat(undefined, { month: 'short' });

// Signature detail: received time set like a postmark on opened letters.
function postmark(d) {
  const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `<time class="postmark" datetime="${d.toISOString()}" title="${esc(fmtFull.format(d))}">${d.getDate()} ${esc(fmtMonth.format(d))}<span class="pm-year"> ${d.getFullYear()}</span> · ${t}</time>`;
}

function shortDate(d) {
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return fmtTime.format(d);
  if (d.getFullYear() === now.getFullYear()) return fmtDay.format(d);
  return fmtYear.format(d);
}

function relative(d) {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return days < 7 ? `${days} d ago` : shortDate(d);
}

function fmtSize(n) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/* Addresses ---------------------------------------------------------- */

function splitAddresses(str) {
  const out = [];
  let cur = '', quoted = false, angle = 0;
  for (const ch of String(str || '')) {
    if (ch === '"') quoted = !quoted;
    else if (ch === '<') angle++;
    else if (ch === '>') angle = Math.max(0, angle - 1);
    if (ch === ',' && !quoted && !angle) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function parseAddress(s) {
  s = String(s || '').trim();
  const m = s.match(/^(.*?)<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim().replace(/^"|"$/g, '').replace(/\\"/g, '"').trim(), email: m[2].trim().toLowerCase() };
  return { name: '', email: s.replace(/^"|"$/g, '').toLowerCase() };
}

const parseList = (s) => splitAddresses(s).map(parseAddress);

function fmtAddr(p) {
  if (!p.name) return p.email;
  return /[,;<>"@()]/.test(p.name) ? `"${p.name.replace(/"/g, '')}" <${p.email}>` : `${p.name} <${p.email}>`;
}

function uniqBy(arr, key) {
  const seen = new Set();
  return arr.filter((x) => { const k = x?.[key]; if (!k || seen.has(k)) return false; seen.add(k); return true; });
}

function isMine(email) {
  const e = String(email || '').toLowerCase();
  return e === ADDRESS || (!!backend?.me && e === backend.me);
}

const nameOf = (p) => (isMine(p?.email) ? 'me' : p?.name || p?.email || 'Unknown');
const firstNameOf = (p) => (isMine(p?.email) ? 'me' : p?.name ? p.name.split(/\s+/)[0] : (p?.email || '').split('@')[0]);

/* Encoding ------------------------------------------------------------ */

function b64urlToBytes(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const utf8B64 = (s) => bytesToB64(new TextEncoder().encode(s));
const wrap76 = (s) => s.replace(/.{1,76}/g, '$&\r\n');
const encodeWord = (v) => (/^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${utf8B64(v)}?=`);

function decodeText(data, charset) {
  const bytes = b64urlToBytes(data);
  try { return new TextDecoder(charset || 'utf-8').decode(bytes); } catch { return new TextDecoder('utf-8').decode(bytes); }
}

function decodeEntities(s) {
  const t = document.createElement('textarea');
  t.innerHTML = s || '';
  return t.value;
}

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  doc.querySelectorAll('style,script,head,title').forEach((n) => n.remove());
  doc.querySelectorAll('br').forEach((n) => n.replaceWith('\n'));
  doc.querySelectorAll('p,div,tr,li,h1,h2,h3,h4,h5,h6,blockquote,table').forEach((n) => n.append('\n'));
  return (doc.body?.textContent || '').replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function linkify(escaped) {
  return escaped.replace(/\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g, (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);
}

function textToHtml(t) {
  const paras = esc(t).split(/\n{2,}/).map((p) => `<p style="margin:0 0 12px">${linkify(p).replace(/\n/g, '<br>')}</p>`).join('');
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111111">${paras}</div>`;
}

/* ------------------------------------------------------------------ */
/* Gmail message parsing                                               */
/* ------------------------------------------------------------------ */

function hdr(headers, name) {
  const h = (headers || []).find((x) => x.name.toLowerCase() === name);
  return h ? h.value : '';
}

function charsetOf(headers) {
  const m = hdr(headers, 'content-type').match(/charset="?([^";\s]+)/i);
  return m ? m[1] : 'utf-8';
}

function walkParts(part, out) {
  const H = part.headers || [];
  const mt = (part.mimeType || '').toLowerCase();
  if (part.parts?.length) { part.parts.forEach((p) => walkParts(p, out)); return; }
  const disp = hdr(H, 'content-disposition').toLowerCase();
  const cid = hdr(H, 'content-id').replace(/^<|>$/g, '');
  const isFile = !!part.filename || disp.startsWith('attachment');
  if (!isFile && mt === 'text/html' && part.body?.data && out.html == null) { out.html = decodeText(part.body.data, charsetOf(H)); return; }
  if (!isFile && mt === 'text/plain' && part.body?.data && out.text == null) { out.text = decodeText(part.body.data, charsetOf(H)); return; }
  if (part.body?.attachmentId || part.body?.data) {
    out.attachments.push({ filename: part.filename || (cid ? 'inline-image' : 'attachment'), mimeType: mt, size: part.body.size || 0, attachmentId: part.body.attachmentId, data: part.body.data, contentId: cid });
  }
}

function buildSummary(id, msgs, view) {
  const last = msgs[msgs.length - 1] || {};
  const labels = new Set(msgs.flatMap((m) => m.labels));
  let people;
  if (view?.sent) people = uniqBy(msgs.filter((m) => isMine(m.from.email)).flatMap((m) => m.to).filter((p) => !isMine(p.email)), 'email');
  else people = uniqBy(msgs.map((m) => m.from), 'email');
  if (!people.length) people = [last.from || { name: '', email: '' }];
  return {
    id,
    subject: msgs[0]?.subject || '(no subject)',
    people,
    date: last.date || new Date(),
    snippet: last.snippet || '',
    unread: msgs.some((m) => m.labels.includes('UNREAD')),
    starred: labels.has('STARRED'),
    count: msgs.length,
    attachment: msgs.some((m) => m.mixed),
    labels,
  };
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      try { out[k] = await fn(items[k]); } catch (e) { if (e instanceof AuthError) throw e; out[k] = null; }
    }
  }));
  return out;
}

/* ------------------------------------------------------------------ */
/* Google sign-in (token model, nothing stored server side)            */
/* ------------------------------------------------------------------ */

const Auth = {
  client: null,
  token: null,
  exp: 0,
  pending: null,
  load() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) return resolve();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Google sign-in could not load. Check the connection or any script blocker.'));
      document.head.appendChild(s);
    });
  },
  async init() {
    await this.load();
    this.client = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.clientId,
      scope: SCOPE,
      callback: (r) => this.onToken(r),
      error_callback: (e) => this.onError(e),
    });
  },
  request(prompt = '') {
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      this.client.requestAccessToken({ prompt });
    });
  },
  onToken(r) {
    const p = this.pending;
    this.pending = null;
    if (r.error) return p?.reject(new Error(r.error_description || r.error));
    if (!google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE)) return p?.reject(new Error('Gmail access was not granted. Sign in again and allow the Gmail permission.'));
    this.token = r.access_token;
    this.exp = Date.now() + (Number(r.expires_in || 3600) - 60) * 1000;
    p?.resolve();
  },
  onError(e) {
    const p = this.pending;
    this.pending = null;
    const msg = e?.type === 'popup_closed' ? 'The Google window was closed before sign-in finished.'
      : e?.type === 'popup_failed_to_open' ? 'The Google window was blocked. Allow pop-ups for this site and try again.'
        : 'Google sign-in failed. Try again.';
    p?.reject(new Error(msg));
  },
  valid() { return !!this.token && Date.now() < this.exp; },
  revoke() {
    try { if (this.token) google.accounts.oauth2.revoke(this.token, () => {}); } catch {}
    this.token = null;
    this.exp = 0;
  },
};

/* ------------------------------------------------------------------ */
/* Backends                                                            */
/* ------------------------------------------------------------------ */

async function readResponse(res) {
  if (res.status === 401) { Auth.token = null; throw new AuthError(); }
  if (!res.ok) {
    let msg = '';
    try { msg = (await res.json()).error?.message || ''; } catch {}
    throw new Error(msg || `Gmail returned an error (${res.status}).`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const Gmail = {
  me: '',
  fromName: CONFIG.displayName,
  sendAsReady: true,
  archId: '',

  async req(path, { method = 'GET', query, body } = {}) {
    if (!Auth.valid()) throw new AuthError();
    const url = new URL(API + path);
    for (const [k, v] of Object.entries(query || {})) {
      if (v == null || v === '') continue;
      if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x));
      else url.searchParams.set(k, String(v));
    }
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${Auth.token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return readResponse(res);
  },

  async init() {
    const [profile, sendAs, labels] = await Promise.all([
      this.req('profile'),
      this.req('settings/sendAs').catch((e) => { if (e instanceof AuthError) throw e; return null; }),
      this.req('labels'),
    ]);
    this.me = String(profile.emailAddress || '').toLowerCase();
    if (sendAs) {
      const alias = (sendAs.sendAs || []).find((s) => s.sendAsEmail.toLowerCase() === ADDRESS);
      this.sendAsReady = !!alias && (!alias.verificationStatus || alias.verificationStatus === 'accepted');
      if (alias?.displayName) this.fromName = alias.displayName;
    }
    let label = (labels.labels || []).find((l) => l.name.toLowerCase() === CONFIG.archiveLabel.toLowerCase());
    if (!label) {
      label = await this.req('labels', { method: 'POST', body: { name: CONFIG.archiveLabel, labelListVisibility: 'labelShow', messageListVisibility: 'show' } });
    }
    this.archId = label.id;
    return { email: profile.emailAddress };
  },

  async list(view, pageToken, search) {
    const q = search ? `${SCOPE_Q} ${search}` : view.q;
    const r = await this.req('threads', { query: { q, maxResults: PAGE, pageToken, includeSpamTrash: search ? false : !!view.spamTrash } });
    const ids = (r.threads || []).map((t) => t.id);
    const full = await pool(ids, 8, (id) => this.req(`threads/${id}`, {
      query: { format: 'metadata', metadataHeaders: ['From', 'To', 'Cc', 'Subject', 'Content-Type'] },
    }));
    const threads = full.filter(Boolean).map((t) => buildSummary(t.id, (t.messages || []).map((m) => {
      const H = m.payload?.headers || [];
      return {
        from: parseAddress(hdr(H, 'from')),
        to: [...parseList(hdr(H, 'to')), ...parseList(hdr(H, 'cc'))],
        subject: hdr(H, 'subject'),
        date: new Date(Number(m.internalDate)),
        labels: m.labelIds || [],
        snippet: decodeEntities(m.snippet || ''),
        mixed: /multipart\/mixed/i.test(hdr(H, 'content-type')),
      };
    }), view));
    return { threads, next: r.nextPageToken || null };
  },

  async thread(id) {
    const t = await this.req(`threads/${id}`, { query: { format: 'full' } });
    const messages = [];
    for (const m of t.messages || []) messages.push(await this.normalize(m));
    return { id: t.id, subject: messages[0]?.subject || '(no subject)', messages, labels: new Set(messages.flatMap((m) => m.labelIds)) };
  },

  async normalize(m) {
    const H = m.payload?.headers || [];
    const out = { html: null, text: null, attachments: [] };
    walkParts(m.payload || {}, out);
    if (out.html) {
      for (const a of out.attachments) {
        if (!a.contentId || !out.html.includes(`cid:${a.contentId}`)) continue;
        try {
          const bytes = a.data ? b64urlToBytes(a.data) : await this.attachment(m.id, a.attachmentId);
          out.html = out.html.split(`cid:${a.contentId}`).join(`data:${a.mimeType || 'image/png'};base64,${bytesToB64(bytes)}`);
          a.inline = true;
        } catch (e) { if (e instanceof AuthError) throw e; }
      }
    }
    return {
      id: m.id,
      from: parseAddress(hdr(H, 'from')),
      to: parseList(hdr(H, 'to')),
      cc: parseList(hdr(H, 'cc')),
      replyTo: parseList(hdr(H, 'reply-to')),
      subject: hdr(H, 'subject') || '(no subject)',
      date: new Date(Number(m.internalDate) || Date.parse(hdr(H, 'date')) || Date.now()),
      labelIds: m.labelIds || [],
      snippet: decodeEntities(m.snippet || ''),
      html: out.html,
      text: out.text,
      attachments: out.attachments.filter((a) => !a.inline),
      messageId: hdr(H, 'message-id'),
      references: hdr(H, 'references'),
    };
  },

  modify(id, add = [], remove = []) {
    return this.req(`threads/${id}/modify`, { method: 'POST', body: { addLabelIds: add, removeLabelIds: remove } });
  },
  trash(id) { return this.req(`threads/${id}/trash`, { method: 'POST' }); },
  untrash(id) { return this.req(`threads/${id}/untrash`, { method: 'POST' }); },

  async count(view) {
    const r = await this.req('threads', { query: { q: `${view.q} is:unread`, maxResults: 100, includeSpamTrash: !!view.spamTrash } });
    return (r.threads || []).length;
  },

  async attachment(messageId, attachmentId) {
    const r = await this.req(`messages/${messageId}/attachments/${attachmentId}`);
    return b64urlToBytes(r.data);
  },

  // JSON endpoint on purpose: the /upload endpoints omit CORS headers on error
  // responses, so the browser reports only "Failed to fetch" and hides the cause.
  send({ mime, threadId }) {
    const raw = utf8B64(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return this.req('messages/send', { method: 'POST', body: threadId ? { raw, threadId } : { raw } });
  },
};

/* Preview backend: sample data held in memory, used at /?preview ------ */

function demoData() {
  const now = Date.now();
  const H = 3600e3;
  const me = { name: CONFIG.displayName, email: ADDRESS };
  const p = (name, email) => ({ name, email });
  const aarav = p('Aarav Shrestha', 'aarav@example.com');
  const mira = p('Mira Joshi', 'mira@example.org');
  const lab = p('Lab Bulletin', 'bulletin@example.edu');
  const sagar = p('Sagar K.', 'sagar@example.net');
  const studio = p('North Studio', 'hello@example.com');
  const nina = p('Nina Rai', 'nina@example.com');
  return [
    {
      id: 'd1', labels: new Set(['INBOX', 'UNREAD']), messages: [{
        id: 'm1', from: aarav, to: [me], subject: 'Motion graphics for a product launch', date: new Date(now - 0.6 * H),
        text: `Hi Dipesh,\n\nI found your motion work through your portfolio and really liked the pacing on the sports reels.\n\nWe are launching a small hardware product next month and need a 30 second animated teaser: logo reveal, three feature callouts, and an end card. Would you have time in the next three weeks?\n\nHappy to share the brand kit and a rough script.\n\nThanks,\nAarav`,
      }],
    },
    {
      id: 'd2', labels: new Set(['INBOX', 'UNREAD', 'STARRED']), messages: [
        {
          id: 'm2a', from: mira, to: [me], subject: 'Research collaboration on a small vision model', date: new Date(now - 26 * H),
          text: 'Hello Dipesh,\n\nWe are putting together a student group to train a lightweight image classifier for crop disease detection. Your interest in AI/ML came up. Would you like to join?\n\nMira',
        },
        {
          id: 'm2b', from: me, to: [mira], subject: 'Re: Research collaboration on a small vision model', date: new Date(now - 24 * H),
          text: 'Hi Mira,\n\nThat sounds great. I can help with data augmentation and the evaluation pipeline. When is the first meeting?\n\nDipesh',
        },
        {
          id: 'm2c', from: mira, to: [me], subject: 'Re: Research collaboration on a small vision model', date: new Date(now - 3 * H),
          text: 'Perfect. First call is Thursday at 5 PM. I will send the dataset link and the notebook before then.\n\nMira',
        },
      ],
    },
    {
      id: 'd3', labels: new Set(['INBOX']), messages: [{
        id: 'm3', from: lab, to: [me], subject: 'Workshop schedule: Embedded Systems Lab', date: new Date(now - 30 * H),
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
          <h2 style="margin:0 0 4px;font-size:22px;color:#065f46">Embedded Systems Lab</h2>
          <p style="margin:0 0 18px;color:#6b7280">Workshop schedule for this week</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px;border-bottom:1px solid #e5e7eb"><b>Mon</b></td><td style="padding:10px;border-bottom:1px solid #e5e7eb">Microcontroller GPIO and timers</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #e5e7eb"><b>Wed</b></td><td style="padding:10px;border-bottom:1px solid #e5e7eb">Circuit simulation in Proteus</td></tr>
            <tr><td style="padding:10px"><b>Fri</b></td><td style="padding:10px">UART, I2C and SPI basics</td></tr>
          </table>
          <p style="margin:22px 0"><a href="https://example.edu" style="background:#065f46;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View full calendar</a></p>
          <p style="font-size:12px;color:#9ca3af">You are receiving this because you joined the lab mailing list.</p></div>`,
        attachments: [{ filename: 'lab-schedule.pdf', mimeType: 'application/pdf', size: 248000 }],
      }],
    },
    {
      id: 'd4', labels: new Set(['INBOX']), messages: [{
        id: 'm4', from: sagar, to: [me], subject: 'Question about your Proteus simulation', date: new Date(now - 52 * H),
        text: 'Hey,\n\nIn your 8051 traffic light simulation, did you drive the LEDs directly from port 1 or through a transistor array? Mine flickers when all lights switch at once.\n\nThanks,\nSagar',
      }],
    },
    {
      id: 'd5', labels: new Set(['SENT']), messages: [{
        id: 'm5', from: me, to: [studio], subject: 'Re: Video edit timeline', date: new Date(now - 96 * H),
        text: 'Hi,\n\nThe first cut will be ready on Friday. I will share a private review link with timestamps for comments.\n\nBest,\nDipesh',
      }],
    },
    {
      id: 'd6', labels: new Set(['ARCH']), messages: [{
        id: 'm6', from: nina, to: [me], subject: 'Thanks for the reel', date: new Date(now - 220 * H),
        text: 'The edit came out beautifully. The client loved the transitions. Thank you again!\n\nNina',
      }],
    },
    {
      id: 'd7', labels: new Set(['SPAM']), messages: [{
        id: 'm7', from: p('Prize Desk', 'promo@example.biz'), to: [me], subject: 'You have been selected', date: new Date(now - 12 * H),
        text: 'Claim your reward now by confirming your account details.',
      }],
    },
  ];
}

const Demo = {
  me: 'preview@example.com',
  fromName: CONFIG.displayName,
  sendAsReady: true,
  archId: 'ARCH',
  threads: [],
  async init() { this.threads = demoData(); return { email: CONFIG.address }; },
  find(id) { return this.threads.find((t) => t.id === id); },
  match(t, view, search) {
    const L = t.labels;
    const inbound = t.messages.some((m) => !isMine(m.from.email));
    const mine = t.messages.some((m) => isMine(m.from.email));
    const live = !L.has('SPAM') && !L.has('TRASH');
    if (search) return live && JSON.stringify(t.messages).toLowerCase().includes(search.toLowerCase());
    switch (view.id) {
      case 'inbox': return live && inbound && !L.has('ARCH');
      case 'starred': return live && L.has('STARRED');
      case 'sent': return live && mine;
      case 'archive': return live && L.has('ARCH');
      case 'spam': return L.has('SPAM');
      case 'trash': return L.has('TRASH');
      default: return false;
    }
  },
  shape(t) {
    return t.messages.map((m) => ({
      from: m.from, to: [...m.to, ...(m.cc || [])], subject: m.subject, date: m.date, labels: [...t.labels],
      snippet: (m.text || htmlToText(m.html)).replace(/\s+/g, ' ').slice(0, 160), mixed: !!m.attachments?.length,
    }));
  },
  async list(view, _next, search) {
    await wait(220);
    const items = this.threads.filter((t) => this.match(t, view, search))
      .sort((a, b) => b.messages.at(-1).date - a.messages.at(-1).date);
    return { threads: items.map((t) => buildSummary(t.id, this.shape(t), view)), next: null };
  },
  async thread(id) {
    await wait(140);
    const t = this.find(id);
    if (!t) throw new Error('Conversation not found.');
    return {
      id: t.id, subject: t.messages[0].subject, labels: new Set(t.labels),
      messages: t.messages.map((m, i) => ({
        cc: [], replyTo: [], html: null, text: null, attachments: [], references: '', ...m,
        labelIds: [...t.labels].filter((l) => l !== 'UNREAD' || i === t.messages.length - 1),
        snippet: (m.text || htmlToText(m.html)).replace(/\s+/g, ' ').slice(0, 160),
        messageId: `<${m.id}@preview.local>`,
      })),
    };
  },
  async modify(id, add = [], remove = []) { const t = this.find(id); if (!t) return; add.forEach((l) => t.labels.add(l)); remove.forEach((l) => t.labels.delete(l)); },
  async trash(id) { return this.modify(id, ['TRASH'], ['INBOX']); },
  async untrash(id) { return this.modify(id, [], ['TRASH']); },
  async count(view) { return this.threads.filter((t) => t.labels.has('UNREAD') && this.match(t, view)).length; },
  async attachment() { throw new Error('Attachments cannot be downloaded in preview mode.'); },
  async send({ threadId, meta }) {
    await wait(500);
    const msg = { id: `m${rand()}`, from: { name: CONFIG.displayName, email: ADDRESS }, to: parseList(meta.to), cc: parseList(meta.cc), subject: meta.subject, date: new Date(), text: meta.text };
    const t = threadId && this.find(threadId);
    if (t) { t.messages.push(msg); t.labels.add('SENT'); } else this.threads.push({ id: `t${rand()}`, labels: new Set(['SENT']), messages: [msg] });
  },
};

let backend = PREVIEW ? Demo : Gmail;

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const state = {
  ready: false,
  gisReady: false,
  view: 'inbox',
  search: '',
  threads: [],
  next: null,
  loading: false,
  loadingMore: false,
  error: null,
  selected: null,
  thread: null,
  threadLoading: false,
  threadError: null,
  expanded: new Set(),
  showImages: new Set(),
  counts: { inbox: 0, spam: 0 },
  account: '',
  compose: null,
  help: false,
};

let listSeq = 0;
let threadSeq = 0;

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set) return set;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('cm-theme', next); } catch {}
  $$('[data-action="theme"]').forEach((b) => { b.innerHTML = icon(next === 'dark' ? 'sun' : 'moon'); });
  $('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#141415' : '#fafafa');
}

const themeIcon = () => icon(currentTheme() === 'dark' ? 'sun' : 'moon');

/* ------------------------------------------------------------------ */
/* Lock screen                                                         */
/* ------------------------------------------------------------------ */

let lockEntered = false;

function renderLock({ error = '', busy = false, resume = false } = {}) {
  const setup = !CONFIG.clientId && !PREVIEW;
  const lock = $('#lock');
  lock.hidden = false;
  document.body.classList.add('locked');
  const host = new URL(CONFIG.portfolioUrl).host;
  const label = busy ? 'Waiting for Google' : resume ? 'Continue session' : 'Continue with Google';
  // One entrance on first load only; later re-renders (Google ready, busy, errors) stay still.
  const enter = lockEntered ? '' : 'enter';
  lockEntered = true;
  lock.innerHTML = `
    <div class="lock ${resume ? 'is-resume' : ''} ${enter}">
      <header class="lock-top">
        <span class="brand"><span class="mark" aria-hidden="true">@</span><span class="brand-title">contact</span></span>
        <button class="icon-btn" data-action="theme" aria-label="Toggle colour theme">${themeIcon()}</button>
      </header>
      <main class="lock-main">
        <div class="lock-copy">
          <h1 class="lock-title">${resume ? 'Session paused' : `${esc(CONFIG.firstName)}’s contact inbox`}</h1>
          <p class="lock-sub">${resume
            ? 'Google sessions last an hour. Continue to pick up where you left off.'
            : `Read and answer mail sent to <span class="addr">${esc(CONFIG.address)}</span>. Sign in with the Google account that receives it.`}</p>
          ${setup ? '' : `<div class="lock-actions">
            <button class="btn primary lg" data-action="signin" ${busy || !state.gisReady ? 'disabled' : ''}>
              <span>${label}</span>${busy ? '<span class="spinner" aria-hidden="true"></span>' : ''}
            </button>
            ${resume ? '<button class="btn ghost lg" data-action="signout">Sign out</button>' : ''}
          </div>`}
          ${setup ? '<p class="lock-note">Google sign-in is not configured yet. Add the OAuth client ID to <code>public/config.js</code> and deploy again.</p>' : ''}
          ${error ? `<p class="lock-error" role="alert">${esc(error)}</p>` : ''}
        </div>
        ${resume ? '' : lockPreview()}
      </main>
      <footer class="lock-foot">
        <span>${esc(CONFIG.tagline)}</span>
        <a href="${esc(CONFIG.portfolioUrl)}" rel="noopener">${esc(host)}${icon('external')}</a>
      </footer>
    </div>`;
}

// Product preview for the sign-in screen: the inbox with one letter open on paper.
function lockPreview() {
  const now = new Date();
  const at = (h) => new Date(now.getTime() - h * 3600e3);
  const rows = [
    { p: { name: 'Aarav Shrestha', email: 'aarav@example.com' }, s: 'Motion graphics for a product launch', d: at(0.6), unread: true, sel: true },
    { p: { name: 'Mira Joshi', email: 'mira@example.org' }, s: 'Research collaboration on a small vision model', d: at(3), unread: true },
    { p: { name: 'Lab Bulletin', email: 'bulletin@example.edu' }, s: 'Workshop schedule: Embedded Systems Lab', d: at(30) },
    { p: { name: 'Sagar K.', email: 'sagar@example.net' }, s: 'Question about your Proteus simulation', d: at(52) },
  ];
  return `<div class="lock-visual" aria-hidden="true">
    <div class="pv">
      <div class="pv-head"><span class="pv-title">Inbox</span><span class="pv-meta">2 unread</span></div>
      <div class="pv-body">
        <div class="pv-list">${rows.map((r) => `
          <div class="pv-row ${r.sel ? 'sel' : ''} ${r.unread ? 'unread' : ''}">
            ${avatar(r.p, 'sm')}
            <div class="pv-text"><span class="pv-name">${esc(r.p.name)}</span><span class="pv-subj">${esc(r.s)}</span></div>
            <span class="pv-date">${esc(shortDate(r.d))}</span>
          </div>`).join('')}
        </div>
        <div class="pv-reader">
          <p class="pv-subject">Motion graphics for a product launch</p>
          <div class="pv-from">${avatar(rows[0].p, 'sm')}<span class="pv-name">Aarav Shrestha</span>${postmark(rows[0].d)}</div>
          <div class="paper pv-paper">
            <p>Hi Dipesh,</p>
            <p>I found your motion work through your portfolio and liked the pacing on the sports reels.</p>
            <p>We launch a small hardware product next month and need a 30 second animated teaser. Would you have time in the next three weeks?</p>
            <p>Thanks,<br>Aarav</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function hideLock() {
  const lock = $('#lock');
  lock.hidden = true;
  lock.innerHTML = '';
  document.body.classList.remove('locked');
}

/* ------------------------------------------------------------------ */
/* App shell                                                           */
/* ------------------------------------------------------------------ */

function renderApp() {
  $('#app').innerHTML = `
    <div class="shell" id="shell" data-reader-open="false">
      <aside class="rail">
        <div class="brand">
          <span class="mark" aria-hidden="true">@</span>
          <div class="brand-text">
            <span class="brand-title">contact</span>
            <span class="brand-sub">${esc(DOMAIN)}</span>
          </div>
        </div>
        <button class="compose-btn" data-action="compose">${icon('pen')}<span>Compose</span><kbd>C</kbd></button>
        <nav class="nav" id="nav" aria-label="Mailboxes"></nav>
        <div class="rail-foot">
          <div class="account">
            ${avatar({ name: CONFIG.displayName, email: ADDRESS }, 'sm')}
            <div class="account-text">
              <span class="account-name">${esc(CONFIG.displayName)}</span>
              <span class="account-mail" title="${esc(state.account)}">${esc(PREVIEW ? 'Local sample data' : state.account)}</span>
            </div>
          </div>
          <div class="rail-tools">
            <button class="icon-btn" data-action="theme" aria-label="Toggle colour theme" title="Theme">${themeIcon()}</button>
            <button class="icon-btn" data-action="help" aria-label="Keyboard shortcuts" title="Shortcuts (?)">${icon('keyboard')}</button>
            <a class="icon-btn" href="${esc(CONFIG.portfolioUrl)}" rel="noopener" aria-label="Open portfolio" title="Portfolio">${icon('external')}</a>
            <button class="icon-btn" data-action="signout" aria-label="Sign out" title="Sign out">${icon('logout')}</button>
          </div>
        </div>
      </aside>

      <section class="list-pane" aria-label="Conversations">
        <header class="list-head">
          <div class="mobile-bar">
            <div class="brand compact">
              <span class="mark" aria-hidden="true">@</span>
              <span class="brand-title">contact</span>
            </div>
            <div class="mobile-tools">
              <button class="icon-btn" data-action="theme" aria-label="Toggle colour theme">${themeIcon()}</button>
              <button class="icon-btn" data-action="signout" aria-label="Sign out">${icon('logout')}</button>
            </div>
          </div>
          <div class="head-row">
            <div class="head-text">
              <h2 class="view-title" id="view-title"></h2>
              <p class="view-meta" id="view-meta"></p>
            </div>
            <button class="icon-btn" id="refresh-btn" data-action="refresh" aria-label="Refresh" title="Refresh">${icon('refresh')}</button>
          </div>
          <label class="search">
            ${icon('search')}
            <input id="search" type="search" placeholder="Search" autocomplete="off" spellcheck="false" aria-label="Search contact mail">
            <kbd>/</kbd>
          </label>
          <nav class="mnav" id="mnav" aria-label="Mailboxes"></nav>
        </header>
        <div class="list" id="list" role="list"></div>
      </section>

      <main class="reader" id="reader"></main>
      <button class="fab" data-action="compose" aria-label="Compose">${icon('pen')}</button>
    </div>`;

  const input = $('#search');
  const run = debounce(() => setSearch(input.value), 450);
  input.addEventListener('input', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); setSearch(input.value); }
    if (e.key === 'Escape') { input.value = ''; setSearch(''); input.blur(); }
  });

  renderNav();
  renderListHead();
  renderList();
  renderReader();
}

function renderNav() {
  const html = VIEW_ORDER.map((id) => {
    const v = VIEWS[id];
    const n = state.counts[id] || 0;
    const active = !state.search && state.view === id;
    return `<button class="nav-item ${active ? 'active' : ''}" data-action="view" data-view="${id}" ${active ? 'aria-current="page"' : ''}>
      ${icon(v.icon)}<span class="nav-label">${v.name}</span>${n ? `<span class="nav-count">${n > 99 ? '99+' : n}</span>` : ''}
    </button>`;
  }).join('');
  const nav = $('#nav');
  const mnav = $('#mnav');
  if (nav) nav.innerHTML = html;
  if (mnav) mnav.innerHTML = html;
}

function renderListHead() {
  const title = $('#view-title');
  const meta = $('#view-meta');
  if (!title) return;
  if (state.search) {
    title.textContent = 'Search';
    meta.textContent = state.loading ? 'Searching all contact mail' : `${plural(state.threads.length, 'result')}${state.next ? '+' : ''} for "${state.search}"`;
  } else {
    const v = VIEWS[state.view];
    title.textContent = v.name;
    if (state.loading && !state.threads.length) meta.textContent = 'Loading';
    else {
      const unread = state.threads.filter((t) => t.unread).length;
      meta.textContent = `${plural(state.threads.length, 'conversation')}${state.next ? '+' : ''}${unread ? ` · ${unread} unread` : ''}`;
    }
  }
  $('#refresh-btn')?.classList.toggle('spinning', state.loading);
}

function renderList() {
  const list = $('#list');
  if (!list) return;
  if (state.loading && !state.threads.length) {
    list.innerHTML = Array.from({ length: 7 }, () => `
      <div class="row skeleton" aria-hidden="true">
        <span class="avatar sk"></span>
        <span class="row-main"><span class="sk-line w40"></span><span class="sk-line w80"></span><span class="sk-line w60"></span></span>
      </div>`).join('');
    return;
  }
  if (state.error && !state.threads.length) {
    list.innerHTML = `<div class="list-empty">
      <p class="empty-title">Could not load mail</p>
      <p class="empty-sub">${esc(state.error)}</p>
      <button class="btn ghost" data-action="refresh">Try again</button>
    </div>`;
    return;
  }
  if (!state.threads.length) {
    const [a, b] = state.search ? ['No matches', 'Try a name, an address or another word'] : VIEWS[state.view].empty;
    list.innerHTML = `<div class="list-empty"><span class="empty-glyph" aria-hidden="true">@</span><p class="empty-title">${esc(a)}</p><p class="empty-sub">${esc(b)}</p></div>`;
    return;
  }
  const sent = !state.search && VIEWS[state.view].sent;
  list.innerHTML = state.threads.map((t) => {
    const who = t.people.slice(0, 3).map((p) => (t.people.length > 1 ? firstNameOf(p) : nameOf(p))).join(', ') + (t.people.length > 3 ? ` +${t.people.length - 3}` : '');
    const lead = t.people.find((p) => !isMine(p.email)) || t.people[0];
    return `<button class="row ${t.unread ? 'unread' : ''} ${state.selected === t.id ? 'selected' : ''}" data-action="open" data-id="${esc(t.id)}" role="listitem">
      ${avatar(lead)}
      <span class="row-main">
        <span class="row-top">
          <span class="row-name">${sent ? '<span class="row-to">To</span> ' : ''}${esc(who)}</span>
          ${t.count > 1 ? `<span class="row-count">${t.count}</span>` : ''}
          <time class="row-date" datetime="${t.date.toISOString()}">${esc(shortDate(t.date))}</time>
        </span>
        <span class="row-subject">${esc(t.subject)}</span>
        <span class="row-snippet">${esc(t.snippet)}</span>
      </span>
      <span class="row-flags">${t.starred ? icon('star', 'filled') : ''}${t.attachment ? icon('clip') : ''}</span>
    </button>`;
  }).join('') + (state.next ? `<div class="list-more"><button class="btn ghost" data-action="more" ${state.loadingMore ? 'disabled' : ''}>${state.loadingMore ? 'Loading' : 'Load older conversations'}</button></div>` : '');
}

/* Reader ------------------------------------------------------------- */

function renderWelcome() {
  const unread = state.counts.inbox || 0;
  const latest = state.threads[0];
  const viewName = state.search ? 'Results' : VIEWS[state.view].name;
  return `<div class="welcome">
    <div class="welcome-inner">
      <h1 class="welcome-title">${esc(fmtToday.format(new Date()))}</h1>
      <dl class="facts">
        <div><dt>Unread in Inbox</dt><dd>${unread}</dd></div>
        <div><dt>${esc(viewName)}</dt><dd>${state.threads.length}${state.next ? '+' : ''}</dd></div>
        <div><dt>Latest message</dt><dd>${latest ? esc(relative(latest.date)) : 'None'}</dd></div>
      </dl>
      <p class="welcome-sub">Select a conversation to read it</p>
      <div class="hints">
        <span><kbd>C</kbd>Compose</span><span><kbd>/</kbd>Search</span><span><kbd>J</kbd><kbd>K</kbd>Move</span><span><kbd>?</kbd>All shortcuts</span>
      </div>
    </div>
  </div>`;
}

function hasRemoteImages(html) {
  return /<img[^>]+src\s*=\s*["']?\s*(https?:)?\/\//i.test(html) || /url\(\s*["']?\s*(https?:)?\/\//i.test(html) || /background\s*=\s*["']?\s*https?:/i.test(html);
}

function sanitizeEmail(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,iframe,frame,frameset,object,embed,applet,form,base,link[rel="import"],meta[http-equiv]').forEach((n) => n.remove());
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      else if (/^(href|src|xlink:href|action|formaction)$/i.test(attr.name) && /^\s*(javascript|vbscript|data:text\/html)/i.test(attr.value)) el.removeAttribute(attr.name);
    }
  });
  doc.querySelectorAll('a[href]').forEach((a) => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); });
  const styles = [...doc.querySelectorAll('style')].map((s) => s.outerHTML).join('');
  doc.querySelectorAll('style').forEach((s) => s.remove());
  return styles + (doc.body?.innerHTML || '');
}

const FRAME_CSS = `html,body{background:transparent}body{margin:0;padding:28px 32px;color:#1f1b16;font:15px/1.7 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;word-break:break-word;overflow-wrap:anywhere;overflow-x:auto}
img{max-width:100%;height:auto}table{max-width:100%}pre{white-space:pre-wrap}a{color:#047857}blockquote{margin:0 0 0 4px;padding-left:12px;border-left:2px solid #d8d2c6;color:#5e554a}
@media (max-width:520px){body{padding:20px}}`;

function frameDoc(html, showImages) {
  const csp = `default-src 'none'; img-src ${showImages ? 'https: data:' : 'data:'}; style-src 'unsafe-inline'${showImages ? ' https:' : ''}; font-src ${showImages ? 'https: ' : ''}data:; form-action 'none'`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${FRAME_CSS}</style></head><body>${sanitizeEmail(html)}</body></html>`;
}

function renderMessage(m, i, all) {
  const isLast = i === all.length - 1;
  const open = isLast || state.expanded.has(m.id);
  const toLine = [...m.to, ...m.cc].map((p) => nameOf(p)).join(', ');
  let body = '';
  if (open) {
    if (m.html) {
      const blocked = !state.showImages.has(m.id) && hasRemoteImages(m.html);
      body = `${blocked ? `<div class="img-banner">${icon('image')}<span>Remote images are hidden so senders cannot track when you read this.</span><button class="link-btn" data-action="show-images" data-mid="${esc(m.id)}">Show images</button></div>` : ''}
        <div class="paper"><iframe class="mail-frame" data-mid="${esc(m.id)}" title="Message from ${esc(nameOf(m.from))}" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" loading="lazy"></iframe></div>`;
    } else {
      body = `<div class="paper"><div class="paper-text">${linkify(esc(m.text || m.snippet || '(empty message)'))}</div></div>`;
    }
    if (m.attachments.length) {
      body += `<div class="attachments">${m.attachments.map((a, k) => `
        <button class="attachment" data-action="download" data-mid="${esc(m.id)}" data-idx="${k}" title="Download ${esc(a.filename)}">
          <span class="att-icon">${icon('file')}</span>
          <span class="att-text"><span class="att-name">${esc(a.filename)}</span><span class="att-size">${esc(fmtSize(a.size) || a.mimeType)}</span></span>
          ${icon('download', 'att-dl')}
        </button>`).join('')}</div>`;
    }
    body += `<div class="msg-actions">
      <button class="chip-btn" data-action="reply" data-mid="${esc(m.id)}">${icon('reply')}Reply</button>
      <button class="chip-btn" data-action="reply-all" data-mid="${esc(m.id)}">${icon('replyAll')}Reply all</button>
      <button class="chip-btn" data-action="forward" data-mid="${esc(m.id)}">${icon('forward')}Forward</button>
    </div>`;
  }
  return `<article class="msg ${open ? 'open' : 'closed'} ${isMine(m.from.email) ? 'mine' : ''}">
    <header class="msg-head" ${isLast ? '' : `data-action="toggle-msg" data-mid="${esc(m.id)}" role="button" tabindex="0" aria-expanded="${open}"`}>
      ${avatar(m.from)}
      <div class="msg-who">
        <div class="msg-line"><span class="msg-name">${esc(isMine(m.from.email) ? `${CONFIG.displayName} (you)` : m.from.name || m.from.email)}</span>${m.from.name && !isMine(m.from.email) ? `<span class="msg-addr">${esc(m.from.email)}</span>` : ''}</div>
        <div class="msg-sub">${open ? `to ${esc(toLine || 'undisclosed recipients')}` : esc(m.snippet)}</div>
      </div>
      ${open ? postmark(m.date) : `<time class="msg-date" datetime="${m.date.toISOString()}" title="${esc(fmtFull.format(m.date))}">${esc(shortDate(m.date))}</time>`}
    </header>
    ${open ? `<div class="msg-body">${body}</div>` : ''}
  </article>`;
}

function renderReader() {
  const reader = $('#reader');
  if (!reader) return;
  $('#shell')?.setAttribute('data-reader-open', String(!!state.selected));
  if (!state.selected) { reader.innerHTML = renderWelcome(); return; }
  if (state.threadLoading && !state.thread) {
    reader.innerHTML = `<div class="thread"><div class="thread-bar"><button class="icon-btn back-btn" data-action="close-thread" aria-label="Back">${icon('back')}</button></div>
      <div class="thread-scroll"><div class="thread-wrap"><div class="sk-line w70 tall"></div><div class="sk-line w30"></div><div class="msg sk-card"></div><div class="msg sk-card"></div></div></div></div>`;
    return;
  }
  if (state.threadError) {
    reader.innerHTML = `<div class="thread"><div class="thread-bar"><button class="icon-btn back-btn" data-action="close-thread" aria-label="Back">${icon('back')}</button></div>
      <div class="list-empty"><p class="empty-title">Could not open this conversation</p><p class="empty-sub">${esc(state.threadError)}</p></div></div>`;
    return;
  }
  const t = state.thread;
  if (!t) return;
  const L = t.labels;
  const arch = backend.archId;
  const starred = L.has('STARRED');
  const last = t.messages.at(-1);
  const replyTo = isMine(last.from.email) ? last.to[0] : (last.replyTo[0] || last.from);
  const tags = [];
  if (L.has('TRASH')) tags.push('Trash');
  else if (L.has('SPAM')) tags.push('Spam');
  else if (L.has(arch)) tags.push('Archived');
  else if (L.has('INBOX')) tags.push('Inbox');
  const actions = L.has('TRASH')
    ? `<button class="tool" data-action="untrash" title="Restore">${icon('restore')}<span>Restore</span></button>`
    : `${L.has(arch)
        ? `<button class="tool" data-action="unarchive" title="Move to inbox">${icon('inbox')}<span>To inbox</span></button>`
        : `<button class="tool" data-action="archive" title="Archive (E)">${icon('archive')}<span>Archive</span></button>`}
       ${L.has('SPAM')
        ? `<button class="tool" data-action="notspam" title="Not spam">${icon('inbox')}<span>Not spam</span></button>`
        : `<button class="tool" data-action="spam" title="Report spam">${icon('alert')}<span>Spam</span></button>`}
       <button class="tool" data-action="trash" title="Move to trash (#)">${icon('trash')}<span>Trash</span></button>`;

  reader.innerHTML = `<div class="thread">
    <div class="thread-bar">
      <button class="icon-btn back-btn" data-action="close-thread" aria-label="Back to list" title="Back (U)">${icon('back')}</button>
      <div class="tools">${actions}
        <span class="tool-sep" aria-hidden="true"></span>
        <button class="tool icon-only ${starred ? 'on' : ''}" data-action="star" aria-pressed="${starred}" title="${starred ? 'Remove star' : 'Star'} (S)">${icon('star', starred ? 'filled' : '')}</button>
        <button class="tool icon-only" data-action="unread" title="Mark unread (Shift U)">${icon('mail')}</button>
      </div>
    </div>
    <div class="thread-scroll" id="thread-scroll">
      <div class="thread-wrap">
        <header class="thread-head">
          <h1 class="thread-title">${esc(t.subject)}</h1>
          <div class="thread-meta">${[...tags, plural(t.messages.length, 'message'), relative(last.date)].map((x) => `<span>${esc(x)}</span>`).join('<span aria-hidden="true">·</span>')}</div>
        </header>
        ${t.messages.map(renderMessage).join('')}
        <div class="quick-reply">
          ${avatar({ name: CONFIG.displayName, email: ADDRESS }, 'sm')}
          <button class="quick-field" data-action="reply" data-mid="${esc(last.id)}">Reply to ${esc(firstNameOf(replyTo))}</button>
          <button class="icon-btn" data-action="forward" data-mid="${esc(last.id)}" aria-label="Forward" title="Forward (F)">${icon('forward')}</button>
        </div>
      </div>
    </div>
  </div>`;
  mountFrames();
}

function mountFrames() {
  $$('iframe.mail-frame').forEach((frame) => {
    const m = state.thread?.messages.find((x) => x.id === frame.dataset.mid);
    if (!m) return;
    const fit = () => {
      try {
        const d = frame.contentDocument;
        if (d?.body) frame.style.height = `${Math.max(48, d.documentElement.scrollHeight)}px`;
      } catch {}
    };
    frame.addEventListener('load', () => {
      fit();
      try {
        frame.contentDocument.addEventListener('load', fit, true);
        new ResizeObserver(fit).observe(frame.contentDocument.body);
      } catch {}
      setTimeout(fit, 250);
      setTimeout(fit, 1200);
    });
    frame.srcdoc = frameDoc(m.html, state.showImages.has(m.id));
  });
}

/* ------------------------------------------------------------------ */
/* Data flows                                                          */
/* ------------------------------------------------------------------ */

async function loadList({ silent = false, more = false } = {}) {
  const seq = ++listSeq;
  if (more) state.loadingMore = true;
  else {
    state.loading = true;
    if (!silent) { state.threads = []; state.next = null; state.error = null; }
  }
  renderList();
  renderListHead();
  try {
    const r = await backend.list(VIEWS[state.view], more ? state.next : null, state.search);
    if (seq !== listSeq) return;
    state.threads = more ? state.threads.concat(r.threads) : r.threads;
    state.next = r.next;
    state.error = null;
  } catch (e) {
    if (seq !== listSeq) return;
    if (!handleError(e, null, silent)) state.error = e.message;
  } finally {
    if (seq === listSeq) {
      state.loading = false;
      state.loadingMore = false;
      renderList();
      renderListHead();
      if (!state.selected) renderReader();
    }
  }
}

async function loadCounts() {
  try {
    const [inbox, spam] = await Promise.all([backend.count(VIEWS.inbox), backend.count(VIEWS.spam)]);
    state.counts = { inbox, spam };
    renderNav();
    updateTitle();
    if (!state.selected) renderReader();
  } catch (e) {
    handleError(e, null, true);
  }
}

function updateTitle() {
  const n = state.counts.inbox || 0;
  document.title = `${n ? `(${n}) ` : ''}${state.search ? 'Search' : VIEWS[state.view].name} · contact@`;
}

async function openThread(id, { keep = false } = {}) {
  const seq = ++threadSeq;
  if (!keep) {
    state.selected = id;
    state.thread = null;
    state.threadError = null;
    state.expanded.clear();
    state.threadLoading = true;
    renderList();
    renderReader();
  }
  try {
    const t = await backend.thread(id);
    if (seq !== threadSeq || state.selected !== id) return;
    t.messages.forEach((m, i) => { if (m.labelIds.includes('UNREAD') && i < t.messages.length - 1) state.expanded.add(m.id); });
    state.thread = t;
    state.threadLoading = false;
    renderReader();
    const s = state.threads.find((x) => x.id === id);
    if (t.labels.has('UNREAD')) {
      if (s) { s.unread = false; renderList(); renderListHead(); }
      t.labels.delete('UNREAD');
      backend.modify(id, [], ['UNREAD']).then(loadCounts).catch((e) => handleError(e, null, true));
    }
  } catch (e) {
    if (seq !== threadSeq) return;
    state.threadLoading = false;
    if (!handleError(e)) { state.threadError = e.message; renderReader(); }
  }
}

function closeThread() {
  state.selected = null;
  state.thread = null;
  state.threadError = null;
  threadSeq++;
  renderList();
  renderReader();
}

function setView(id) {
  if (!VIEWS[id]) return;
  state.view = id;
  state.search = '';
  const input = $('#search');
  if (input) input.value = '';
  closeThread();
  renderNav();
  updateTitle();
  loadList();
}

function setSearch(value) {
  const v = oneLine(value).slice(0, 200);
  if (v === state.search) return;
  state.search = v;
  closeThread();
  renderNav();
  updateTitle();
  loadList();
}

function refreshAll() {
  loadList({ silent: true });
  loadCounts();
  if (state.selected) openThread(state.selected, { keep: true });
}

function move(delta) {
  if (!state.threads.length) return;
  const idx = state.threads.findIndex((t) => t.id === state.selected);
  const next = idx < 0 ? 0 : Math.min(state.threads.length - 1, Math.max(0, idx + delta));
  if (next === idx) return;
  const id = state.threads[next].id;
  openThread(id);
  $(`.row[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest' });
}

function dropThread(id, remove) {
  if (remove) state.threads = state.threads.filter((t) => t.id !== id);
  if (state.selected === id && remove) closeThread();
  else { renderList(); renderReader(); }
  renderListHead();
}

async function act(kind, id = state.selected) {
  if (!id) return;
  const B = backend;
  const arch = B.archId;
  const summary = state.threads.find((t) => t.id === id);
  const labels = state.thread?.id === id ? state.thread.labels : summary?.labels || new Set();
  const moves = {
    archive: { add: [arch], remove: ['INBOX'], msg: 'Archived', drop: state.view === 'inbox' },
    unarchive: { add: ['INBOX'], remove: [arch], msg: 'Moved to Inbox', drop: state.view === 'archive' },
    spam: { add: ['SPAM'], remove: ['INBOX'], msg: 'Reported as spam', drop: state.view !== 'spam' },
    notspam: { add: ['INBOX'], remove: ['SPAM'], msg: 'Moved out of spam', drop: state.view === 'spam' },
  };
  try {
    if (kind === 'trash' || kind === 'untrash') {
      const trashing = kind === 'trash';
      dropThread(id, trashing ? state.view !== 'trash' : state.view === 'trash');
      await (trashing ? B.trash(id) : B.untrash(id));
      toast(trashing ? 'Moved to trash' : 'Restored from trash', {
        undo: async () => { await (trashing ? B.untrash(id) : B.trash(id)); refreshAll(); },
      });
    } else if (moves[kind]) {
      const m = moves[kind];
      if (!m.drop) { m.add.forEach((l) => labels.add(l)); m.remove.forEach((l) => labels.delete(l)); }
      dropThread(id, m.drop);
      await B.modify(id, m.add, m.remove);
      toast(m.msg, { undo: async () => { await B.modify(id, m.remove, m.add); refreshAll(); } });
    } else if (kind === 'star') {
      const on = !(summary ? summary.starred : labels.has('STARRED'));
      await B.modify(id, on ? ['STARRED'] : [], on ? [] : ['STARRED']);
      if (summary) summary.starred = on;
      if (state.thread?.id === id) { if (on) state.thread.labels.add('STARRED'); else state.thread.labels.delete('STARRED'); }
      if (state.view === 'starred' && !on && !state.search) dropThread(id, true);
      else { renderList(); renderReader(); }
      toast(on ? 'Starred' : 'Star removed');
    } else if (kind === 'unread') {
      await B.modify(id, ['UNREAD'], []);
      if (summary) summary.unread = true;
      closeThread();
      renderListHead();
      toast('Marked as unread');
    }
    loadCounts();
  } catch (e) {
    handleError(e);
    refreshAll();
  }
}

async function downloadAttachment(mid, idx) {
  const m = state.thread?.messages.find((x) => x.id === mid);
  const a = m?.attachments[idx];
  if (!a) return;
  try {
    const bytes = a.data ? b64urlToBytes(a.data) : await backend.attachment(m.id, a.attachmentId);
    const url = URL.createObjectURL(new Blob([bytes], { type: a.mimeType || 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = a.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (e) {
    handleError(e, 'Download failed');
  }
}

/* ------------------------------------------------------------------ */
/* Compose                                                             */
/* ------------------------------------------------------------------ */

const DRAFT_KEY = 'cm-draft';
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } }
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} }
const saveDraft = debounce(() => {
  const c = state.compose;
  if (!c || c.mode !== 'new') return;
  try {
    if (c.to || c.cc || c.subject || c.body) localStorage.setItem(DRAFT_KEY, JSON.stringify({ to: c.to, cc: c.cc, showCc: c.showCc, subject: c.subject, body: c.body }));
    else clearDraft();
  } catch {}
}, 400);

const bodyText = (m) => m.text || htmlToText(m.html || '') || m.snippet || '';
const composeHasContent = (c) => !!(c && (c.body.trim() || c.files.length || (c.mode === 'new' && (c.to || c.subject))));

function openCompose(mode = 'new', mid = null) {
  const cur = state.compose;
  if (cur && cur.mode !== 'new' && composeHasContent(cur) && !confirm('Discard the reply you are writing?')) return;
  const t = state.thread;
  const m = t ? (mid ? t.messages.find((x) => x.id === mid) : t.messages.at(-1)) : null;
  const c = { mode, to: '', cc: '', showCc: false, subject: '', body: '', quote: null, threadId: null, inReplyTo: '', references: '', files: [], sending: false, mini: false };
  if (mode === 'new' || !m) {
    c.mode = 'new';
    const saved = loadDraft();
    if (saved) Object.assign(c, saved);
  } else {
    const subj = t.subject || m.subject || '';
    if (mode === 'forward') {
      c.subject = /^fwd?:/i.test(subj) ? subj : `Fwd: ${subj}`;
      c.quote = {
        kind: 'forward',
        head: ['---------- Forwarded message ----------', `From: ${fmtAddr(m.from)}`, `Date: ${fmtFull.format(m.date)}`, `Subject: ${m.subject}`, `To: ${m.to.map(fmtAddr).join(', ')}`].join('\n'),
        text: bodyText(m),
      };
    } else {
      c.subject = /^re:/i.test(subj) ? subj : `Re: ${subj}`;
      const primary = isMine(m.from.email) ? m.to : (m.replyTo.length ? m.replyTo : [m.from]);
      c.to = primary.map(fmtAddr).join(', ');
      if (mode === 'replyAll') {
        const seen = new Set(primary.map((p) => p.email));
        const rest = [...m.to, ...m.cc].filter((p) => p.email && !isMine(p.email) && !seen.has(p.email) && seen.add(p.email));
        c.cc = rest.map(fmtAddr).join(', ');
        c.showCc = !!rest.length;
      }
      c.threadId = t.id;
      c.inReplyTo = m.messageId;
      c.references = [m.references, m.messageId].filter(Boolean).join(' ').trim();
      c.quote = { kind: 'reply', head: `On ${fmtFull.format(m.date)}, ${fmtAddr(m.from)} wrote:`, text: bodyText(m) };
    }
  }
  state.compose = c;
  renderCompose();
  const focusSel = c.mode === 'new' ? (c.to ? '[name="body"]' : '[name="to"]') : c.mode === 'forward' ? '[name="to"]' : '[name="body"]';
  requestAnimationFrame(() => $(`#compose-root ${focusSel}`)?.focus());
}

function renderCompose() {
  const root = $('#compose-root');
  const c = state.compose;
  if (!c) { root.innerHTML = ''; return; }
  const title = c.mode === 'new' ? (c.subject || 'New message') : c.mode === 'forward' ? 'Forward' : c.mode === 'replyAll' ? 'Reply all' : 'Reply';
  if (c.mini) {
    root.innerHTML = `<div class="compose mini" role="dialog" aria-label="${esc(title)}">
      <header class="compose-head" data-action="compose-min"><span class="compose-title">${esc(title)}</span>
        <div class="compose-head-tools"><button class="icon-btn sm" data-action="compose-close" aria-label="Close">${icon('x')}</button></div></header></div>`;
    return;
  }
  const total = c.files.reduce((n, f) => n + f.size, 0);
  root.innerHTML = `<div class="compose" role="dialog" aria-label="${esc(title)}">
    <header class="compose-head">
      <span class="compose-title">${esc(title)}</span>
      <div class="compose-head-tools">
        <button class="icon-btn sm" data-action="compose-min" aria-label="Minimise">${icon('minus')}</button>
        <button class="icon-btn sm" data-action="compose-close" aria-label="Close">${icon('x')}</button>
      </div>
    </header>
    <div class="compose-body">
      ${backend.sendAsReady ? '' : `<p class="compose-warn">${icon('alert')}<span>${esc(CONFIG.address)} is not a verified "Send mail as" address in this Gmail account, so Gmail may send from ${esc(backend.me)} instead.</span></p>`}
      <div class="field"><span class="field-label">From</span><span class="field-static">${esc(backend.fromName)} <span class="muted">&lt;${esc(CONFIG.address)}&gt;</span></span></div>
      <div class="field"><label class="field-label" for="c-to">To</label><input id="c-to" name="to" value="${esc(c.to)}" autocomplete="off" spellcheck="false" placeholder="name@example.com">
        ${c.showCc ? '' : '<button class="link-btn" data-action="toggle-cc">Cc</button>'}</div>
      ${c.showCc ? `<div class="field"><label class="field-label" for="c-cc">Cc</label><input id="c-cc" name="cc" value="${esc(c.cc)}" autocomplete="off" spellcheck="false"></div>` : ''}
      <div class="field"><label class="field-label" for="c-subject">Subject</label><input id="c-subject" name="subject" value="${esc(c.subject)}" autocomplete="off"></div>
      <textarea name="body" aria-label="Message" placeholder="Write your message">${esc(c.body)}</textarea>
      ${c.quote ? `<details class="quoted"><summary>${c.quote.kind === 'forward' ? 'Forwarded message included' : 'Quoted message included'}</summary><pre>${esc(`${c.quote.head}\n\n${c.quote.text}`)}</pre></details>` : ''}
      ${c.files.length ? `<div class="files">${c.files.map((f, i) => `<span class="file-chip">${icon('clip')}<span class="file-name">${esc(f.name)}</span><span class="muted">${esc(fmtSize(f.size))}</span><button class="icon-btn xs" data-action="remove-file" data-idx="${i}" aria-label="Remove ${esc(f.name)}">${icon('x')}</button></span>`).join('')}<span class="muted files-total">${esc(fmtSize(total))} of 15 MB</span></div>` : ''}
    </div>
    <footer class="compose-foot">
      <button class="btn primary" data-action="send" ${c.sending ? 'disabled' : ''}>${c.sending ? '<span>Sending</span><span class="spinner" aria-hidden="true"></span>' : `<span>Send</span>${icon('send')}`}</button>
      <label class="icon-btn" title="Attach files" aria-label="Attach files">${icon('clip')}<input type="file" id="c-files" multiple hidden></label>
      <span class="compose-hint"><kbd>Ctrl</kbd><kbd>Enter</kbd></span>
      <button class="icon-btn danger" data-action="compose-discard" aria-label="Discard" title="Discard">${icon('trash')}</button>
    </footer>
  </div>`;
  $('#c-files')?.addEventListener('change', (e) => { addFiles([...e.target.files]); e.target.value = ''; });
}

document.addEventListener('input', (e) => {
  const c = state.compose;
  const el = e.target;
  if (!c || !el.closest?.('#compose-root') || !el.name) return;
  if (['to', 'cc', 'subject', 'body'].includes(el.name)) {
    c[el.name] = el.value;
    if (el.name === 'subject' && c.mode === 'new') { const t = $('#compose-root .compose-title'); if (t) t.textContent = el.value || 'New message'; }
    saveDraft();
  }
});

async function addFiles(files) {
  const c = state.compose;
  if (!c) return;
  let total = c.files.reduce((n, f) => n + f.size, 0);
  for (const f of files) {
    if (total + f.size > MAX_ATTACH) { toast('Attachments are limited to 15 MB per message', { tone: 'error' }); break; }
    try {
      const b64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1] || '');
        r.onerror = () => reject(r.error);
        r.readAsDataURL(f);
      });
      c.files.push({ name: f.name, type: f.type, size: f.size, b64 });
      total += f.size;
    } catch {
      toast(`Could not read ${f.name}`, { tone: 'error' });
    }
  }
  renderCompose();
}

function buildMime({ fromName, to, cc, subject, text, html, inReplyTo, references, files }) {
  const head = [
    `From: ${encodeWord(oneLine(fromName))} <${CONFIG.address}>`,
    `To: ${oneLine(to)}`,
    cc ? `Cc: ${oneLine(cc)}` : '',
    `Subject: ${encodeWord(oneLine(subject))}`,
    'MIME-Version: 1.0',
    inReplyTo ? `In-Reply-To: ${oneLine(inReplyTo)}` : '',
    references ? `References: ${oneLine(references)}` : '',
  ].filter(Boolean);
  const alt = `alt_${rand()}`;
  const altBody = [
    `--${alt}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', wrap76(utf8B64(text)),
    `--${alt}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', wrap76(utf8B64(html)),
    `--${alt}--`, '',
  ].join('\r\n');
  if (!files.length) return [...head, `Content-Type: multipart/alternative; boundary="${alt}"`, '', altBody].join('\r\n');
  const mix = `mix_${rand()}`;
  const parts = [`--${mix}`, `Content-Type: multipart/alternative; boundary="${alt}"`, '', altBody];
  for (const f of files) {
    const name = encodeWord(oneLine(f.name).replace(/["\\]/g, ''));
    parts.push(`--${mix}`, `Content-Type: ${oneLine(f.type) || 'application/octet-stream'}; name="${name}"`, `Content-Disposition: attachment; filename="${name}"`, 'Content-Transfer-Encoding: base64', '', wrap76(f.b64));
  }
  parts.push(`--${mix}--`, '');
  return [...head, `Content-Type: multipart/mixed; boundary="${mix}"`, '', parts.join('\r\n')].join('\r\n');
}

async function sendCompose() {
  const c = state.compose;
  if (!c || c.sending) return;
  const to = c.to.trim();
  if (!parseList(to).some((p) => /.+@.+\..+/.test(p.email))) {
    toast('Add at least one valid recipient', { tone: 'error' });
    $('#compose-root [name="to"]')?.focus();
    return;
  }
  if (!c.subject.trim() && !c.body.trim() && !confirm('Send without a subject or message?')) return;
  const q = c.quote;
  const text = c.body + (q ? (q.kind === 'forward'
    ? `\n\n${q.head}\n\n${q.text}`
    : `\n\n${q.head}\n${q.text.split('\n').map((l) => `> ${l}`).join('\n')}`) : '');
  const quoteHtml = !q ? '' : q.kind === 'forward'
    ? `<br><div style="color:#555555;font-family:Arial,sans-serif;font-size:13px">${esc(q.head).replace(/\n/g, '<br>')}</div><br>${textToHtml(q.text)}`
    : `<br><div style="color:#555555;font-family:Arial,sans-serif;font-size:13px">${esc(q.head)}</div><blockquote style="margin:6px 0 0 6px;border-left:2px solid #d0d0d0;padding-left:12px;color:#555555">${textToHtml(q.text)}</blockquote>`;
  const mime = buildMime({
    fromName: backend.fromName, to, cc: c.cc.trim(), subject: c.subject.trim() || '(no subject)', text,
    html: textToHtml(c.body) + quoteHtml, inReplyTo: c.inReplyTo, references: c.references, files: c.files,
  });
  c.sending = true;
  renderCompose();
  try {
    await backend.send({ mime, threadId: c.threadId, meta: { to, cc: c.cc.trim(), subject: c.subject.trim() || '(no subject)', text } });
    if (c.mode === 'new') clearDraft();
    state.compose = null;
    renderCompose();
    toast('Message sent');
    if (c.threadId && state.selected === c.threadId) openThread(c.threadId, { keep: true });
    loadList({ silent: true });
  } catch (e) {
    c.sending = false;
    renderCompose();
    handleError(e, 'Not sent');
  }
}

function closeCompose(discard) {
  const c = state.compose;
  if (!c) return;
  if (discard) {
    if (composeHasContent(c) && !confirm('Discard this message?')) return;
    if (c.mode === 'new') clearDraft();
  } else if (c.mode !== 'new' && composeHasContent(c) && !confirm('Discard the reply you are writing?')) {
    return;
  }
  state.compose = null;
  renderCompose();
}

/* ------------------------------------------------------------------ */
/* Toasts and help                                                     */
/* ------------------------------------------------------------------ */

function toast(msg, { tone = '', undo = null } = {}) {
  const root = $('#toasts');
  const el = document.createElement('div');
  el.className = `toast ${tone}`;
  el.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button class="toast-btn">Undo</button>' : ''}`;
  if (undo) {
    el.querySelector('button').addEventListener('click', async () => {
      el.remove();
      try { await undo(); } catch (e) { handleError(e); }
    });
  }
  root.appendChild(el);
  while (root.children.length > 3) root.firstElementChild.remove();
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 260); }, undo ? 6500 : tone === 'error' ? 6000 : 3600);
}

function renderHelp() {
  const root = $('#help-root');
  if (!state.help) { root.innerHTML = ''; return; }
  root.innerHTML = `<div class="overlay" data-action="close-help">
    <div class="help" role="dialog" aria-label="Keyboard shortcuts" data-stop>
      <header class="help-head"><h2>Shortcuts</h2><button class="icon-btn sm" data-action="close-help" aria-label="Close">${icon('x')}</button></header>
      <dl class="help-list">${SHORTCUTS.map(([k, d]) => `<div><dt>${k.split(/\s+/).map((x) => `<kbd>${esc(x)}</kbd>`).join('')}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Errors and session                                                  */
/* ------------------------------------------------------------------ */

function handleError(e, prefix = null, quiet = false) {
  if (e instanceof AuthError) {
    if (!PREVIEW) renderLock({ resume: true });
    return true;
  }
  console.error(e);
  if (!quiet) toast(prefix ? `${prefix}: ${e.message}` : e.message, { tone: 'error' });
  return false;
}

async function signIn(prompt = '') {
  const resume = !!state.ready;
  renderLock({ busy: true, resume });
  try {
    await Auth.request(prompt);
    if (!state.ready) {
      const info = await backend.init();
      state.account = info.email;
      state.ready = true;
      hideLock();
      renderApp();
      await Promise.all([loadList(), loadCounts()]);
    } else {
      hideLock();
      refreshAll();
    }
  } catch (e) {
    renderLock({ error: e.message, resume });
  }
}

function signOut() {
  if (PREVIEW) { location.href = location.pathname; return; }
  Auth.revoke();
  state.ready = false;
  state.threads = [];
  state.compose = null;
  closeThread();
  $('#app').innerHTML = '';
  renderCompose();
  renderLock();
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

const ACTIONS = {
  signin: () => signIn(''),
  signout: () => signOut(),
  theme: () => toggleTheme(),
  help: () => { state.help = true; renderHelp(); },
  'close-help': (el, e) => { if (el.classList.contains('overlay') && e.target.closest('[data-stop]')) return; state.help = false; renderHelp(); },
  view: (el) => setView(el.dataset.view),
  open: (el) => openThread(el.dataset.id),
  'close-thread': () => closeThread(),
  refresh: () => refreshAll(),
  more: () => loadList({ more: true }),
  archive: () => act('archive'),
  unarchive: () => act('unarchive'),
  trash: () => act('trash'),
  untrash: () => act('untrash'),
  spam: () => act('spam'),
  notspam: () => act('notspam'),
  star: () => act('star'),
  unread: () => act('unread'),
  'toggle-msg': (el) => { const id = el.dataset.mid; if (state.expanded.has(id)) state.expanded.delete(id); else state.expanded.add(id); renderReader(); },
  'show-images': (el) => { state.showImages.add(el.dataset.mid); renderReader(); },
  download: (el) => downloadAttachment(el.dataset.mid, Number(el.dataset.idx)),
  reply: (el) => openCompose('reply', el.dataset.mid),
  'reply-all': (el) => openCompose('replyAll', el.dataset.mid),
  forward: (el) => openCompose('forward', el.dataset.mid),
  compose: () => openCompose('new'),
  'compose-min': (el, e) => { if (e.target.closest('[data-action="compose-close"]')) return; state.compose.mini = !state.compose.mini; renderCompose(); },
  'compose-close': () => closeCompose(false),
  'compose-discard': () => closeCompose(true),
  'toggle-cc': () => { state.compose.showCc = true; renderCompose(); $('#c-cc')?.focus(); },
  'remove-file': (el) => { state.compose.files.splice(Number(el.dataset.idx), 1); renderCompose(); },
  send: () => sendCompose(),
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  if (el.tagName === 'A') return;
  e.preventDefault();
  fn(el, e);
});

document.addEventListener('keydown', (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if (e.key === 'Enter' && e.target.matches?.('[data-action="toggle-msg"]')) { e.preventDefault(); ACTIONS['toggle-msg'](e.target); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && state.compose) { e.preventDefault(); sendCompose(); return; }
  if (e.key === 'Escape') {
    if (state.help) { state.help = false; renderHelp(); return; }
    if (state.compose && !state.compose.mini) { state.compose.mini = true; renderCompose(); return; }
    if (!typing && state.selected) { closeThread(); return; }
    return;
  }
  if (typing || e.ctrlKey || e.metaKey || e.altKey || !state.ready || !$('#lock').hidden) return;
  const k = e.key;
  const map = {
    c: () => openCompose('new'),
    '/': () => $('#search')?.focus(),
    j: () => move(1),
    k: () => move(-1),
    u: () => closeThread(),
    U: () => act('unread'),
    e: () => act(state.thread?.labels.has(backend.archId) ? 'unarchive' : 'archive'),
    s: () => act('star'),
    '#': () => act(state.thread?.labels.has('TRASH') ? 'untrash' : 'trash'),
    r: () => state.thread && openCompose('reply'),
    a: () => state.thread && openCompose('replyAll'),
    f: () => state.thread && openCompose('forward'),
    '?': () => { state.help = !state.help; renderHelp(); },
  };
  if (map[k]) { e.preventDefault(); map[k](); }
});

setInterval(() => {
  if (document.hidden || !state.ready || (!PREVIEW && !Auth.valid())) return;
  if (!state.loading && !state.loadingMore && state.threads.length <= PAGE) loadList({ silent: true });
  loadCounts();
}, 60000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.ready && (PREVIEW || Auth.valid())) { loadList({ silent: true }); loadCounts(); }
});

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

async function boot() {
  if (PREVIEW) {
    const info = await backend.init();
    state.account = info.email;
    state.ready = true;
    hideLock();
    renderApp();
    await Promise.all([loadList(), loadCounts()]);
    const params = new URLSearchParams(location.search);
    if (params.get('open')) await openThread(params.get('open'));
    if (params.get('compose')) openCompose(params.get('compose'));
    return;
  }
  renderLock();
  if (!CONFIG.clientId) return;
  try {
    await Auth.init();
    state.gisReady = true;
    renderLock();
  } catch (e) {
    renderLock({ error: e.message });
  }
}

boot();
