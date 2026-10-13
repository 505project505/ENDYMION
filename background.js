// ============================================================
// ENDYMION — Background Service Worker v1.0.0
// ============================================================

'use strict';

const QUEST_URL_PATTERNS = [
  /discord\.com\/quest-home/,
  /discord\.com\/quests/,
  /discord\.com\/channels\/@me\/quests/
];

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) discord/195.0 Chrome/116.0.0.0 Mobile Safari/537.36';

const MOBILE_RULE_ID = 9001;

function isQuestUrl(url) {
  if (!url) return false;
  return QUEST_URL_PATTERNS.some((p) => p.test(url));
}

// ---- Mobile UA toggle ----
async function setMobileUA(enabled) {
  try {
    if (enabled) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [MOBILE_RULE_ID],
        addRules: [{
          id: MOBILE_RULE_ID,
          priority: 100,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [{
              header: 'user-agent',
              operation: 'set',
              value: MOBILE_UA
            }]
          },
          condition: {
            urlFilter: '||discord.com/api/v9/quests',
            resourceTypes: ['xmlhttprequest']
          }
        }]
      });
      console.log('[ENDYMION:BG] Mobile UA enabled');
      return { ok: true, enabled: true };
    } else {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [MOBILE_RULE_ID]
      });
      console.log('[ENDYMION:BG] Mobile UA disabled');
      return { ok: true, enabled: false };
    }
  } catch (e) {
    console.error('[ENDYMION:BG] setMobileUA error', e);
    return { ok: false, error: e.message };
  }
}

// ---- Navigation ----
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return;
  const url = details.url;
  if (isQuestUrl(url)) {
    chrome.tabs.sendMessage(details.tabId, {
      type: 'ARITHIUS_QUEST_PAGE_OPENED',
      url: url
    }).catch(() => {});
  } else {
    chrome.tabs.sendMessage(details.tabId, {
      type: 'ARITHIUS_QUEST_PAGE_LEFT'
    }).catch(() => {});
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  const url = tab.url || '';
  if (isQuestUrl(url)) {
    chrome.tabs.sendMessage(tabId, {
      type: 'ARITHIUS_QUEST_PAGE_OPENED',
      url: url
    }).catch(() => {});
  }
});

// ---- Messages ----
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return;

  if (message.type === 'ARITHIUS_TOGGLE_MOBILE_UA') {
    setMobileUA(!!message.enabled).then(sendResponse);
    return true;
  }

  if (message.type === 'ARITHIUS_LOG') {
    try {
      console.log(`[ENDYMION:tab${sender.tab?.id}]`, ...(message.args || []));
    } catch (_) {}
    return false;
  }

  if (message.type === 'ARITHIUS_PING') {
    sendResponse({ ok: true, ts: Date.now() });
    return false;
  }
  return false;
});

// قاعدة Mobile UA تُصفَّر عند كل تشغيل للمتصفح (كانت تُصفَّر عند التثبيت فقط)
chrome.runtime.onStartup.addListener(() => { setMobileUA(false); });

// ---- Install ----
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(
    ['arithius_enabled', 'arithius_auto_start',
     'arithius_sort_mode', 'arithius_video_speed'],
    (res) => {
      const patch = {};
      if (res.arithius_enabled === undefined) patch.arithius_enabled = true;
      if (res.arithius_auto_start === undefined) patch.arithius_auto_start = true;
      if (res.arithius_sort_mode === undefined) patch.arithius_sort_mode = 'expiry_asc';
      if (res.arithius_video_speed === undefined) patch.arithius_video_speed = 'fast';
      if (Object.keys(patch).length) chrome.storage.local.set(patch);
    }
  );

  // تأكد أن mobile rule معطّلة عند البدء
  setMobileUA(false);

  console.log('[ENDYMION] BG v1.0.0 ready');
});
