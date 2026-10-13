'use strict';

const els = {
  enabled: document.getElementById('enabled'),
  autoStart: document.getElementById('autoStart'),
  sortMode: document.getElementById('sortMode'),
  videoSpeed: document.getElementById('videoSpeed'),
  speedHint: document.getElementById('speedHint'),
  lang: document.getElementById('lang')
};

const T = {
  'عام':'General','تفعيل الإضافة':'Enable extension','بدء تلقائي عند فتح المهام':'Auto-start on quests page',
  'ترتيب التنفيذ':'Run order','يبدأ بـ':'Start with','مهام الفيديو (الأسرع)':'Video quests (fastest)',
  'مهام الألعاب':'Game quests','الأقرب للانتهاء':'Closest to done','الأقرب لانتهاء الصلاحية':'Ends soonest',
  'مهام الفيديو تُكمل خلال ثوانٍ في الوضع السريع.':'Video quests finish within seconds in fast mode.',
  'تخصيص الواجهة':'Interface customization','لون التمييز':'Accent color','خلفية اللوحة':'Panel background','لون النص':'Text color','إخفاء الأزرار':'Hide buttons','زر الانضمام':'Join button','زر التحقق':'Verify button','روابط التواصل':'Social links','إعادة ضبط المظهر':'Reset appearance','تتقلص المساحات تلقائياً عند إخفاء الأزرار.':'Layout spacing adjusts automatically when buttons are hidden.',
  'سرعة مهام الفيديو':'Video quest speed','الوضع':'Mode','⚡ خارق (فوري)':'⚡ Ultra (instant)',
  '🚀 سريع (×10)':'🚀 Fast (×10)','🚶 عادي (×1)':'🚶 Normal (×1)','سيرفر الدعم (مطلوب)':'Support server (required)'
};
const HINTS_EN = {
  turbo: 'Ultra: sends the full duration at once in a single request, falling back to staged progress if completion is not confirmed.',
  fast: 'Fast: finishes a 30s video in ~3 real seconds.',
  normal: 'Normal: waits the real duration.'
};
let lang = 'ar';
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
  document.querySelectorAll('[data-t]').forEach((el) => {
    const k = el.getAttribute('data-t');
    el.textContent = lang === 'en' ? (T[k] || k) : k;
  });
  els.lang.value = lang;
  els.speedHint.textContent = (lang === 'en' ? HINTS_EN : HINTS)[els.videoSpeed.value] || '';
}

const HINTS = {
  turbo: 'خارق: يرسل المدة كاملة فوراً بطلب واحد بلا انتظار، ويعود للمسار المرحلي إن لم يتأكد الإكمال.',
  fast: 'سريع: ينهي فيديو 30ث في ~3 ثوانٍ حقيقية.',
  normal: 'عادي: ينتظر المدة الحقيقية.'
};

chrome.storage.local.get(
  ['arithius_enabled', 'arithius_auto_start',
   'arithius_sort_mode', 'arithius_video_speed', 'arithius_lang'],
  (res) => {
    lang = res.arithius_lang || 'ar';
    els.enabled.checked = res.arithius_enabled !== false;
    els.autoStart.checked = res.arithius_auto_start !== false;
    els.sortMode.value = res.arithius_sort_mode || 'expiry_asc';
    els.videoSpeed.value = res.arithius_video_speed || 'fast';
    applyLang();
  }
);

function save() {
  const settings = {
    enabled: els.enabled.checked,
    autoStart: els.autoStart.checked,
    sortMode: els.sortMode.value,
    videoSpeed: els.videoSpeed.value
  };

  chrome.storage.local.set({
    arithius_enabled: settings.enabled,
    arithius_auto_start: settings.autoStart,
    arithius_sort_mode: settings.sortMode,
    arithius_video_speed: settings.videoSpeed
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'ARITHIUS_SETTINGS_UPDATED',
        settings: settings
      }).catch(() => {});
    }
  });
}

const uiIds = ['accentColor','backgroundColor','textColor','hideRun','hideStop','hideSkip','hideRefresh','hideReport','hideJoin','hideVerify','hideSocial'];
const uiDefaults = {accent:'#c9a961',background:'#0f0f10',text:'#e8e8ea',hideRun:false,hideStop:false,hideSkip:false,hideRefresh:false,hideReport:false,hideJoin:false,hideVerify:false,hideSocial:false};
function readUI() {
  return {
    accent: document.getElementById('accentColor').value,
    background: document.getElementById('backgroundColor').value,
    text: document.getElementById('textColor').value,
    hideRun: document.getElementById('hideRun').checked,
    hideStop: document.getElementById('hideStop').checked,
    hideSkip: document.getElementById('hideSkip').checked,
    hideRefresh: document.getElementById('hideRefresh').checked,
    hideReport: document.getElementById('hideReport').checked,
    hideJoin: document.getElementById('hideJoin').checked,
    hideVerify: document.getElementById('hideVerify').checked,
    hideSocial: document.getElementById('hideSocial').checked
  };
}
function paintUI(ui) {
  const v = Object.assign({}, uiDefaults, ui || {});
  document.getElementById('accentColor').value = v.accent;
  document.getElementById('backgroundColor').value = v.background;
  document.getElementById('textColor').value = v.text;
  ['hideRun','hideStop','hideSkip','hideRefresh','hideReport','hideJoin','hideVerify','hideSocial'].forEach(k => document.getElementById(k).checked = !!v[k]);
}
function saveUI() { chrome.storage.local.set({endymion_ui: readUI()}); }
chrome.storage.local.get(['endymion_ui'], res => paintUI(res.endymion_ui));
uiIds.forEach(id => document.getElementById(id).addEventListener('input', saveUI));
uiIds.slice(3).forEach(id => document.getElementById(id).addEventListener('change', saveUI));
document.getElementById('resetUI').addEventListener('click', () => { paintUI(uiDefaults); saveUI(); });

els.enabled.addEventListener('change', save);
els.autoStart.addEventListener('change', save);
els.sortMode.addEventListener('change', save);
els.videoSpeed.addEventListener('change', () => {
  applyLang();
  save();
});
els.lang.addEventListener('change', () => {
  lang = els.lang.value;
  chrome.storage.local.set({ arithius_lang: lang });
  applyLang();
});
