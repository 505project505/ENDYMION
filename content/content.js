// ============================================================
// 𝄞 𝑬𝑵𝑫𝒀𝑴𝑰𝑶𝑵 — Content Script v1.0.0
// Combines DOM + API + cache (highest wins)
// ============================================================

(function () {
  'use strict';

  const CHANNEL = 'arithius-v6ll9v';
  const QUEST_URL_RE = /discord\.com\/(quest-home|quests|channels\/@me\/quests)/;

  const ICONS = {
    logo: '<span class="endymion-mark" aria-label="ENDYMION mark">𝄞</span>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>',
    skip: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8-6-8-6v12zM16 6v12h2V6h-2z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3a5.5 5.5 0 0 0 5 4.9V11a8.5 8.5 0 0 1-5-1.6v6.1a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a3 3 0 1 0 2 2.8V3h3z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 5.3a16 16 0 0 0-4-1.2l-.2.4c1.5.4 2.2.9 2.2.9a13 13 0 0 0-5.4-1 13 13 0 0 0-5.4 1s.7-.5 2.2-.9l-.2-.4a16 16 0 0 0-4 1.2C2.2 8.6 1.6 12 1.9 15.3a16 16 0 0 0 4.9 2.5l1-1.4c-.6-.2-1.1-.5-1.6-.8l.4-.3a11.4 11.4 0 0 0 9.8 0l.4.3c-.5.3-1 .6-1.6.8l1 1.4a16 16 0 0 0 4.9-2.5c.4-3.9-.6-7.3-2.8-10zM8.7 13.9c-.9 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.7.9 1.7 1.9-.8 1.9-1.7 1.9zm6.6 0c-.9 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.7.9 1.7 1.9-.8 1.9-1.7 1.9z"/></svg>'
  };


  // ============================================================
  // v1.0 — اللغة (عربي / English)
  // ============================================================
  const SETTINGS = window.ENDYMION_SETTINGS || {};
  const BRAND = SETTINGS.name || '𝑬𝑵𝑫𝒀𝑴𝑰𝑶𝑵';
  const INVITE_CODE = (SETTINGS.discordInviteUrl || 'https://discord.gg/yYUQKpzzBy').split('/').pop();
  const INVITE_URL = SETTINGS.discordInviteUrl || 'https://discord.gg/yYUQKpzzBy';
  const CREDITS = { discord: SETTINGS.discordUsername || 'v6ll9v1', instagram: SETTINGS.instagramUsername || 'v6ll9v1', tiktok: SETTINGS.tiktokUsername || 'n6w9v' };

  const EN = {
    'تشغيل': 'Run', 'إيقاف': 'Stop', 'تخطي': 'Skip', 'تحديث': 'Refresh',
    'إعادة فحص المهام': 'Rescan quests',
    'ترتيب التنفيذ': 'Run order', 'سرعة الفيديو': 'Video speed',
    'الفيديو أولاً': 'Videos first', 'أقرب انتهاء': 'Ends soonest', 'الألعاب': 'Games',
    'الأقرب للانتهاء': 'Closest to done',
    'خارق': 'Ultra', 'سريع': 'Fast', 'عادي': 'Normal',
    'في انتظار التحميل': 'Loading…', 'لا توجد مهام': 'No quests',
    'انقر مرتين لإعادة ضبط الحجم': 'Double-click to reset size',
    'اسحب لتغيير الحجم': 'Drag to resize',
    'تم إعادة ضبط اللوحة': 'Panel reset', 'متوقف': 'Stopped', 'جاري التحديث…': 'Refreshing…',
    'جاري الفحص': 'Scanning', 'لا مهام قابلة للتنفيذ': 'No runnable quests',
    'غير نشط': 'Idle',
    'الخادم لا يحتسب التقدم — غالباً هذه المهمة تحتاج تطبيق سطح المكتب':
      'Server is not counting progress — this quest probably needs the desktop app',
    'مقفل — انضم للسيرفر لتفعيل الإضافة': 'Locked — join the server to unlock',
    'جاري التحقق من العضوية…': 'Checking membership…',
    'انضم للسيرفر': 'Join server', 'تحقق': 'Verify',
    'يجب أن تكون عضواً في السيرفر حتى تعمل الإضافة.':
      'You must be a member of the server for this extension to work.',
    'تعذّر التحقق من العضوية، حاول مرة أخرى.': 'Could not verify membership, try again.',
    'تم نسخ اسم المستخدم': 'Username copied',
    'إبلاغ': 'Report',
    'إبلاغ عن مشكلة للمطوّر': 'Report a problem to the developer',
    'سيتم إرسال طلب صداقة من حسابك إلى المطوّر (v6ll9v1) ليتمكن من التواصل معك بخصوص المشكلة. هل تريد المتابعة؟':
      'Discord will open so you can contact the developer and report the problem yourself. Continue?',
    'إبلاغ عن مشكلة': 'Report a problem', 'إرسال الطلب': 'Send request', 'إلغاء': 'Cancel',
    'تم فتح Discord للتواصل مع المطوّر': 'Discord opened to contact the developer',
    'تعذّر فتح Discord، ابحث عن: v6ll9v1': 'Could not open Discord — search for: v6ll9v1'
  };
  const EN_PREFIX = [
    ['مشاهدة: ', 'Watching: '], ['تشغيل: ', 'Running: '], ['فتح النشاط: ', 'Opening activity: '],
    ['تسجيل: ', 'Enrolling: '], ['انتهت مهلة المهمة: ', 'Quest timed out: '],
    ['اكتملت: ', 'Completed: '], ['تم التخطي: ', 'Skipped: '], ['فشلت: ', 'Failed: '],
    ['نوع غير مدعوم: ', 'Unsupported type: '], ['خطأ: ', 'Error: '],
    ['فشل heartbeat (', 'Heartbeat failed ('],
    ['العب النشاط يدوياً (الإنجاز يمنحه خادم اللعبة): ', 'Play the activity manually (the game server grants completion): ']
  ];
  function tr(s) {
    if (state.lang !== 'en' || typeof s !== 'string') return s;
    if (EN[s] !== undefined) return EN[s];
    for (let i = 0; i < EN_PREFIX.length; i++) {
      if (s.indexOf(EN_PREFIX[i][0]) === 0) return EN_PREFIX[i][1] + s.slice(EN_PREFIX[i][0].length);
    }
    let m = /^وُجد (\d+) مهمة$/.exec(s);
    if (m) return 'Found ' + m[1] + ' quests';
    m = /^انتهى — (\d+)\/(\d+) مكتملة$/.exec(s);
    if (m) return 'Done — ' + m[1] + '/' + m[2] + ' completed';
    return s;
  }

  const state = {
    lang: 'ar',
    navSafe: false,
    resume: false,
    retryCount: 0,
    hadFailed: false,
    member: null,
    memberTs: 0,
    memberErr: null,
    enabled: true,
    autoStart: true,
    sortMode: 'expiry_asc',
    videoSpeed: 'fast',
    isProcessing: false,
    uiRoot: null,
    statusEl: null,
    listEl: null,
    diagEl: null,
    panelEl: null,
    lastUrl: location.href,
    generation: 0,
    observer: null,
    observerDebounce: null,
    booted: false,
    autoStarted: false,
    currentQuests: [],
    activeQuestId: null,
    stopped: false,
    skipCurrent: false,
    questStatus: new Map(),
    mobileUAOn: false,
    launched: new Set(),
    autoStartTimer: null,
    lastAutoTs: 0,
    wakers: new Set()
  };

  let reqCounter = 0;
  const pending = new Map();

  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    if (!event.data || event.data.source !== CHANNEL + '-response') return;
    const { requestId, result } = event.data;
    const r = pending.get(requestId);
    if (r) { pending.delete(requestId); r(result); }
  });

  function callInject(type, payload) {
    payload = payload || {};
    return new Promise(function (resolve) {
      const requestId = CHANNEL + '-' + ++reqCounter + '-' + Date.now();
      pending.set(requestId, resolve);
      window.postMessage({
        source: CHANNEL, type: type, payload: payload, requestId: requestId
      }, '*');
      setTimeout(function () {
        if (pending.has(requestId)) {
          pending.delete(requestId);
          resolve({ ok: false, error: 'Timeout' });
        }
      }, 15000);
    });
  }

  async function setMobileUA(enabled) {
    if (state.mobileUAOn === enabled) return;
    state.mobileUAOn = enabled;
    try {
      await chrome.runtime.sendMessage({
        type: 'ARITHIUS_TOGGLE_MOBILE_UA',
        enabled: enabled
      });
    } catch (_) {}
  }

  function log() {
    const args = Array.prototype.slice.call(arguments);
    console.log.apply(console,
      ['%c[ENDYMION]', 'color:#c9a961;font-weight:bold'].concat(args));
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // نوم قابل للإيقاف الفوري (إيقاف/تخطي) بدون تأخير
  function interruptibleSleep(ms) {
    return new Promise(function (resolve) {
      let timer = null;
      const done = function () {
        if (timer) clearTimeout(timer);
        state.wakers.delete(done);
        resolve();
      };
      state.wakers.add(done);
      timer = setTimeout(done, ms);
    });
  }
  function wakeAll() {
    Array.from(state.wakers).forEach(function (fn) { try { fn(); } catch (_) {} });
  }
  function hashStr(s) {
    let h = 5381;
    s = String(s);
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  // ============================================================
  // Persistent progress cache
  // ============================================================
  let progressCache = {};
  let progressSaveTimer = null;
  const PROGRESS_KEY = 'arithius_progress_cache_v2';
  const PROGRESS_MAX_AGE = 24 * 60 * 60 * 1000;

  function loadProgressCache(cb) {
    chrome.storage.local.get([PROGRESS_KEY], function (res) {
      const cache = res[PROGRESS_KEY] || {};
      const now = Date.now();
      progressCache = {};
      for (const k in cache) {
        if (cache[k] && (now - cache[k].ts) < PROGRESS_MAX_AGE) {
          progressCache[k] = cache[k];
        }
      }
      log('Cache loaded:', Object.keys(progressCache).length, 'entries');
      if (cb) cb();
    });
  }

  function saveProgressCache() {
    if (progressSaveTimer) clearTimeout(progressSaveTimer);
    progressSaveTimer = setTimeout(function () {
      chrome.storage.local.set({ [PROGRESS_KEY]: progressCache });
    }, 1000);
  }

  function setCachedProgress(questId, pct) {
    if (!questId) return;
    const now = Date.now();
    const existing = progressCache[questId];
    if (existing && existing.pct >= pct && (now - existing.ts) < PROGRESS_MAX_AGE) {
      return;
    }
    progressCache[questId] = { pct: pct, ts: now };
    saveProgressCache();
  }

  function getCachedProgress(questId) {
    if (!questId) return 0;
    const entry = progressCache[questId];
    if (!entry) return 0;
    if ((Date.now() - entry.ts) > PROGRESS_MAX_AGE) {
      delete progressCache[questId];
      return 0;
    }
    return entry.pct || 0;
  }

  // ============================================================
  // Layout helpers
  // ============================================================
  function clampLayout(layout, panelMinW, panelMinH) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(Math.max(layout.width || 380, panelMinW), vw - 20);
    const h = Math.min(Math.max(layout.height || 660, panelMinH), vh - 40);
    const left = Math.max(10, Math.min(layout.left, vw - w - 10));
    const top = Math.max(10, Math.min(layout.top, vh - h - 10));
    return { left: left, top: top, width: w, height: h, pinned: true };
  }

  function applyLayout(root, panel, layout) {
    if (!layout || !layout.pinned) return;
    const c = clampLayout(layout, 320, 420);
    root.style.left = c.left + 'px';
    root.style.top = c.top + 'px';
    root.style.right = 'auto';
    root.style.bottom = 'auto';
    panel.style.width = c.width + 'px';
    panel.style.height = c.height + 'px';
  }

  function saveLayout(root, panel) {
    const rect = panel.getBoundingClientRect();
    const clamped = clampLayout({
      left: rect.left, top: rect.top,
      width: rect.width, height: rect.height
    }, 320, 420);
    chrome.storage.local.set({ arithius_layout: clamped });
  }

  function loadLayout(root, panel, cb) {
    chrome.storage.local.get(['arithius_layout'], function (res) {
      const l = res.arithius_layout;
      if (l && l.pinned) applyLayout(root, panel, l);
      if (cb) cb();
    });
  }

  function resetLayout(root, panel) {
    root.style.left = 'auto';
    root.style.top = 'auto';
    root.style.right = '20px';
    root.style.bottom = '20px';
    panel.style.width = '380px';
    panel.style.height = '';
    panel.style.maxHeight = 'calc(100vh - 40px)';
    chrome.storage.local.remove('arithius_layout');
  }

  function makeDraggable(root, panel, handle) {
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    function start(e) {
      if (e.target.closest('#arithius-toggle, #arithius-lang, #arithius-report, button, a')) return;
      const pt = e.touches ? e.touches[0] : e;
      const rect = panel.getBoundingClientRect();
      startX = pt.clientX; startY = pt.clientY;
      startLeft = rect.left; startTop = rect.top;
      root.style.left = rect.left + 'px';
      root.style.top = rect.top + 'px';
      root.style.right = 'auto';
      root.style.bottom = 'auto';
      isDragging = true;
      root.classList.add('dragging');
      handle.classList.add('dragging');
      if (e.cancelable) e.preventDefault();
    }

    function move(e) {
      if (!isDragging) return;
      const pt = e.touches ? e.touches[0] : e;
      const rect = panel.getBoundingClientRect();
      const dx = pt.clientX - startX;
      const dy = pt.clientY - startY;
      const newLeft = Math.max(0, Math.min(window.innerWidth - rect.width, startLeft + dx));
      const newTop = Math.max(0, Math.min(window.innerHeight - 40, startTop + dy));
      root.style.left = newLeft + 'px';
      root.style.top = newTop + 'px';
      if (e.cancelable) e.preventDefault();
    }

    function end() {
      if (!isDragging) return;
      isDragging = false;
      root.classList.remove('dragging');
      handle.classList.remove('dragging');
      saveLayout(root, panel);
    }

    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
    document.addEventListener('touchcancel', end);
  }

  function makeResizable(root, panel, handle) {
    let isResizing = false;
    let startX = 0, startY = 0, startW = 0, startH = 0, startLeft = 0, startTop = 0;

    function start(e) {
      const pt = e.touches ? e.touches[0] : e;
      const rect = panel.getBoundingClientRect();
      startX = pt.clientX; startY = pt.clientY;
      startW = rect.width; startH = rect.height;
      startLeft = rect.left; startTop = rect.top;
      root.style.left = rect.left + 'px';
      root.style.top = rect.top + 'px';
      root.style.right = 'auto';
      root.style.bottom = 'auto';
      isResizing = true;
      root.classList.add('resizing');
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }

    function move(e) {
      if (!isResizing) return;
      const pt = e.touches ? e.touches[0] : e;
      const dx = startX - pt.clientX;
      const dy = pt.clientY - startY;
      const maxW = window.innerWidth - 20;
      const maxH = window.innerHeight - 20;
      const newW = Math.max(320, Math.min(maxW, startW + dx));
      const newH = Math.max(420, Math.min(maxH, startH + dy));
      const newLeft = Math.max(10, startLeft + (startW - newW));
      panel.style.width = newW + 'px';
      panel.style.height = newH + 'px';
      root.style.left = newLeft + 'px';
      root.style.top = startTop + 'px';
      if (e.cancelable) e.preventDefault();
    }

    function end() {
      if (!isResizing) return;
      isResizing = false;
      root.classList.remove('resizing');
      saveLayout(root, panel);
    }

    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
    document.addEventListener('touchcancel', end);
  }

  // ============================================================
  // UI
  // ============================================================

  // نافذة تأكيد بتصميم الإضافة (بدل نافذة المتصفح الافتراضية)
  function confirmModal(titleKey, msgKey, okKey, cancelKey) {
    return new Promise(function (resolve) {
      const root = state.uiRoot;
      if (!root) { resolve(false); return; }
      const old = root.querySelector('#arithius-modal');
      if (old) old.remove();
      const wrap = document.createElement('div');
      wrap.id = 'arithius-modal';
      wrap.setAttribute('dir', state.lang === 'en' ? 'ltr' : 'rtl');
      wrap.innerHTML =
        '<div class="arithius-modal-card" role="alertdialog">' +
        '<div class="arithius-modal-icon">' + ICONS.logo + '</div>' +
        '<div class="arithius-modal-title"></div>' +
        '<div class="arithius-modal-msg"></div>' +
        '<div class="arithius-modal-btns">' +
        '<button class="arithius-modal-ok"></button>' +
        '<button class="arithius-modal-cancel"></button>' +
        '</div></div>';
      wrap.querySelector('.arithius-modal-title').textContent = tr(titleKey);
      wrap.querySelector('.arithius-modal-msg').textContent = tr(msgKey);
      wrap.querySelector('.arithius-modal-ok').textContent = tr(okKey);
      wrap.querySelector('.arithius-modal-cancel').textContent = tr(cancelKey);
      function done(v) { document.removeEventListener('keydown', onKey, true); wrap.remove(); resolve(v); }
      function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); done(false); } }
      wrap.querySelector('.arithius-modal-ok').addEventListener('click', function () { done(true); });
      wrap.querySelector('.arithius-modal-cancel').addEventListener('click', function () { done(false); });
      wrap.addEventListener('click', function (e) { if (e.target === wrap) done(false); });
      document.addEventListener('keydown', onKey, true);
      root.appendChild(wrap);
    });
  }

  // ---- User-controlled appearance and optional controls ----
  const UI_DEFAULTS = {
    accent: '#c9a961', background: '#0f0f10', text: '#e8e8ea',
    hideRun: false, hideStop: false, hideSkip: false, hideRefresh: false,
    hideReport: false, hideJoin: false, hideVerify: false, hideSocial: false
  };

  function applyUICustomization(custom) {
    const root = state.uiRoot;
    if (!root) return;
    const c = Object.assign({}, UI_DEFAULTS, custom || {});
    const accent = /^#[0-9a-fA-F]{6}$/.test(c.accent) ? c.accent : UI_DEFAULTS.accent;
    const bg = /^#[0-9a-fA-F]{6}$/.test(c.background) ? c.background : UI_DEFAULTS.background;
    const fg = /^#[0-9a-fA-F]{6}$/.test(c.text) ? c.text : UI_DEFAULTS.text;
    const brighten = (hex, amount) => {
      const n = parseInt(hex.slice(1), 16);
      const r = Math.min(255, ((n >> 16) & 255) + amount);
      const g = Math.min(255, ((n >> 8) & 255) + amount);
      const b = Math.min(255, (n & 255) + amount);
      return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    };
    const darken = (hex, amount) => {
      const n = parseInt(hex.slice(1), 16);
      const r = Math.max(0, ((n >> 16) & 255) - amount);
      const g = Math.max(0, ((n >> 8) & 255) - amount);
      const b = Math.max(0, (n & 255) - amount);
      return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    };
    root.style.setProperty('--gold', accent);
    root.style.setProperty('--gold-bright', brighten(accent, 35));
    root.style.setProperty('--gold-dim', darken(accent, 55));
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--bg-2', brighten(bg, 8));
    root.style.setProperty('--bg-3', brighten(bg, 15));
    root.style.setProperty('--bg-4', brighten(bg, 22));
    root.style.setProperty('--text', fg);
    root.style.setProperty('--border', brighten(bg, 28));
    root.style.setProperty('--border-2', brighten(bg, 40));
    const logo = root.querySelector('#arithius-logo');
    if (logo) logo.style.color = accent;
    const hide = (selector, hidden) => {
      const el = root.querySelector(selector);
      if (el) el.style.display = hidden ? 'none' : '';
    };
    hide('#arithius-run', !!c.hideRun);
    hide('#arithius-stop', !!c.hideStop);
    hide('#arithius-skip', !!c.hideSkip);
    hide('#arithius-refresh', !!c.hideRefresh);
    hide('#arithius-report', !!c.hideReport);
    hide('#arithius-join', !!c.hideJoin);
    hide('#arithius-verify', !!c.hideVerify);
    const socials = root.querySelector('.arithius-social');
    if (socials) socials.style.display = c.hideSocial ? 'none' : '';
    root.classList.toggle('endymion-compact-actions', !!(c.hideRun || c.hideStop || c.hideSkip || c.hideRefresh));
  }

  function loadUICustomization() {
    try {
      chrome.storage.local.get(['endymion_ui'], function (res) {
        applyUICustomization(res && res.endymion_ui);
      });
    } catch (_) {}
  }

  function createUI() {
    if (state.uiRoot) return;

    const root = document.createElement('div');
    root.id = 'arithius-root';
    root.innerHTML =
      '<div id="arithius-panel">' +
      '<div id="arithius-header">' +
      '<span id="arithius-logo" style="color:#c9a961" data-tt="انقر مرتين لإعادة ضبط الحجم" title="انقر مرتين لإعادة ضبط الحجم">' + ICONS.logo + '</span>' +
      '<span id="arithius-title">' + BRAND + '</span>' +
      '<span id="arithius-badge">' + (SETTINGS.versionLabel || 'v1.0') + '</span>' +
      '<button id="arithius-lang" title="Language / اللغة">EN</button>' +
      '<button id="arithius-toggle" title="Collapse">' + ICONS.chevron + '</button>' +
      '</div>' +
      '<div class="arithius-body">' +
      '<div id="arithius-actions">' +
      '<button id="arithius-run" class="arithius-action">' + ICONS.play + '<span data-t="تشغيل">تشغيل</span></button>' +
      '<button id="arithius-stop" class="arithius-action">' + ICONS.stop + '<span data-t="إيقاف">إيقاف</span></button>' +
      '<button id="arithius-skip" class="arithius-action">' + ICONS.skip + '<span data-t="تخطي">تخطي</span></button>' +
      '<button id="arithius-refresh" class="arithius-action" data-tt="إعادة فحص المهام" title="إعادة فحص المهام">' + ICONS.refresh + '<span data-t="تحديث">تحديث</span></button>' +
      '</div>' +
      '<div id="arithius-controls">' +
      '<div class="arithius-ctrl-label" data-t="ترتيب التنفيذ">ترتيب التنفيذ</div>' +
      '<div class="arithius-seg" data-group="sort">' +
      '<button class="arithius-seg-btn" data-mode="video_first" data-t="الفيديو أولاً">الفيديو أولاً</button>' +
      '<button class="arithius-seg-btn" data-mode="expiry_asc" data-t="أقرب انتهاء">أقرب انتهاء</button>' +
      '<button class="arithius-seg-btn" data-mode="play_first" data-t="الألعاب">الألعاب</button>' +
      '<button class="arithius-seg-btn" data-mode="progress_desc" data-t="الأقرب للانتهاء">الأقرب للانتهاء</button>' +
      '</div>' +
      '<div class="arithius-ctrl-label" data-t="سرعة الفيديو">سرعة الفيديو</div>' +
      '<div class="arithius-seg" data-group="speed">' +
      '<button class="arithius-seg-btn" data-speed="turbo" data-t="خارق">خارق</button>' +
      '<button class="arithius-seg-btn" data-speed="fast" data-t="سريع">سريع</button>' +
      '<button class="arithius-seg-btn" data-speed="normal" data-t="عادي">عادي</button>' +
      '</div>' +
      '</div>' +
      '<div id="arithius-gate">' +
      '<div id="arithius-gate-msg"></div>' +
      '<div id="arithius-gate-btns">' +
      '<button id="arithius-join"><span data-t="انضم للسيرفر">انضم للسيرفر</span></button>' +
      '<button id="arithius-verify"><span data-t="تحقق">تحقق</span></button>' +
      '</div></div>' +
      '<div id="arithius-status" class="arithius-status-info">في انتظار التحميل</div>' +
      '<div id="arithius-diag"></div>' +
      '<div id="arithius-list"></div>' +
      '<div id="arithius-footer">' +
      '<span class="arithius-brand" style="letter-spacing:1px">' + BRAND + '</span>' +
      '<button id="arithius-report" data-tt="إبلاغ عن مشكلة للمطوّر" title="إبلاغ عن مشكلة للمطوّر"><span data-t="إبلاغ">إبلاغ</span></button>' +
      '<div class="arithius-social">' +
      '<a href="https://instagram.com/' + CREDITS.instagram + '" target="_blank" title="Instagram: ' + CREDITS.instagram + '">' + ICONS.instagram + '</a>' +
      '<a href="https://tiktok.com/@' + CREDITS.tiktok + '" target="_blank" title="TikTok: ' + CREDITS.tiktok + '">' + ICONS.tiktok + '</a>' +
      '<a href="#" id="arithius-discord-copy" title="Discord: ' + CREDITS.discord + '">' + ICONS.discord + '</a>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div id="arithius-resize" data-tt="اسحب لتغيير الحجم" title="اسحب لتغيير الحجم"></div>' +
      '</div>';

    (document.body || document.documentElement).appendChild(root);

    state.uiRoot = root;
    state.panelEl = root.querySelector('#arithius-panel');
    state.statusEl = root.querySelector('#arithius-status');
    state.listEl = root.querySelector('#arithius-list');
    state.diagEl = root.querySelector('#arithius-diag');
    loadUICustomization();

    root.querySelector('#arithius-lang').addEventListener('click', function (e) {
      e.stopPropagation();
      state.lang = state.lang === 'ar' ? 'en' : 'ar';
      chrome.storage.local.set({ arithius_lang: state.lang });
      applyLang();
    });
    async function sendDevRequest(e) {
      if (e) { e.stopPropagation(); e.preventDefault(); }
      if (!(await confirmModal('إبلاغ عن مشكلة', 'سيتم إرسال طلب صداقة من حسابك إلى المطوّر (v6ll9v1) ليتمكن من التواصل معك بخصوص المشكلة. هل تريد المتابعة؟', 'إرسال الطلب', 'إلغاء'))) return;
      const profile = SETTINGS.discordProfileUrl || 'https://discord.com/users/@me';
      const opened = window.open(profile, '_blank', 'noopener');
      if (opened) setStatus('تم فتح Discord للتواصل مع المطوّر', 'success');
      else setStatus('تعذّر فتح Discord، ابحث عن: ' + CREDITS.discord, 'warn');
    }
    root.querySelector('#arithius-report').addEventListener('click', sendDevRequest);
    root.querySelector('#arithius-discord-copy').addEventListener('click', sendDevRequest);
    root.querySelector('#arithius-join').addEventListener('click', function () {
      window.open(INVITE_URL, '_blank', 'noopener');
    });
    root.querySelector('#arithius-verify').addEventListener('click', function () {
      verifyMembership(true);
    });
    applyLang();

    const panel = state.panelEl;
    const header = root.querySelector('#arithius-header');
    const resizeHandle = root.querySelector('#arithius-resize');
    const logo = root.querySelector('#arithius-logo');

    loadLayout(root, panel);
    makeDraggable(root, panel, header);
    makeResizable(root, panel, resizeHandle);

    logo.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      resetLayout(root, panel);
      setStatus('تم إعادة ضبط اللوحة', 'success');
    });

    root.querySelector('#arithius-toggle').addEventListener('click', function (e) {
      e.stopPropagation();
      const wasCollapsed = root.classList.contains('arithius-collapsed');
      if (wasCollapsed) {
        root.classList.remove('arithius-collapsed');
        const savedH = root.dataset.savedHeight || '660';
        panel.style.height = savedH + 'px';
        panel.style.minHeight = '420px';
      } else {
        const rect = panel.getBoundingClientRect();
        root.dataset.savedHeight = String(Math.round(rect.height));
        root.classList.add('arithius-collapsed');
        panel.style.height = '56px';
        panel.style.minHeight = '56px';
      }
    });

    root.querySelector('#arithius-run').addEventListener('click', function () {
      state.stopped = false;
      state.retryCount = 0;
      autoLoop();
    });

    root.querySelector('#arithius-stop').addEventListener('click', function () {
      state.stopped = true;
      state.generation++;
      wakeAll();
      state.isProcessing = false;
      state.activeQuestId = null;
      setMobileUA(false);
      setStatus('متوقف', 'warn');
      updateControlsActive();
      if (progressSaveTimer) clearTimeout(progressSaveTimer);
      chrome.storage.local.set({ [PROGRESS_KEY]: progressCache });
      refreshAndRender();
    });

    // تحديث القائمة بدون إيقاف أي مهمة جارية
    root.querySelector('#arithius-refresh').addEventListener('click', function () {
      if (state.isProcessing) { renderQuestList(state.currentQuests); return; }
      setStatus('جاري التحديث…', 'info');
      refreshFromAPI();
    });

    root.querySelector('#arithius-skip').addEventListener('click', function () {
      if (state.isProcessing) { state.skipCurrent = true; wakeAll(); }
    });

    root.querySelectorAll('.arithius-seg-btn[data-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.sortMode = btn.dataset.mode;
        chrome.storage.local.set({ arithius_sort_mode: state.sortMode });
        updateControlsActive();
        if (state.currentQuests.length) renderQuestList(state.currentQuests);
      });
    });

    root.querySelectorAll('.arithius-seg-btn[data-speed]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.videoSpeed = btn.dataset.speed;
        chrome.storage.local.set({ arithius_video_speed: state.videoSpeed });
        updateControlsActive();
      });
    });

    root.querySelector('#arithius-list').addEventListener('click', function (e) {
      const el = e.target.closest('.arithius-quest');
      if (!el) return;
      const id = el.dataset.id;
      const q = state.currentQuests.find(function (x) { return x.id === id; });
      if (q) runSingle(q);
    });

    let resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        const rect = panel.getBoundingClientRect();
        const clamped = clampLayout({
          left: rect.left, top: rect.top,
          width: rect.width, height: rect.height
        }, 320, 420);
        root.style.left = clamped.left + 'px';
        root.style.top = clamped.top + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
        panel.style.width = clamped.width + 'px';
        panel.style.height = clamped.height + 'px';
        saveLayout(root, panel);
      }, 150);
    });

    updateControlsActive();
  }

  function updateControlsActive() {
    if (!state.uiRoot) return;
    state.uiRoot.querySelectorAll('.arithius-seg-btn[data-mode]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === state.sortMode);
    });
    state.uiRoot.querySelectorAll('.arithius-seg-btn[data-speed]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.speed === state.videoSpeed);
    });
    const stopBtn = state.uiRoot.querySelector('#arithius-stop');
    const skipBtn = state.uiRoot.querySelector('#arithius-skip');
    if (stopBtn) stopBtn.disabled = !state.isProcessing;
    if (skipBtn) skipBtn.disabled = !state.isProcessing;
  }

  function applyLang() {
    const root = state.uiRoot;
    if (!root) return;
    const lb = root.querySelector('#arithius-lang');
    if (lb) lb.textContent = state.lang === 'en' ? 'عربي' : 'EN';
    root.setAttribute('dir', state.lang === 'en' ? 'ltr' : 'rtl');
    root.style.direction = state.lang === 'en' ? 'ltr' : 'rtl';
    root.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = tr(el.getAttribute('data-t')); });
    root.querySelectorAll('[data-tt]').forEach(function (el) { el.title = tr(el.getAttribute('data-tt')); });
    if (state._lastStatus) setStatus(state._lastStatus[0], state._lastStatus[1]);
    applyGate();
    if (state.currentQuests && state.currentQuests.length) renderQuestList(state.currentQuests);
  }

  // ---------- بوابة عضوية السيرفر ----------
  function applyGate() {
    if (!state.uiRoot) return;
    const gate = state.uiRoot.querySelector('#arithius-gate');
    const msg = state.uiRoot.querySelector('#arithius-gate-msg');
    if (!gate) return;
    if (state.member === true) { gate.style.display = 'none'; return; }
    gate.style.display = 'block';
    if (state.member === null && !state.memberErr) { msg.textContent = tr('جاري التحقق من العضوية…'); return; }
    msg.textContent = state.memberErr
      ? tr('تعذّر التحقق من العضوية، حاول مرة أخرى.') + ' (' + state.memberErr + ')'
      : tr('يجب أن تكون عضواً في السيرفر حتى تعمل الإضافة.');
  }

  async function verifyMembership(force) {
    if (!force && state.member === true && Date.now() - state.memberTs < 600000) return true;
    state.member = null; state.memberErr = null; applyGate();
    const r = await callInject('CHECK_MEMBERSHIP', { invite: INVITE_CODE });
    if (r && r.ok) {
      state.member = !!r.member;
      state.memberErr = null;
      state.memberTs = Date.now();
    } else {
      // A transport/configuration error is not proof that the user is not a member.
      state.member = null;
      state.memberErr = (r && r.error) || 'verification_unavailable';
    }
    applyGate();
    if (state.member === false) setStatus('مقفل — انضم للسيرفر لتفعيل الإضافة', 'warn');
    else if (state.member === null) setStatus('تعذّر التحقق من العضوية، حاول مرة أخرى.', 'warn');
    else if (force) setStatus('غير نشط', 'info');
    return state.member === true;
  }

  function setStatus(text, kind) {
    if (!state.statusEl) return;
    state._lastStatus = [text, kind];
    state.statusEl.textContent = tr(text);
    state.statusEl.className = 'arithius-status-' + (kind || 'info');
  }

  function setDiag(diag) {
    if (!state.diagEl) return;
    if (!diag) { state.diagEl.textContent = ''; return; }
    const p = [];
    p.push('TK:' + (diag.hasToken ? '✓' : '×'));
    p.push('SP:' + (diag.hasSuperProps ? '✓' : '×'));
    if (diag.counts) p.push('API:' + diag.counts.api);
    state.diagEl.textContent = p.join('   ');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ============================================================
  // Task helpers
  // ============================================================
  function isVideo(q) {
    return q.taskType === 'WATCH_VIDEO' || q.taskType === 'WATCH_VIDEO_ON_MOBILE' ||
           (q.tasks && (q.tasks.WATCH_VIDEO || q.tasks.WATCH_VIDEO_ON_MOBILE));
  }
  function isMobileOnly(q) {
    if (!q.tasks) return false;
    return !!(q.tasks.WATCH_VIDEO_ON_MOBILE && !q.tasks.WATCH_VIDEO);
  }
  function isActivity(q) {
    return q.taskType === 'PLAY_ACTIVITY' || (q.tasks && q.tasks.PLAY_ACTIVITY);
  }
  function desktopKey(q) {
    const re = /^(PLAY|STREAM)_ON_DESKTOP/;
    if (q.taskType && re.test(q.taskType)) return q.taskType;
    const ks = Object.keys(q.tasks || {});
    for (let i = 0; i < ks.length; i++) if (re.test(ks[i])) return ks[i];
    return null;
  }
  function isDesktop(q) { return !!desktopKey(q); }

  // ============================================================
  // DOM helpers
  // ============================================================
  function findCard(name) {
    const shortName = name.slice(0, 18).toLowerCase().trim();
    const buttons = document.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
      let card = buttons[i];
      for (let j = 0; j < 12 && card && card.parentElement; j++) {
        card = card.parentElement;
        const heading = card.querySelector('h2, h3, h4, [role="heading"]');
        const btnsCount = card.querySelectorAll('button').length;
        const text = (card.textContent || '');
        if (heading && btnsCount >= 1 && btnsCount <= 6 &&
            text.length > 80 && text.length < 3000 &&
            text.toLowerCase().indexOf(shortName) !== -1) return card;
      }
    }
    return null;
  }

  function findBtn(card, matcher) {
    if (!card) return null;
    const btns = card.querySelectorAll('button');
    for (let i = 0; i < btns.length; i++) {
      const t = (btns[i].textContent || '').trim();
      if (matcher(t)) return btns[i];
    }
    return null;
  }

  // أزرار تفتح مواقع خارجية: لا تُنقر أبداً من الإضافة
  const BLOCKED_BTN_RE = /^(play(\s+free)?\s+now|play\s+game|play|download|learn\s+more|pre-?order(\s+now)?|install|buy(\s+now)?|get\s+started|visit.*|العب|تشغيل|تحميل)$/i;

  // v1.0: الإضافة لا تنقر زر الاستلام أبداً (الاستلام يدوي)
  const CLAIM_BTN_RE = /^(claim(\s+reward)?|استلم(\s+الجائزة)?)$/i;

  function humanClick(btn) {
    if (!btn) return;
    const label = (btn.textContent || '').trim();
    if (BLOCKED_BTN_RE.test(label)) { log('Blocked external button:', label); return; }
    if (CLAIM_BTN_RE.test(label)) { log('Claim click disabled:', label); return; }
    try {
      const rect = btn.getBoundingClientRect();
      const opts = {
        bubbles: true, cancelable: true, view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      };
      btn.dispatchEvent(new MouseEvent('mouseover', opts));
      btn.dispatchEvent(new MouseEvent('mousedown', opts));
      btn.dispatchEvent(new MouseEvent('mouseup', opts));
      btn.dispatchEvent(new MouseEvent('click', opts));
    } catch (_) { try { btn.click(); } catch (_) {} }
  }

  let domStateMemo = null;
  function withDomMemo(fn) {
    const own = !domStateMemo;
    if (own) domStateMemo = new Map();
    try { return fn(); } finally { if (own) domStateMemo = null; }
  }
  function checkDOMState(name) {
    if (domStateMemo) {
      if (domStateMemo.has(name)) return domStateMemo.get(name);
      const r = checkDOMStateRaw(name);
      domStateMemo.set(name, r);
      return r;
    }
    return checkDOMStateRaw(name);
  }
  function checkDOMStateRaw(name) {
    const card = findCard(name);
    if (!card) return null;
    const btns = card.querySelectorAll('button');
    let result = {
      hasClaim: false, hasClaimed: false, hasWatch: false,
      hasPlay: false, hasAccept: false, button: null, buttonText: ''
    };
    for (let i = 0; i < btns.length; i++) {
      const t = (btns[i].textContent || '').trim();
      if (/^claim\s+reward$/i.test(t) || t === 'استلم الجائزة') {
        result.hasClaim = true; result.button = btns[i]; result.buttonText = t;
        return result;
      }
      if (/^claimed$/i.test(t) || t === 'تم الاستلام') {
        result.hasClaimed = true; result.button = btns[i]; result.buttonText = t;
        return result;
      }
      if (/^watch\s+\d+\s*s/i.test(t)) {
        result.hasWatch = true; result.button = btns[i]; result.buttonText = t;
      }
      if (/^play/i.test(t) || /^download/i.test(t) || /^launch\s+quest/i.test(t) ||
          t === 'العب' || t === 'تشغيل') result.hasPlay = true;
      if (/^accept\s+quest$/i.test(t) || t === 'قبول المهمة') result.hasAccept = true;
    }
    return result;
  }

  // ============================================================
  // API progress extractor
  // ============================================================
  function extractAPIProgress(quest) {
    if (!quest) return 0;

    // اقرأ progressData من API
    const prog = quest.progressData || quest.progress || {};
    const tasks = quest.tasks || {};

    // حالة 1: progressData[key] = number (seconds elapsed)
    let maxPct = 0;
    for (const k in tasks) {
      const task = tasks[k] || {};
      const target = task.target_seconds || task.target || 0;
      if (target <= 0) continue;

      const pv = prog[k];
      let current = 0;
      if (typeof pv === 'number') current = pv;
      else if (pv && typeof pv === 'number') current = pv;
      else if (pv && typeof pv === 'object') {
        if (typeof pv.value === 'number') current = pv.value;
        else if (typeof pv.current === 'number') current = pv.current;
        else if (typeof pv.progress === 'number') current = pv.progress;
      }

      if (current > 0) {
        maxPct = Math.max(maxPct, Math.min((current / target) * 100, 100));
      }
    }

    // حالة 2: progressData يحتوي مباشرة على نسبة مئوية
    if (maxPct === 0 && typeof prog === 'number') {
      maxPct = Math.min(prog, 100);
    }

    // حالة 3: userStatus.progress في صيغ أخرى
    if (maxPct === 0 && quest.userStatus && quest.userStatus.progress) {
      const usp = quest.userStatus.progress;
      for (const k in usp) {
        const v = usp[k];
        if (typeof v === 'number') {
          maxPct = Math.max(maxPct, Math.min(v, 100));
        } else if (v && typeof v === 'object' && typeof v.value === 'number') {
          maxPct = Math.max(maxPct, Math.min(v.value, 100));
        }
      }
    }

    return Math.round(maxPct);
  }

  // ============================================================
  // computeProgress — يجمع DOM + API + Cache، الأعلى يفوز
  // ============================================================
  function computeProgress(quest) {
    if (!quest) return 0;

    // 1. مكتملة رسمياً
    if (quest.completed || quest.claimed) {
      setCachedProgress(quest.id, 100);
      return 1;
    }

    // 2. DOM — الأولوية القصوى
    const st = checkDOMState(quest.name);
    if (st) {
      if (st.hasClaim || st.hasClaimed) {
        setCachedProgress(quest.id, 100);
        return 1;
      }
      if (st.hasWatch) {
        const m = st.buttonText.match(/(\d+)/);
        if (m) {
          const remaining = parseInt(m[1], 10);
          const target = quest.targetSeconds ||
                        (quest.tasks && Object.values(quest.tasks)[0] &&
                         Object.values(quest.tasks)[0].target_seconds) || 30;
          if (target > 0 && remaining < target) {
            const pct = Math.min(((target - remaining) / target) * 100, 100);
            setCachedProgress(quest.id, pct);
            return pct / 100;
          }
        }
      }
      // زر آخر → استمر للتحقق من API والكاش
    }

    // 3. اجمع كل المصادر — الأعلى يفوز
    const apiPct = extractAPIProgress(quest);
    const cachedPct = getCachedProgress(quest.id);

    // إذا المهمة نشطة حالياً، استخدم القيمة المعروضة في DOM
    let domPct = 0;
    if (state.activeQuestId === quest.id && state.listEl) {
      const bar = state.listEl.querySelector('[data-bar="' + quest.id + '"]');
      if (bar) domPct = parseFloat(bar.style.width) || 0;
    }

    const best = Math.max(apiPct, cachedPct, domPct);
    if (best > 0) {
      setCachedProgress(quest.id, best);
      return best / 100;
    }
    return 0;
  }

  function sortQuests(quests) {
    return withDomMemo(function () { return sortQuestsRaw(quests); });
  }
  function sortQuestsRaw(quests) {
    const mode = state.sortMode;
    const arr = quests.slice();
    function isComplete(q) {
      return q.completed || q.claimed || computeProgress(q) >= 0.995;
    }
    function pendingFirst(a, b) {
      const ac = isComplete(a) ? 1 : 0;
      const bc = isComplete(b) ? 1 : 0;
      if (ac !== bc) return ac - bc;
      return 0;
    }

    if (mode === 'video_first') {
      arr.sort(function (a, b) {
        const pf = pendingFirst(a, b);
        if (pf !== 0) return pf;
        const av = isVideo(a) ? 0 : 1, bv = isVideo(b) ? 0 : 1;
        if (av !== bv) return av - bv;
        return (a.expiresAt || Infinity) - (b.expiresAt || Infinity);
      });
    } else if (mode === 'play_first') {
      arr.sort(function (a, b) {
        const pf = pendingFirst(a, b);
        if (pf !== 0) return pf;
        const ap = (isDesktop(a) || isActivity(a)) ? 0 : 1;
        const bp = (isDesktop(b) || isActivity(b)) ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return (a.expiresAt || Infinity) - (b.expiresAt || Infinity);
      });
    } else if (mode === 'progress_desc') {
      arr.sort(function (a, b) {
        const pf = pendingFirst(a, b);
        if (pf !== 0) return pf;
        const pa = computeProgress(a), pb = computeProgress(b);
        if (pb !== pa) return pb - pa;
        return (a.expiresAt || Infinity) - (b.expiresAt || Infinity);
      });
    } else {
      arr.sort(function (a, b) {
        const pf = pendingFirst(a, b);
        if (pf !== 0) return pf;
        return (a.expiresAt || Infinity) - (b.expiresAt || Infinity);
      });
    }
    return arr;
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  function renderQuestList(quests) {
    withDomMemo(function () { renderQuestListRaw(quests); });
  }
  function renderQuestListRaw(quests) {
    if (!state.listEl) return;
    if (!quests || !quests.length) {
      state.listEl.innerHTML = '<div class="arithius-empty">' + tr('لا توجد مهام') + '</div>';
      return;
    }

    quests.forEach(function (q) {
      const st = checkDOMState(q.name);
      let done = q.completed || q.claimed;
      if (st && (st.hasClaim || st.hasClaimed)) done = true;
      if (done) {
        state.questStatus.set(q.id, 'done');
        setCachedProgress(q.id, 100);
      }
    });

    const sorted = sortQuests(quests);

    state.listEl.innerHTML = sorted.map(function (q) {
      let realPct = Math.round(computeProgress(q) * 100);

      let cls = '';
      const st = state.questStatus.get(q.id);
      if (st === 'done') cls = ' done';
      else if (st === 'failed') cls = ' failed';
      else if (st === 'skipped') cls = ' skipped';
      else if (state.activeQuestId === q.id) cls = ' running';

      const exp = q.expiresAt ? formatDate(q.expiresAt) : '';

      return '<div class="arithius-quest' + cls + '" data-id="' +
        escapeHtml(q.id) + '">' +
        '<div class="arithius-quest-row">' +
        '<span class="arithius-quest-status-icon"></span>' +
        '<span class="arithius-quest-name">' + escapeHtml(q.name) + '</span>' +
        '<span class="arithius-quest-pct" data-pct="' + escapeHtml(q.id) + '">' +
        realPct + '%</span>' +
        '</div>' +
        '<div class="arithius-bar"><div class="arithius-bar-fill" ' +
        'data-bar="' + escapeHtml(q.id) + '" style="width:' + realPct + '%"></div></div>' +
        '<div class="arithius-quest-meta">' +
        (q.taskType || 'UNKNOWN').replace(/_/g, ' ') +
        (q.targetSeconds ? ' · ' + q.targetSeconds + 's' : '') +
        (exp ? ' · ' + exp : '') +
        '</div></div>';
    }).join('');
  }

  function setQuestProgressVisual(questId, targetRatio, ms, noCache) {
    if (!state.listEl) return;
    const targetPct = Math.round(targetRatio * 100);
    if (!noCache) setCachedProgress(questId, targetPct);

    const bar = state.listEl.querySelector('[data-bar="' + questId + '"]');
    const label = state.listEl.querySelector('[data-pct="' + questId + '"]');
    if (!bar && !label) return;

    const currentPct = bar ? (parseFloat(bar.style.width) || 0) : 0;
    if (targetPct <= currentPct) return;

    const start = currentPct;
    const diff = targetPct - currentPct;
    const duration = ms || 500;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = start + diff * eased;
      if (bar) bar.style.width = val + '%';
      if (label) label.textContent = Math.round(val) + '%';
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ============================================================
  // VIDEO
  // ============================================================
  // يتحقق من الخادم أن المهمة اكتملت فعلاً
  async function apiDone(quest) {
    if (!quest || !quest.id || String(quest.id).indexOf('dom_') === 0) return false;
    const r = await callInject('GET_QUESTS');
    if (r && r.ok && r.quests) {
      const u = r.quests.find(function (x) { return x.id === quest.id; });
      if (u && (u.completed || u.claimed)) return true;
    }
    return false;
  }

  // تأكيد الإكمال: زر الاستلام في DOM أو حالة الخادم. للمهام المأخوذة من DOM فقط
  // (بلا معرّف حقيقي) يمكن افتراض النجاح عند عدم القدرة على التحقق.
  async function confirmDone(quest, assumeIfUnverifiable) {
    const isDom = !quest.id || String(quest.id).indexOf('dom_') === 0;
    for (let i = 0; i < 3; i++) {
      const st = checkDOMState(quest.name);
      if (st && (st.hasClaim || st.hasClaimed)) {
        if (st.hasClaim && st.button) { humanClick(st.button); await sleep(1500); }
        return true;
      }
      if (!isDom && await apiDone(quest)) return true;
      if (i < 2) await sleep(state.videoSpeed === 'turbo' ? 500 : 1500);
    }
    return isDom ? !!assumeIfUnverifiable : false;
  }

  async function executeVideo(quest, gen, needMobile) {
    const taskKey = quest.tasks.WATCH_VIDEO ? 'WATCH_VIDEO' :
                    quest.tasks.WATCH_VIDEO_ON_MOBILE ? 'WATCH_VIDEO_ON_MOBILE' : null;
    if (!taskKey) return false;

    const t = quest.tasks[taskKey] || {};
    const duration = t.target_seconds || t.target || quest.targetSeconds || 30;

    if (needMobile) {
      await setMobileUA(true);
      await sleep(300);
    }

    const speed = state.videoSpeed;
    log('Video:', duration + 's', speed, needMobile ? '(mobile)' : '');
    setStatus('مشاهدة: ' + quest.name, 'info');

    if (speed === 'turbo') {
      // v1.0: خارق = إرسال المدة كاملة فوراً بطلب واحد وبدون انتظار،
      // وإن لم يؤكد الخادم الإكمال ننتقل للمسار المرحلي ثم التدريجي.
      {
        const one = await callInject('VIDEO_PROGRESS', { questId: quest.id, timestamp: duration });
        if (gen !== state.generation || state.skipCurrent || state.stopped) {
          if (needMobile) await setMobileUA(false);
          return false;
        }
        if (!one || !one.ok) {
          return await executeVideoFast(quest, gen, needMobile, duration);
        }
        if (one && one.ok) {
          setQuestProgressVisual(quest.id, 1);
          if (await confirmDone(quest, false)) {
            if (needMobile) await setMobileUA(false);
            state.questStatus.set(quest.id, 'done');
            setCachedProgress(quest.id, 100);
            return true;
          }
        }
      }
      const seq = [Math.floor(duration * 0.4), Math.floor(duration * 0.8), duration];
      for (let i = 0; i < seq.length; i++) {
        if (gen !== state.generation) { if (needMobile) await setMobileUA(false); return false; }
        if (state.skipCurrent || state.stopped) { if (needMobile) await setMobileUA(false); return false; }

        const currentTs = seq[i];
        const res = await callInject('VIDEO_PROGRESS', { questId: quest.id, timestamp: currentTs });
        if (gen !== state.generation) { if (needMobile) await setMobileUA(false); return false; }
        if (state.skipCurrent || state.stopped) { if (needMobile) await setMobileUA(false); return false; }

        if (res && res.ok) {
          setQuestProgressVisual(quest.id, currentTs / duration);
          setStatus('مشاهدة: ' + quest.name + ' — ' + Math.round((currentTs / duration) * 100) + '%', 'info');
        } else {
          return await executeVideoFast(quest, gen, needMobile, duration);
        }
        if (i < seq.length - 1) await sleep(120);
      }

      await sleep(500);
      const okDone = await confirmDone(quest, false);
      if (okDone) {
        if (needMobile) await setMobileUA(false);
        state.questStatus.set(quest.id, 'done');
        setCachedProgress(quest.id, 100);
        return true;
      }
      // الخادم لم يؤكد الإكمال → جرّب المسار التدريجي (مع بقاء Mobile UA)
      if (gen !== state.generation || state.skipCurrent || state.stopped) {
        if (needMobile) await setMobileUA(false);
        return false;
      }
      return await executeVideoFast(quest, gen, needMobile, duration);
    }

    return await executeVideoFast(quest, gen, needMobile, duration);
  }

  // v1.0: خارق (تكيّفي) — كل ثانية يرسل أبعد نقطة يقبلها الخادم،
  // والشريط يتحرك بسلاسة ونسبته تتحدث كل ثانية بدل قفزات 7٪ البطيئة.
  async function executeVideoAdaptive(quest, gen, needMobile, duration) {
    const t0 = Date.now();
    let ts = 0, fails = 0;
    const bail = async function () { if (needMobile) await setMobileUA(false); return false; };

    while (ts < duration) {
      if (gen !== state.generation || state.skipCurrent || state.stopped) return await bail();

      const cap = Math.floor((Date.now() - t0) / 1000) + 10;      // أبعد نقطة متوقعة
      const cands = [];
      [Math.min(duration, Math.max(cap, ts + 1)), Math.min(duration, ts + 7), Math.min(duration, ts + 3)]
        .forEach(function (c) { if (c > ts && cands.indexOf(c) < 0) cands.push(c); });

      let ok = false;
      for (let i = 0; i < cands.length; i++) {
        const res = await callInject('VIDEO_PROGRESS', { questId: quest.id, timestamp: Math.floor(cands[i]) });
        if (gen !== state.generation || state.skipCurrent || state.stopped) return await bail();
        if (res && res.ok) { ts = cands[i]; ok = true; break; }
      }

      if (!ok) {
        fails++;
        if (!needMobile && fails === 1) { await setMobileUA(true); needMobile = true; continue; }
        if (fails >= 6) return await bail();
        await sleep(1000);
        continue;
      }
      fails = 0;
      setQuestProgressVisual(quest.id, ts / duration, 950);
      setStatus('مشاهدة: ' + quest.name + ' — ' + Math.round((ts / duration) * 100) + '%', 'info');

      const st = checkDOMState(quest.name);
      if (st && (st.hasClaim || st.hasClaimed)) {
        state.questStatus.set(quest.id, 'done');
        setCachedProgress(quest.id, 100);
        if (needMobile) await setMobileUA(false);
        return true;
      }
      if (ts >= duration) break;
      await sleep(1000);
    }
    await sleep(500);
    const okDone = await confirmDone(quest, false);
    if (needMobile) await setMobileUA(false);
    return okDone;
  }

  async function executeVideoFast(quest, gen, needMobile, duration) {
    if (state.videoSpeed === 'turbo') return await executeVideoAdaptive(quest, gen, needMobile, duration);
    const speed = state.videoSpeed;
    let stepSec, tickMs;
    if (speed === 'fast') { stepSec = Math.max(Math.ceil(duration / 6), 5); tickMs = 400; }
    else { stepSec = 5; tickMs = 5000; }

    let ts = 0, fails = 0;
    while (ts < duration && gen === state.generation) {
      if (state.skipCurrent || state.stopped) {
        if (needMobile) await setMobileUA(false);
        return false;
      }
      await sleep(tickMs);
      ts = Math.min(ts + stepSec, duration);
      const res = await callInject('VIDEO_PROGRESS', { questId: quest.id, timestamp: Math.floor(ts) });
      if (gen !== state.generation) { if (needMobile) await setMobileUA(false); return false; }
      if (state.skipCurrent || state.stopped) { if (needMobile) await setMobileUA(false); return false; }
      if (!res || !res.ok) {
        fails++;
        if (!needMobile && fails === 1) { await setMobileUA(true); needMobile = true; continue; }
        if (fails >= 3) { if (needMobile) await setMobileUA(false); return false; }
        continue;
      }
      fails = 0;
      setQuestProgressVisual(quest.id, ts / duration, Math.min(tickMs, 1200));
      setStatus('مشاهدة: ' + quest.name + ' — ' + Math.round((ts / duration) * 100) + '%', 'info');

      const st = checkDOMState(quest.name);
      if (st && (st.hasClaim || st.hasClaimed)) {
        if (st.hasClaim && st.button) { humanClick(st.button); await sleep(1500); }
        state.questStatus.set(quest.id, 'done');
        setCachedProgress(quest.id, 100);
        if (needMobile) await setMobileUA(false);
        return true;
      }
    }
    if (state.skipCurrent || state.stopped) {
      if (needMobile) await setMobileUA(false);
      return false;
    }
    if (gen !== state.generation) {
      if (needMobile) await setMobileUA(false);
      return false;
    }
    await sleep(1000);
    const okDone = await confirmDone(quest, false);
    if (needMobile) await setMobileUA(false);
    return okDone;
  }

  // ============================================================
  // DESKTOP
  // ============================================================
  // v1.0: بين كل heartbeat والتالي (دقيقة) يتحرك الشريط والنسبة كل ثانية
  // كتقدير بصري فقط (لا يُحفظ ولا يُرسل شيئاً للخادم)؛ والقيمة الحقيقية تأتي من الخادم.
  async function sleepWithProgress(quest, baseElapsed, duration, totalMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < totalMs) {
      if (state.skipCurrent || state.stopped) return;
      await interruptibleSleep(Math.min(1000, Math.max(50, totalMs - (Date.now() - t0))));
      const est = baseElapsed + (Date.now() - t0) / 1000;
      const ratio = Math.min(est / duration, 0.99);
      setQuestProgressVisual(quest.id, ratio, 1000, true);
      setStatus('تشغيل: ' + quest.name + ' — ' + (ratio * 100).toFixed(1) + '%', 'info');
    }
  }

  async function executeDesktop(quest, gen) {
    const taskKey = desktopKey(quest);
    if (!taskKey) return false;

    const t = quest.tasks[taskKey] || {};
    const duration = t.target_seconds || t.target || quest.targetSeconds || 900;
    const appId = (quest.application && quest.application.id) || '';
    const HB_MS = 60000;               // نفس وتيرة العميل تقريباً
    const startT = Date.now();
    const maxMs = duration * 2000 + 120000;

    // البدء من تقدم الخادم الحقيقي (وليس من الكاش المحلي)
    let elapsed = 0;
    const pv = quest.progressData && quest.progressData[taskKey];
    if (typeof pv === 'number') elapsed = pv;
    else if (pv && typeof pv.value === 'number') elapsed = pv.value;

    log('Desktop:', duration + 's', 'starting at', elapsed + 's', 'app', appId);
    setStatus('تشغيل: ' + quest.name, 'info');

    let fails = 0, stall = 0, lastSv = elapsed;
    while (gen === state.generation) {
      if (state.skipCurrent || state.stopped) return false;
      if (Date.now() - startT > maxMs) {
        setStatus('انتهت مهلة المهمة: ' + quest.name, 'error');
        return false;
      }

      const st = checkDOMState(quest.name);
      if (st && (st.hasClaim || st.hasClaimed)) {
        if (st.hasClaim && st.button) { humanClick(st.button); await sleep(2000); }
        state.questStatus.set(quest.id, 'done');
        setCachedProgress(quest.id, 100);
        return true;
      }

      const terminal = elapsed >= duration;
      const res = await callInject('HEARTBEAT', {
        questId: quest.id, appId: appId, terminal: terminal
      });
      if (gen !== state.generation) return false;
      if (state.skipCurrent || state.stopped) return false;

      if (!res || !res.ok) {
        fails++;
        const why = (res && res.error) || 'unknown';
        setStatus('فشل heartbeat (' + why + ') ' + fails + '/3', 'warn');
        if (fails >= 3) return false;
        await interruptibleSleep(5000);
        continue;
      }
      fails = 0;

      const d = res.data || {};
      if (d.completed_at || d.completedAt) break;

      // اقرأ التقدم الحقيقي من رد الخادم إن وُجد
      let sv = null;
      const pp = d.progress && d.progress[taskKey];
      if (typeof pp === 'number') sv = pp;
      else if (pp && typeof pp.value === 'number') sv = pp.value;
      if (sv !== null && sv >= 0 && sv <= duration * 2) {
        if (sv <= lastSv) stall++; else stall = 0;
        lastSv = sv;
        elapsed = sv;
      } else {
        elapsed += HB_MS / 1000;
      }

      if (terminal) break;

      if (stall >= 4) {
        setStatus('الخادم لا يحتسب التقدم — غالباً هذه المهمة تحتاج تطبيق سطح المكتب', 'error');
        return false;
      }

      const ratio = Math.min(elapsed / duration, 0.99);
      setQuestProgressVisual(quest.id, ratio);
      setStatus('تشغيل: ' + quest.name + ' — ' + Math.round(ratio * 100) + '%', 'info');

      if (elapsed >= duration) continue;      // أرسل heartbeat النهائي فوراً
      await sleepWithProgress(quest, elapsed, duration, HB_MS);
    }

    if (gen !== state.generation || state.skipCurrent || state.stopped) return false;
    await sleep(1500);
    return await confirmDone(quest, false);
  }

  // ============================================================
  // ACTIVITY
  // ============================================================
  async function executeActivity(quest, gen) {
    setStatus('فتح النشاط: ' + quest.name, 'info');
    const card = findCard(quest.name);
    if (!card) return false;

    const launchBtn = findBtn(card, function (t) {
      return /launch\s+quest/i.test(t);
    });
    if (!launchBtn) return false;

    humanClick(launchBtn);
    await sleep(3000);

    const maxWait = 90000;
    const startT = Date.now();
    while (Date.now() - startT < maxWait) {
      if (state.skipCurrent || state.stopped) return false;
      if (gen !== state.generation) return false;
      await sleep(3000);

      const cardNow = findCard(quest.name);
      const claimBtn = findBtn(cardNow, function (t) { return /claim\s+reward/i.test(t); });
      if (claimBtn) {
        humanClick(claimBtn);
        await sleep(1500);
        setCachedProgress(quest.id, 100);
        return true;
      }

      const watchBtn = findBtn(cardNow, function (t) { return /^watch\s+\d+\s*s/i.test(t); });
      if (watchBtn) {
        const wm = (watchBtn.textContent || '').match(/(\d+)/);
        if (wm) {
          quest.tasks = { WATCH_VIDEO: { target_seconds: parseInt(wm[1], 10) } };
          quest.taskType = 'WATCH_VIDEO';
          humanClick(watchBtn);
          await sleep(1000);
          let waitT = 0;
          while (waitT < 60000 && gen === state.generation) {
            if (state.skipCurrent || state.stopped) return false;
            await sleep(2000);
            waitT += 2000;
            const c2 = findBtn(findCard(quest.name), function (t) { return /claim\s+reward/i.test(t); });
            if (c2) {
              humanClick(c2);
              await sleep(1500);
              setCachedProgress(quest.id, 100);
              return true;
            }
          }
        }
        return false;
      }

      if (!cardNow && await apiDone(quest)) {
        setCachedProgress(quest.id, 100);
        return true;
      }
    }
    return false;
  }

  async function executeViaDOM(quest, gen) {
    let card = findCard(quest.name);
    if (!card) return false;

    const acceptBtn = findBtn(card, function (t) {
      return /^accept\s+quest$/i.test(t) || t === 'قبول المهمة';
    });
    if (acceptBtn) {
      setStatus('تسجيل: ' + quest.name, 'info');
      humanClick(acceptBtn);
      await sleep(2500);
      if (state.skipCurrent || state.stopped) return false;
      if (gen !== state.generation) return false;
      card = findCard(quest.name);
      if (!card) {
        await sleep(1500);
        card = findCard(quest.name);
        if (!card) return await confirmDone(quest, true);
      }
    }

    const claimBtn = findBtn(card, function (t) {
      return /^claim\s+reward$/i.test(t) || t === 'استلم الجائزة';
    });
    if (claimBtn) {
      humanClick(claimBtn);
      await sleep(1500);
      setCachedProgress(quest.id, 100);
      return true;
    }

    const watchBtn = findBtn(card, function (t) { return /^watch\s+\d+\s*s/i.test(t); });
    if (watchBtn) {
      const initTxt = (watchBtn.textContent || '').trim();
      const initSec = parseInt((initTxt.match(/(\d+)/) || [0, 30])[1], 10);
      setStatus('مشاهدة: ' + quest.name + ' — ' + initSec + 's', 'info');
      humanClick(watchBtn);

      const maxWait = Math.max(initSec * 4, 60) * 1000;
      const startT = Date.now();
      let lastText = initTxt;
      while (Date.now() - startT < maxWait) {
        if (state.skipCurrent || state.stopped) return false;
        if (gen !== state.generation) return false;
        await sleep(1200);

        const c2 = findCard(quest.name);
        if (!c2) return await confirmDone(quest, true);

        const claim = findBtn(c2, function (t) {
          return /^claim\s+reward$/i.test(t) || t === 'استلم الجائزة';
        });
        if (claim) { humanClick(claim); await sleep(1500); setCachedProgress(quest.id, 100); return true; }

        const w2 = findBtn(c2, function (t) { return /^watch\s+\d+\s*s/i.test(t); });
        if (w2) {
          const t = (w2.textContent || '').trim();
          if (t !== lastText) {
            const sec = parseInt((t.match(/(\d+)/) || [0])[1], 10);
            const pct = Math.min(((initSec - sec) / initSec) * 100, 95);
            setQuestProgressVisual(quest.id, pct / 100);
            lastText = t;
          }
        }
      }
      return false;
    }

    const playBtn = findBtn(card, function (t) {
      return /launch\s+quest/i.test(t);
    });
    if (playBtn) {
      setStatus('تشغيل: ' + quest.name, 'info');
      humanClick(playBtn);
      await sleep(3000);
      const startT = Date.now();
      while (Date.now() - startT < 90000) {
        if (state.skipCurrent || state.stopped) return false;
        if (gen !== state.generation) return false;
        await sleep(3000);
        const c = findCard(quest.name);
        if (!c) return await confirmDone(quest, true);
        const cl = findBtn(c, function (t) { return /^claim\s+reward$/i.test(t); });
        if (cl) { humanClick(cl); await sleep(1500); setCachedProgress(quest.id, 100); return true; }
      }
      return false;
    }
    return false;
  }

  // ============================================================
  // EXECUTE ONE
  // ============================================================
  // مهام الإنجاز داخل نشاط: نفتح النشاط داخل Discord مرة واحدة فقط ونترك اللعب للمستخدم
  async function handleManualQuest(quest) {
    if (!state.launched.has(quest.id)) {
      state.launched.add(quest.id);
      const lb = findBtn(findCard(quest.name), function (t) { return /launch\s+quest/i.test(t); });
      if (lb) { humanClick(lb); await sleep(1500); }
    }
    setStatus('العب النشاط يدوياً (الإنجاز يمنحه خادم اللعبة): ' + quest.name, 'warn');
    await sleep(3000);
  }

  async function executeOne(quest, gen) {
    if (state.member !== true && !(await verifyMembership(false))) return 'skipped';
    state.navSafe = false;
    log('Run:', quest.name, '|', quest.taskType);

    const earlyState = checkDOMState(quest.name);
    if (earlyState) {
      if (earlyState.hasClaim && earlyState.button) {
        humanClick(earlyState.button);
        await sleep(2000);
        state.questStatus.set(quest.id, 'done');
        setCachedProgress(quest.id, 100);
        return 'done';
      }
      if (earlyState.hasClaimed) {
        state.questStatus.set(quest.id, 'done');
        setCachedProgress(quest.id, 100);
        return 'done';
      }
    }

    state.activeQuestId = quest.id;
    renderQuestList(state.currentQuests);

    let ok = false;
    const isFromAPI = !quest._fromDOM && quest.id && !String(quest.id).startsWith('dom_');

    if (isFromAPI && !quest.enrolled && !quest.completed) {
      setStatus('تسجيل: ' + quest.name, 'info');
      const res = await callInject('ENROLL_QUEST', { questId: quest.id });
      if (gen !== state.generation) return 'cancelled';
      if (!res || !res.ok) {
        ok = await executeViaDOM(quest, gen);
        state.activeQuestId = null;
        if (state.skipCurrent) return 'skipped';
        return ok ? 'done' : 'failed';
      }
      await sleep(1000);
    }

    // مهام الفيديو/التشغيل عبر الـ API لا تتأثر بتنقّل الصفحة، فلا نقطع التنفيذ عند التنقل
    state.navSafe = !!(isFromAPI && !isActivity(quest) &&
      (quest.taskType === 'WATCH_VIDEO' || quest.taskType === 'WATCH_VIDEO_ON_MOBILE' ||
       isMobileOnly(quest) || isDesktop(quest)));
    if (isFromAPI) {
      if (quest.taskType === 'WATCH_VIDEO') {
        ok = await executeVideo(quest, gen, false);
      } else if (quest.taskType === 'WATCH_VIDEO_ON_MOBILE' || isMobileOnly(quest)) {
        ok = await executeVideo(quest, gen, true);
      } else if (isActivity(quest)) {
        ok = await executeActivity(quest, gen);
        if (!ok && !state.skipCurrent && !state.stopped) ok = await executeViaDOM(quest, gen);
      } else if (isDesktop(quest)) {
        ok = await executeDesktop(quest, gen);
      } else {
        // نوع غير مدعوم: لا نضغط أزرار الصفحة (كانت تفتح موقع اللعبة)، فقط نُبلغ بالنوع
        const keys = (quest.rawTaskKeys || []).join(', ') || quest.taskType;
        log('Unsupported quest type:', quest.name, keys);
        if (/ACHIEVEMENT/.test(quest.taskType || '')) {
          await handleManualQuest(quest);
          state.activeQuestId = null;
          return 'skipped';
        }
        setStatus('نوع غير مدعوم: ' + quest.name + ' [' + keys + ']', 'error');
        await sleep(4000);
        ok = false;
      }
    } else {
      if (/ACHIEVEMENT/.test(quest.taskType || '')) {
        await handleManualQuest(quest);
        state.activeQuestId = null;
        return 'skipped';
      }
      ok = await executeViaDOM(quest, gen);
    }

    state.activeQuestId = null;
    state.navSafe = false;
    if (state.skipCurrent) return 'skipped';
    if (state.stopped) return 'cancelled';

    if (ok) {
      state.questStatus.set(quest.id, 'done');
      setCachedProgress(quest.id, 100);
      return 'done';
    }

    if (isFromAPI) {
      const verify = await callInject('GET_QUESTS');
      if (verify && verify.ok && verify.quests) {
        const fresh = verify.quests.find(function (x) { return x.id === quest.id; });
        if (fresh && (fresh.completed || fresh.claimed)) {
          state.questStatus.set(quest.id, 'done');
          setCachedProgress(quest.id, 100);
          return 'done';
        }
      }
    }

    const finalState = checkDOMState(quest.name);
    if (finalState && (finalState.hasClaim || finalState.hasClaimed)) {
      if (finalState.hasClaim && finalState.button) {
        humanClick(finalState.button);
        await sleep(1500);
      }
      state.questStatus.set(quest.id, 'done');
      setCachedProgress(quest.id, 100);
      return 'done';
    }
    return 'failed';
  }

  async function runSingle(quest) {
    if (state.isProcessing) {
      state.generation++;
      state.isProcessing = false;
      await sleep(500);
    }
    state.isProcessing = true;
    state.skipCurrent = false;
    state.stopped = false;
    updateControlsActive();
    const gen = ++state.generation;
    try {
      setStatus('تشغيل: ' + quest.name, 'info');
      const r = await executeOne(quest, gen);
      if (gen !== state.generation) return;
      if (r === 'done') {
        state.questStatus.set(quest.id, 'done');
        setStatus('اكتملت: ' + quest.name, 'success');
      } else if (r === 'skipped') {
        state.questStatus.set(quest.id, 'skipped');
        setStatus('تم التخطي: ' + quest.name, 'warn');
      } else if (r === 'failed') {
        state.questStatus.set(quest.id, 'failed');
        setStatus('فشلت: ' + quest.name, 'error');
      }
    } catch (e) { log('Error:', e); }
    finally {
      if (gen === state.generation) state.isProcessing = false;
      state.activeQuestId = null;
      state.skipCurrent = false;
      setMobileUA(false);
      updateControlsActive();
      refreshFromAPI();
    }
  }

  async function autoLoop() {
    if (state.isProcessing) return;
    if (!state.enabled) return;

    state.stopped = false;
    state.skipCurrent = false;
    state.isProcessing = true;
    state.resume = false;
    state.hadFailed = false;
    updateControlsActive();
    const gen = ++state.generation;

    try {
      createUI();
      if (!(await verifyMembership(false))) {
        state.isProcessing = false;
        updateControlsActive();
        return;
      }
      setStatus('جاري الفحص', 'info');
      await sleep(1000);

      const res = await callInject('GET_QUESTS');
      let quests = [];
      let diag = null;
      if (res && res.ok && res.quests && res.quests.length > 0) {
        quests = res.quests;
        diag = res.diagnostics;
      } else {
        quests = scanQuestsFromDOM();
      }

      state.currentQuests = quests;
      renderQuestList(quests);
      setDiag(diag);

      if (!quests.length) {
        setStatus('لا توجد مهام', 'warn');
        state.isProcessing = false;
        updateControlsActive();
        return;
      }

      setStatus('وُجد ' + quests.length + ' مهمة', 'success');

      const pending = quests.filter(function (q) {
        if (state.questStatus.get(q.id) === 'done') return false;
        if (state.questStatus.get(q.id) === 'skipped') return false;
        if (q.completed || q.claimed) return false;
        const st = checkDOMState(q.name);
        if (st && (st.hasClaim || st.hasClaimed)) {
          state.questStatus.set(q.id, 'done');
          setCachedProgress(q.id, 100);
          return false;
        }
        return true;
      });

      const videos = sortQuests(pending.filter(isVideo));
      const others = sortQuests(pending.filter(function (q) { return !isVideo(q); }));

      let ordered;
      if (state.sortMode === 'play_first') ordered = others.concat(videos);
      else if (state.sortMode === 'progress_desc' || state.sortMode === 'expiry_asc')
        ordered = sortQuests(pending);
      else ordered = videos.concat(others);

      if (!ordered.length) {
        setStatus('لا مهام قابلة للتنفيذ', 'warn');
        state.isProcessing = false;
        updateControlsActive();
        return;
      }

      for (let i = 0; i < ordered.length; i++) {
        if (state.stopped) { setStatus('متوقف', 'warn'); break; }
        if (gen !== state.generation) return;
        if (!state.enabled) break;
        if (!(await verifyMembership(false))) break;

        state.skipCurrent = false;
        const q = ordered[i];

        setStatus('(' + (i + 1) + '/' + ordered.length + ') ' + q.name, 'info');
        const r = await executeOne(q, gen);

        if (gen !== state.generation) return;
        if (state.stopped) break;

        if (r === 'done') {
          state.questStatus.set(q.id, 'done');
          setCachedProgress(q.id, 100);
        } else if (r === 'skipped') state.questStatus.set(q.id, 'skipped');
        else if (r === 'failed') { state.questStatus.set(q.id, 'failed'); state.hadFailed = true; }

        if (!q._fromDOM) {
          const fresh = await callInject('GET_QUESTS');
          if (fresh && fresh.ok) {
            state.currentQuests = fresh.quests;
            renderQuestList(fresh.quests);
            setDiag(fresh.diagnostics);
          }
        } else refreshAndRender();
        await sleep(300);
      }

      if (!state.stopped && gen === state.generation) {
        const finalList = state.currentQuests.length ? state.currentQuests : quests;
        const doneCount = finalList.filter(function (q) {
          return q.completed || q.claimed || state.questStatus.get(q.id) === 'done';
        }).length;
        setStatus('انتهى — ' + doneCount + '/' + finalList.length + ' مكتملة', 'success');
      }
    } catch (e) {
      log('Error:', e);
      setStatus('خطأ: ' + (e.message || e), 'error');
    } finally {
      if (gen === state.generation) {
        state.isProcessing = false;
        state.skipCurrent = false;
        state.activeQuestId = null;
        state.navSafe = false;
        await setMobileUA(false);
        updateControlsActive();
        // مهمة فشلت أو بقيت مهام: أعد المحاولة تلقائياً بدل انتظار إيقاف/تشغيل يدوي
        if (!state.stopped && state.enabled && state.autoStart && state.hadFailed && state.retryCount < 2) {
          state.retryCount++;
          setTimeout(function () { if (!state.isProcessing && !state.stopped) autoLoop(); }, 3000);
        } else if (!state.hadFailed) {
          state.retryCount = 0;
        }
      }
    }
  }

  function scanQuestsFromDOM() {
    const out = [];
    const seen = new Set();
    const buttons = document.querySelectorAll('button');
    const cards = new Set();

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const txt = (btn.textContent || '').trim();
      const isQuestBtn =
        /^watch\s+\d+\s*s/i.test(txt) ||
        /^accept\s+quest$/i.test(txt) || txt === 'قبول المهمة' ||
        /^play\s+game$/i.test(txt) || /^play\s+now$/i.test(txt) ||
        /^play\s+free\s+now$/i.test(txt) || /^play$/i.test(txt) ||
        /^download$/i.test(txt) || /^launch\s+quest$/i.test(txt) ||
        /^stream\s+\d+/i.test(txt) ||
        txt === 'العب' || txt === 'تشغيل' ||
        /^claim\s+reward$/i.test(txt) || txt === 'استلم الجائزة' ||
        /^claimed$/i.test(txt);

      if (!isQuestBtn) continue;
      let card = btn, found = null, relaxed = null;
      for (let j = 0; j < 12 && card && card.parentElement; j++) {
        card = card.parentElement;
        const heading = card.querySelector('h2, h3, h4, [role="heading"]');
        const btnsCount = card.querySelectorAll('button').length;
        const textLen = (card.textContent || '').length;
        const sized = btnsCount >= 1 && btnsCount <= 6 && textLen > 80 && textLen < 3000;
        if (sized && heading) { found = card; break; }
        if (sized && !relaxed && /quest|orbs/i.test(card.textContent || '')) relaxed = card;
      }
      const chosen = found || relaxed;
      if (chosen) cards.add(chosen);
    }

    cards.forEach(function (card) {
      try {
        let title = '';
        const heading = card.querySelector('h2, h3, h4, [role="heading"]');
        if (heading) title = (heading.textContent || '').trim();
        if (!title) {
          const all = card.querySelectorAll('span, div');
          for (let i = 0; i < all.length; i++) {
            const t = (all[i].textContent || '').trim();
            if (t.length > 8 && t.length < 80 && /quest/i.test(t) &&
                all[i].children.length === 0) { title = t; break; }
          }
        }
        if (!title || seen.has(title)) return;
        seen.add(title);

        const btns = card.querySelectorAll('button');
        let taskType = 'UNKNOWN';
        let targetSeconds = 0;
        let hasAccept = false, hasWatch = false, hasPlay = false;
        let hasClaim = false, claimed = false, hasLaunch = false;

        for (let i = 0; i < btns.length; i++) {
          const t = (btns[i].textContent || '').trim();
          const wm = t.match(/^watch\s+(\d+)\s*s/i);
          if (wm) { hasWatch = true; taskType = 'WATCH_VIDEO'; targetSeconds = parseInt(wm[1], 10); continue; }
          if (/^accept\s+quest$/i.test(t) || t === 'قبول المهمة') { hasAccept = true; continue; }
          if (/^claim\s+reward$/i.test(t) || t === 'استلم الجائزة') { hasClaim = true; continue; }
          if (/^claimed$/i.test(t)) { claimed = true; hasClaim = false; continue; }
          if (/launch\s+quest/i.test(t)) { hasLaunch = true; taskType = 'PLAY_ACTIVITY'; continue; }
          if (/^play/i.test(t) || /^download/i.test(t) || t === 'العب' || t === 'تشغيل') {
            hasPlay = true;
            if (taskType === 'UNKNOWN') taskType = 'PLAY_ON_DESKTOP';
            continue;
          }
          if (/^stream/i.test(t)) { if (taskType === 'UNKNOWN') taskType = 'STREAM_ON_DESKTOP'; continue; }
        }

        const cardText = (card.textContent || '').toLowerCase();
        if (cardText.indexOf('mobile') !== -1 && taskType === 'WATCH_VIDEO') {
          taskType = 'WATCH_VIDEO_ON_MOBILE';
        }

        if (taskType === 'PLAY_ON_DESKTOP' || taskType === 'UNKNOWN') {
          if (/watch (the|a) video/.test(cardText)) taskType = 'WATCH_VIDEO';
        }
        if (taskType === 'PLAY_ACTIVITY' && !/\bminutes?\b/.test(cardText)) {
          taskType = 'ACHIEVEMENT_IN_ACTIVITY';
        }

        let expiresAt = 0;
        const dm = cardText.match(/ends\s+(\d{1,2})\/(\d{1,2})/);
        if (dm) {
          const now = new Date();
          let year = now.getFullYear();
          const m = parseInt(dm[1], 10) - 1, d = parseInt(dm[2], 10);
          if (m < now.getMonth() - 6) year++;
          expiresAt = new Date(year, m, d, 23, 59, 59).getTime();
        }

        out.push({
          id: 'dom_' + title.replace(/[^a-z0-9]+/gi, '_').slice(0, 40) + '_' + hashStr(title),
          name: title,
          taskType: taskType,
          targetSeconds: targetSeconds,
          tasks: taskType === 'WATCH_VIDEO'
            ? { WATCH_VIDEO: { target_seconds: targetSeconds } }
            : taskType === 'WATCH_VIDEO_ON_MOBILE'
            ? { WATCH_VIDEO_ON_MOBILE: { target_seconds: targetSeconds } }
            : {},
          application: {},
          enrolled: !hasAccept,
          completed: claimed,
          claimed: claimed,
          progressData: {},
          expiresAt: expiresAt,
          _fromDOM: true,
          hasAccept: hasAccept, hasWatch: hasWatch,
          hasPlay: hasPlay, hasClaim: hasClaim, hasLaunch: hasLaunch
        });
      } catch (_) {}
    });
    return out;
  }

  let lastApiTry = 0;
  async function refreshSmart() {
    if (state.currentQuests.some(function (x) { return !x._fromDOM; })) {
      renderQuestList(state.currentQuests);
      return;
    }
    if (Date.now() - lastApiTry > 30000) {
      lastApiTry = Date.now();
      await refreshFromAPI();
      return;
    }
    refreshAndRender();
  }

  async function refreshFromAPI() {
    try {
      const res = await callInject('GET_QUESTS');
      if (res && res.ok && res.quests && res.quests.length) {
        state.currentQuests = res.quests;
        renderQuestList(res.quests);
        setDiag(res.diagnostics);
        return;
      }
    } catch (_) {}
    refreshAndRender();
  }

  function refreshAndRender() {
    if (state.currentQuests.length && state.currentQuests.some(function (x) { return !x._fromDOM; })) {
      renderQuestList(state.currentQuests);
      return state.currentQuests;
    }
    const q = scanQuestsFromDOM();
    if (q.length) {
      state.currentQuests = q;
      renderQuestList(q);
    }
    return q;
  }

  function isQuestPage() { return QUEST_URL_RE.test(location.href); }

  function handleQuestPageOpened() {
    if (state.isProcessing || state.autoStartTimer) return;
    state.autoStartTimer = setTimeout(function () {
      state.autoStartTimer = null;
      if (state.isProcessing || !state.autoStart || !state.enabled) return;
      if (!state.resume && Date.now() - state.lastAutoTs < 60000) return;
      state.resume = false;
      state.lastAutoTs = Date.now();
      state.autoStarted = true;
      autoLoop();
    }, 2500);
  }

  function onUrlChanged() {
    if (location.href === state.lastUrl) return;
    state.lastUrl = location.href;
    if (isQuestPage()) {
      handleQuestPageOpened();
    } else {
      if (state.isProcessing && state.navSafe) return;     // لا نقطع مهمة API جارية
      if (state.isProcessing && !state.stopped) state.resume = true;
      state.generation++;
      state.isProcessing = false;
      if (state.uiRoot) setStatus('غير نشط', 'info');
    }
  }

  const _push = history.pushState;
  const _replace = history.replaceState;
  history.pushState = function () {
    const r = _push.apply(this, arguments);
    setTimeout(onUrlChanged, 100); return r;
  };
  history.replaceState = function () {
    const r = _replace.apply(this, arguments);
    setTimeout(onUrlChanged, 100); return r;
  };
  window.addEventListener('popstate', function () {
    setTimeout(onUrlChanged, 100);
  });


  // ============================================================
  // v1.0 — إغلاق أي نافذة منبثقة (تحقق/تأكيد/إعلان...) ثم المتابعة
  // يغلقها فقط عبر زر الإغلاق أو Escape، ولا يحلّ أي اختبار تحقق.
  // ============================================================
  const CHECK_RE = /are you human|not a robot|captcha|hcaptcha|confirm you.?re not|أنا الإنسان|لست روبوت|تأكيد أنك/i;

  function isCheckPopup(el) {
    try {
      if (el.querySelector('iframe[src*="hcaptcha"], iframe[title*="hCaptcha" i], [class*="captcha" i]')) return true;
      return CHECK_RE.test(el.textContent || '');
    } catch (_) { return false; }
  }

  // نوافذ التحقق تُغلق دائماً؛ أي نافذة أخرى تُغلق فقط أثناء تنفيذ مهمة API
  // (فيديو/تشغيل) ولا تُمس أثناء مهام الأنشطة والـ DOM ولا عند عدم التشغيل،
  // لأن بعض المهام تحتاج نوافذ ديسكورد نفسها (إطلاق النشاط، اختيار قناة...).
  function findOpenPopups() {
    const out = [];
    // لا نغلق أي نافذة إلا أثناء تشغيل الإضافة فعلاً؛ عند الإيقاف أو الخمول
    // يبقى كل شيء بيد المستخدم (مثلاً جمع الجوائز يدوياً وحل التحقق بنفسه).
    if (!state.isProcessing || state.stopped || !state.enabled) return out;
    const closeAny = !!(state.isProcessing && state.navSafe);
    document.querySelectorAll('[role="dialog"], [aria-modal="true"]').forEach(function (el) {
      if (state.uiRoot && state.uiRoot.contains(el)) return;
      if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return;
      if (isCheckPopup(el) || closeAny) out.push(el);
    });
    return out;
  }

  function closePopup(el) {
    const closeBtn = el.querySelector(
      '[aria-label="Close"], [aria-label="إغلاق"], [aria-label="close"], button[class*="close" i]'
    ) || (el.parentElement && el.parentElement.querySelector('[aria-label="Close"], [aria-label="إغلاق"]'));
    if (closeBtn) { try { closeBtn.click(); return true; } catch (_) {} }
    try {
      ['keydown', 'keyup'].forEach(function (t) {
        document.dispatchEvent(new KeyboardEvent(t, {
          key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true
        }));
      });
      return true;
    } catch (_) {}
    return false;
  }

  function startPopupCloser() {
    if (state.popupTimer) return;
    state.popupTimer = setInterval(function () {
      try {
        if (!isQuestPage()) return;
        const popups = findOpenPopups();
        if (!popups.length) return;
        let closed = 0;
        popups.forEach(function (el) { if (closePopup(el)) closed++; });
        if (closed) {
          log('Popup closed (' + closed + ') — continuing');
          // لو توقفت الحلقة بسبب النافذة، أعد التشغيل
          if (state.enabled && !state.isProcessing) {
            setTimeout(function () {
              if (!state.isProcessing && state.enabled) refreshSmart();
            }, 1200);
          }
        }
      } catch (e) { log('popup closer error', e && e.message); }
    }, 800);
  }

  function startObserver() {
    if (state.observer) state.observer.disconnect();
    state.observer = new MutationObserver(function (muts) {
      if (!isQuestPage()) return;
      if (state.isProcessing) return;
      if (state.uiRoot && muts.every(function (m) { return state.uiRoot.contains(m.target); })) return;
      clearTimeout(state.observerDebounce);
      state.observerDebounce = setTimeout(function () {
        if (!state.isProcessing && state.enabled) refreshSmart();
      }, 3000);
    });
    state.observer.observe(document.body || document.documentElement, {
      childList: true, subtree: true
    });
  }

  chrome.runtime.onMessage.addListener(function (message) {
    if (!message) return;
    if (message.type === 'ARITHIUS_QUEST_PAGE_OPENED') {
      handleQuestPageOpened();
    }
    if (message.type === 'ARITHIUS_QUEST_PAGE_LEFT') {
      if (state.isProcessing && state.navSafe) return;
      if (state.isProcessing && !state.stopped) state.resume = true;
      state.generation++;
      state.isProcessing = false;
      setMobileUA(false);
    }
    if (message.type === 'ARITHIUS_SETTINGS_UPDATED' && message.settings) {
      const s = message.settings;
      if (s.enabled !== undefined) state.enabled = s.enabled;
      if (s.autoStart !== undefined) state.autoStart = s.autoStart;
      if (s.sortMode) state.sortMode = s.sortMode;
      if (s.videoSpeed) state.videoSpeed = s.videoSpeed;
      updateControlsActive();
      if (state.currentQuests.length) renderQuestList(state.currentQuests);
    }
  });

  chrome.storage.local.get(
    ['arithius_enabled', 'arithius_auto_start',
     'arithius_sort_mode', 'arithius_video_speed', 'arithius_lang'],
    function (res) {
      if (res.arithius_lang) { state.lang = res.arithius_lang; applyLang(); }
      if (res.arithius_enabled !== undefined) state.enabled = res.arithius_enabled;
      if (res.arithius_auto_start !== undefined) state.autoStart = res.arithius_auto_start;
      if (res.arithius_sort_mode) state.sortMode = res.arithius_sort_mode;
      if (res.arithius_video_speed) state.videoSpeed = res.arithius_video_speed;
      updateControlsActive();
    }
  );

  chrome.storage.onChanged.addListener(function (ch, area) {
    if (area === 'local' && ch.endymion_ui) applyUICustomization(ch.endymion_ui.newValue);
    if (area === 'local' && ch.arithius_lang && ch.arithius_lang.newValue !== state.lang) {
      state.lang = ch.arithius_lang.newValue; applyLang();
    }
  });

  function boot() {
    if (state.booted) return;
    state.booted = true;
    log('v1.0.0');

    loadProgressCache(function () {
      createUI();
      startObserver();
      startPopupCloser();
      if (isQuestPage()) {
        setTimeout(function () {
          if (state.autoStart && state.enabled && !state.autoStarted) {
            state.autoStarted = true;
            autoLoop();
          }
        }, 2500);
      } else {
        setStatus('غير نشط', 'info');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
