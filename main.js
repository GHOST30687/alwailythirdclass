import { STUDENT_CODES } from './data/studentCodes.js';

// ⚠️ JSONBin.io Configuration - يجب نقل هذه المعلومات إلى متغيرات البيئة في بيئة الإنتاج
// في بيئة المتصفح، لا يمكن استخدام process.env مباشرة، لذلك نستخدم القيم الافتراضية
const JSONBIN_CONFIG = {
  API_KEY: (typeof process !== 'undefined' && process.env?.JSONBIN_API_KEY) || '$2a$10$fuuDWFJZi.HrgUohTmYJced2J.i2oUiPYpNMzGax/x/MK3CM31EZu', // 🔑 يُفضل استخدام متغير البيئة
  HOMEWORK_BIN: (typeof process !== 'undefined' && process.env?.HOMEWORK_BIN) || '68d66c19d0ea881f408bb3b3', // 📚 يُفضل استخدام متغير البيئة
  ANNOUNCEMENTS_BIN: (typeof process !== 'undefined' && process.env?.ANNOUNCEMENTS_BIN) || '68d66c3143b1c97be950c256', // 📢 يُفضل استخدام متغير البيئة
  CODES_BIN: (typeof process !== 'undefined' && process.env?.CODES_BIN) || '68dbee59d0ea881f4090882b', // 🧩 ضع معرف Bin الخاص بالأكواد هنا
  BASE_URL: 'https://api.jsonbin.io/v3/b'
};

// Simple toast system
const toaster = document.getElementById('toaster');
function toast(message, type = 'success', timeout = 2200) {
  const div = document.createElement('div');
  div.className = `toast ${type} animate-slide-up`;
  div.textContent = message;
  toaster.appendChild(div);
  setTimeout(() => div.remove(), timeout);
}
const toastSuccess = (m) => toast(m, 'success');
const toastError = (m) => toast(m, 'error');

// Local storage helpers
const LS_KEYS = {
  AUTH: 'auth.loggedIn',
  SESSION: 'student.session',
  CODES: 'student.codes',
  SUBJECTS: 'subjects.all',
  HOMEWORK: 'homework.all',
  ANNOUNCEMENTS: 'announcements.all',
};

// JSONBin.io API Functions
async function fetchFromBin(binId) {
  if (!binId || !JSONBIN_CONFIG.API_KEY) {
    console.warn('Missing binId or API key for JSONBin operation');
    return null;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${binId}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_CONFIG.API_KEY,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.record;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('JSONBin fetch request timed out');
    } else {
      console.error('Error fetching from JSONBin:', error.message);
    }
    return null;
  }
}

async function saveToBin(binId, data) {
  if (!binId || !JSONBIN_CONFIG.API_KEY || !data) {
    console.warn('Missing required parameters for JSONBin save operation');
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout for saves
    
    const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_CONFIG.API_KEY
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('JSONBin save request timed out');
    } else {
      console.error('Error saving to JSONBin:', error.message);
    }
    return false;
  }
}

// Local storage fallback functions with enhanced error handling
const getJSON = (key, defaultValue) => {
  if (!key) return defaultValue;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`Error reading from localStorage key "${key}":`, error.message);
    return defaultValue;
  }
};

const setJSON = (key, value) => {
  if (!key) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error.message);
    return false;
  }
};

// Theme management functions
function isDarkMode() {
  return getJSON('theme.darkMode', false);
}

function setDarkMode(enabled) {
  setJSON('theme.darkMode', enabled);
  applyTheme(enabled);
}

function applyTheme(isDark) {
  const body = document.body;
  const icon = document.getElementById('themeIcon');
  
  if (isDark) {
    body.classList.add('dark-mode');
    if (icon) icon.textContent = '☀️';
    console.log('🌙 تم تفعيل الوضع المظلم');
  } else {
    body.classList.remove('dark-mode');
    if (icon) icon.textContent = '🌙';
    console.log('☀️ تم تفعيل الوضع الفاتح');
  }
}

function toggleTheme() {
  const currentlyDark = isDarkMode();
  setDarkMode(!currentlyDark);
  toastSuccess(!currentlyDark ? '🌙 تم التبديل للوضع المظلم' : '☀️ تم التبديل للوضع الفاتح');
}

// Simple Loader functions
function showLoader() {
  const loader = document.getElementById('simpleLoader');
  if (loader) {
    loader.classList.remove('hidden');
  }
}

function hideLoader() {
  const loader = document.getElementById('simpleLoader');
  if (loader) {
    loader.classList.add('hidden');
  }
}

// Date computation function (moved up)

// Initialize persisted datasets with sample data
function initDatasets() {
  if (!getJSON(LS_KEYS.CODES, null)) {
    // Clone to avoid mutating import
    const copy = JSON.parse(JSON.stringify(STUDENT_CODES));
    setJSON(LS_KEYS.CODES, copy);
  }
  


}

// State
function getAuth() { return !!getJSON(LS_KEYS.AUTH, false); }
function setAuth(v) { localStorage.setItem(LS_KEYS.AUTH, JSON.stringify(!!v)); }
function getSession() { return getJSON(LS_KEYS.SESSION, null); }
function setSession(s) { setJSON(LS_KEYS.SESSION, s); }
function clearSession() { localStorage.removeItem(LS_KEYS.SESSION); }

function getCodes() { return getJSON(LS_KEYS.CODES, {}); }
function setCodes(c) { setJSON(LS_KEYS.CODES, c); }

// Central codes + locking via JSONBin
const LOCK_TTL_MS = 120000; // مدة صلاحية القفل 2 دقيقة
const HEARTBEAT_INTERVAL_MS = 30000; // نبض كل 30 ثانية
let heartbeatTimer = null;

function nowIso() { return new Date().toISOString(); }
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function getCodesCentral() {
  if (!JSONBIN_CONFIG.CODES_BIN) return null;
  const record = await fetchFromBin(JSONBIN_CONFIG.CODES_BIN);
  if (!record) return null;
  // دعم شكلين: {codes, locks} أو كائن الأكواد مباشرة
  if (record.codes) return { codes: record.codes, locks: record.locks || {} };
  return { codes: record, locks: record.locks || {} };
}

async function setCodesCentral(updater) {
  if (!JSONBIN_CONFIG.CODES_BIN) return false;
  let data;
  if (typeof updater === 'function') {
    const current = await getCodesCentral();
    const base = current || { codes: getCodes(), locks: {} };
    data = await updater(base);
  } else {
    data = updater;
  }
  return saveToBin(JSONBIN_CONFIG.CODES_BIN, data);
}

function isLockActive(lock) {
  if (!lock) return false;
  const expiresAt = new Date(lock.expiresAt).getTime();
  return Date.now() < expiresAt;
}

async function acquireCodeLock(code, session) {
  if (!JSONBIN_CONFIG.CODES_BIN) return { ok: true, offline: true };
  const current = await getCodesCentral();
  const data = current || { codes: getCodes(), locks: {} };
  if (!data.codes || !data.codes[code]) {
    return { ok: false, error: 'كود الطالب غير صحيح' };
  }
  const existing = data.locks?.[code];
  if (existing && isLockActive(existing) && existing.sessionId !== session.sessionId) {
    return { ok: false, error: 'هذا الحساب مستخدم حالياً. جرب كود آخر.' };
  }
  const lock = {
    sessionId: session.sessionId,
    studentName: session.studentName,
    lockedAt: nowIso(),
    heartbeatAt: nowIso(),
    expiresAt: new Date(Date.now() + LOCK_TTL_MS).toISOString(),
  };
  data.locks = data.locks || {};
  data.locks[code] = lock;
  const ok = await saveToBin(JSONBIN_CONFIG.CODES_BIN, data);
  if (!ok) return { ok: false, error: 'تعذر تأمين الكود مركزياً' };
  return { ok: true };
}

async function releaseCodeLock(code, sessionId) {
  if (!JSONBIN_CONFIG.CODES_BIN) return true;
  const current = await getCodesCentral();
  if (!current || !current.locks) return true;
  const lock = current.locks[code];
  if (lock && lock.sessionId && lock.sessionId !== sessionId) {
    return true; // عدم إزالة قفل مستخدم آخر
  }
  delete current.locks[code];
  return saveToBin(JSONBIN_CONFIG.CODES_BIN, current);
}

async function heartbeat(code, sessionId) {
  if (!JSONBIN_CONFIG.CODES_BIN) return true;
  const current = await getCodesCentral();
  if (!current) return false;
  current.locks = current.locks || {};
  const lock = current.locks[code];
  if (lock && lock.sessionId === sessionId) {
    lock.heartbeatAt = nowIso();
    lock.expiresAt = new Date(Date.now() + LOCK_TTL_MS).toISOString();
    return saveToBin(JSONBIN_CONFIG.CODES_BIN, current);
  }
  return false;
}

function startHeartbeat() {
  const session = getSession();
  if (!session) return;
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    heartbeat(session.studentCode, session.sessionId).catch(err => console.warn('Heartbeat failed:', err?.message || err));
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

window.addEventListener('beforeunload', () => {
  const session = getSession();
  if (session) {
    // أفضل جهد لتحرير القفل قبل الإغلاق
    releaseCodeLock(session.studentCode, session.sessionId);
  }
});

// JSONBin functions for homework and announcements
async function getHomework() {
  try {
    const binData = await fetchFromBin(JSONBIN_CONFIG.HOMEWORK_BIN);
    if (binData && binData.homework) {
      // حفظ في localStorage كنسخة احتياطية
      setJSON(LS_KEYS.HOMEWORK, binData.homework);
      return binData.homework;
    }
  } catch (error) {
    console.warn('فشل في جلب البيانات من JSONBin، استخدام البيانات المحلية:', error.message);
  }
  // Fallback to localStorage if JSONBin fails
  return getJSON(LS_KEYS.HOMEWORK, []);
}

async function setHomework(list) {
  // حفظ في localStorage أولاً كضمان
  setJSON(LS_KEYS.HOMEWORK, list);
  try {
    const success = await saveToBin(JSONBIN_CONFIG.HOMEWORK_BIN, { homework: list });
    if (!success) {
      console.warn('فشل حفظ البيانات في JSONBin، البيانات محفوظة محلياً');
    }
  } catch (error) {
    console.warn('خطأ في حفظ البيانات:', error.message);
  }
}

async function getAnnouncements() {
  try {
    const binData = await fetchFromBin(JSONBIN_CONFIG.ANNOUNCEMENTS_BIN);
    if (binData && binData.announcements) {
      // حفظ في localStorage كنسخة احتياطية
      setJSON(LS_KEYS.ANNOUNCEMENTS, binData.announcements);
      return binData.announcements;
    }
  } catch (error) {
    console.warn('فشل في جلب التبليغات من JSONBin، استخدام البيانات المحلية:', error.message);
  }
  // Fallback to localStorage if JSONBin fails
  return getJSON(LS_KEYS.ANNOUNCEMENTS, []);
}

async function setAnnouncements(list) {
  // حفظ في localStorage أولاً كضمان
  setJSON(LS_KEYS.ANNOUNCEMENTS, list);
  try {
    const success = await saveToBin(JSONBIN_CONFIG.ANNOUNCEMENTS_BIN, { announcements: list });
    if (!success) {
      console.warn('فشل حفظ التبليغات في JSONBin، البيانات محفوظة محلياً');
    }
  } catch (error) {
    console.warn('خطأ في حفظ التبليغات:', error.message);
  }
}

// DOM refs
const authSection = document.getElementById('authSection');
const studentLoginSection = document.getElementById('studentLoginSection');
const dashboardSection = document.getElementById('dashboardSection');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const studentLoginForm = document.getElementById('studentLoginForm');
const studentNameInput = document.getElementById('studentName');
const studentCodeInput = document.getElementById('studentCode');

const studentNameDisplay = document.getElementById('studentNameDisplay');
const studentSectionDisplay = document.getElementById('studentSectionDisplay');
const publisherBadge = document.getElementById('publisherBadge');
const homeworkSectionLabel = document.getElementById('homeworkSectionLabel');

const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
const tabPanels = {
  homework: document.getElementById('tab-homework'),
  archived: document.getElementById('tab-archived'),
  stats: document.getElementById('tab-stats'),
  announcements: document.getElementById('tab-announcements'),
  create: document.getElementById('tab-create'),
};
const createTabBtn = document.getElementById('createTabBtn');
const statsTabBtn = document.getElementById('statsTabBtn');
const adminTabsRow = document.getElementById('adminTabsRow');

const homeworkListEl = document.getElementById('homeworkList');
const archivedListEl = document.getElementById('archivedList');
const hwTitle = document.getElementById('hwTitle');
const hwDescription = document.getElementById('hwDescription');
const hwDueDay = document.getElementById('hwDueDay');
const hwSectionAdmin = document.getElementById('hwSectionAdmin');
const adminAnnouncementFormWrapper = document.getElementById('adminAnnouncementFormWrapper');
const createAnnouncementForm = document.getElementById('createAnnouncementForm');
const annTitle = document.getElementById('annTitle');
const annBody = document.getElementById('annBody');
const announcementsListEl = document.getElementById('announcementsList');

// Modal
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalMeta = document.getElementById('modalMeta');

const createHomeworkForm = document.getElementById('createHomeworkForm');

function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

function setActiveTab(id) {
  if (tabBtns && tabBtns.length) {
    tabBtns.forEach(btn => {
      const active = btn.dataset.tab === id;
      btn.classList.toggle('active', active);
    });
  }
  if (tabPanels) {
    Object.entries(tabPanels).forEach(([key, panel]) => {
      if (panel) {
        if (key === id) show(panel); else hide(panel);
      }
    });
  }
}

// Subjects removed from creation flow

function formatViews(hw) {
  const n = hw.viewsCount || 0;
  return `${n} مشاهدة`;
}

function openHomeworkDetails(hw) {
  if (!modalOverlay || !modalTitle || !modalBody) return;
  modalTitle.textContent = hw.title || '';
  
  // تنسيق خاص للواجبات: المعلومات الفوقية، الواجب، المعلومات الجوة
  if (modalMeta) {
    // المعلومات الفوقية
    const topInfo = [];
    if (hw.section) topInfo.push(`🏢 الشعبة: ${hw.section}`);
    if (hw.dueDay) topInfo.push(`📅 موعد التسليم: ${hw.dueDay}`);
    
    // المعلومات الجوة (السفلية)
    const bottomInfo = [];
    if (hw.viewsCount || hw.viewsCount === 0) bottomInfo.push(`👁 ${formatViews(hw)}`);
    if (hw.creatorName) bottomInfo.push(`👤 بواسطة: ${hw.creatorName}`);
    if (hw.isArchived) bottomInfo.push(`📋 مؤرشف`);
    if (hw.createdAt) {
      const createdDate = new Date(hw.createdAt);
      bottomInfo.push(`🕰 أنشئ في: ${createdDate.toLocaleString('ar-EG')}`);
    }
    
    // ترتيب العرض: معلومات علوية + مسافات + واجب + مسافات + معلومات جوة
    let modalContent = '';
    
    if (topInfo.length > 0) {
      modalContent += `<div class="top-modal-info mb-4">${topInfo.join(' • ')}</div>`;
      modalContent += `<hr class="my-4 border-gray-200">`; // سطرين
    }
    
    modalContent += `<div class="homework-content mb-4"><strong class="text-lg">${hw.title}</strong></div>`;
    
    if (bottomInfo.length > 0) {
      modalContent += `<hr class="my-4 border-gray-200">`; // سطرين
      modalContent += `<div class="bottom-modal-info">${bottomInfo.join(' • ')}</div>`;
    }
    
    modalMeta.innerHTML = modalContent;
  }
  
  modalBody.textContent = hw.description || '';
  modalOverlay.classList.remove('hidden');
}

function openAnnouncementDetails(ann) {
  if (!modalOverlay || !modalTitle || !modalBody) return;
  modalTitle.textContent = ann.title || '';
  modalBody.textContent = ann.body || '';
  if (modalMeta) {
    const metaParts = [];
    if (ann.creator) metaParts.push(`👤 بواسطة: ${ann.creator}`);
    if (ann.isArchived) metaParts.push(`📋 مؤرشف`);
    if (ann.createdAt) {
      const createdDate = new Date(ann.createdAt);
      metaParts.push(`🕰 أنشئ في: ${createdDate.toLocaleString('ar-EG')}`);
    }
    modalMeta.innerHTML = metaParts.join('<br>');
  }
  modalOverlay.classList.remove('hidden');
}
function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add('hidden');
}

function ensureViewCount(hw, viewerCode) {
  if (!hw || typeof hw !== 'object') return false;
  
  hw.viewers = hw.viewers || [];
  hw.viewsCount = hw.viewsCount || 0;
  
  if (!viewerCode) return false;
  
  if (!hw.viewers.includes(viewerCode)) {
    hw.viewers.push(viewerCode);
    hw.viewsCount = hw.viewsCount + 1;
    return true;
  }
  return false;
}

function computeArchiveAt(dueDay, createdAt) {
  const created = new Date(createdAt);
  const daysMap = {
    'الأحد': 0,
    'الاثنين': 1,
    'الثلاثاء': 2,
    'الأربعاء': 3,
    'الخميس': 4,
  };
  const targetDow = daysMap[dueDay];
  if (targetDow === undefined) {
    // افتراضي: أرشف نهاية اليوم الحالي إذا لم يُحدَّد بشكل صحيح
    const fallback = new Date(created);
    fallback.setHours(23,59,0,0);
    return fallback.toISOString();
  }

  const now = new Date();
  const currentDow = now.getDay();
  let delta = targetDow - currentDow;
  if (delta <= 0) delta += 7; // المرة القادمة لهذا اليوم
  const dueStart = new Date(now);
  dueStart.setDate(now.getDate() + delta);
  dueStart.setHours(0, 0, 0, 0); // بداية يوم الاستحقاق
  // أرشفة قبلها بدقيقة (السبت 11:59 ليلاً إذا كان الأحد، وهكذا لباقي الأيام)
  const archiveAt = new Date(dueStart.getTime() - 60 * 1000);
  return archiveAt.toISOString();
}

async function checkAndAutoArchive() {
  const all = await getHomework();
  const now = new Date();
  let changed = false;
  for (const hw of all) {
    if (hw.isArchived) continue;
    if (hw.archiveAt && new Date(hw.archiveAt) <= now) {
      hw.isArchived = true;
      changed = true;
    }
  }
  if (changed) {
    await setHomework(all);
    // تحديث الواجهة فقط إذا كان المستخدم مسجلاً للدخول
    const session = getSession();
    if (session) {
      await renderHomework();
      await renderArchived();
    }
  }
}

async function renderHomework() {
  const session = getSession();
  if (!session || !homeworkListEl) return;
  const all = await getHomework();
  const isAdmin = !!session.isAdmin;
  const current = all.filter(h => !h.isArchived && (isAdmin || h.section === session.section));

  homeworkListEl.innerHTML = '';
  if (current.length === 0) {
    homeworkListEl.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">لا توجد واجبات حالية</h3>
        <p class="text-gray-500">لم يتم نشر أي واجبات جديدة بعد</p>
      </div>`;
    return;
  }

  for (const hw of current) {
    const canArchive = isAdmin || hw.createdByCode === session.studentCode;
    const canDelete = isAdmin;
    const card = document.createElement('div');
    card.className = 'bg-white border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md hover:border-blue-300';
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <!-- المعلومات اليسرى -->
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800 mb-2">${hw.title}</h3>
          <div class="space-y-1">
            ${hw.dueDay ? `<p class="text-sm text-orange-600 font-medium">📅 موعد التسليم: ${hw.dueDay}</p>` : ''}
            ${hw.creatorName ? `<p class="text-sm text-blue-600">👤 بواسطة: ${hw.creatorName}</p>` : ''}
            <p class="text-sm text-gray-500">👁 ${formatViews(hw)}</p>
          </div>
        </div>
        
        <!-- الأزرار اليمين -->
        <div class="flex flex-col gap-2 ml-4">
          <button data-id="${hw.id}" class="zoom-btn px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-all">تكبير</button>
          ${canArchive ? `<button data-id="${hw.id}" class="archive-btn px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-red-600 hover:text-white transition-all">أرشفة</button>` : ''}
          ${canDelete ? `<button data-id="${hw.id}" class="delete-btn px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-all">حذف</button>` : ''}
        </div>
      </div>`;
    homeworkListEl.appendChild(card);
  }

  homeworkListEl.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const all = await getHomework();
      const hw = all.find(h => String(h.id) === String(id));
      if (!hw) return;
      const session = getSession();
      const incremented = ensureViewCount(hw, session?.studentCode);
      if (incremented) await setHomework(all);
      openHomeworkDetails(hw);
      await renderHomework();
    });
  });
  homeworkListEl.querySelectorAll('.archive-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await archiveHomework(id);
    });
  });
  homeworkListEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await deleteHomework(id);
    });
  });
}

async function renderArchived() {
  const session = getSession();
  if (!session || !archivedListEl) return;
  const all = await getHomework();
  const isAdmin = !!session.isAdmin;
  const archived = all.filter(h => h.isArchived && (isAdmin || h.section === session.section));

  archivedListEl.innerHTML = '';
  if (archived.length === 0) {
    archivedListEl.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">لا توجد واجبات قديمة</h3>
        <p class="text-gray-500">لم يتم أرشفة أي واجبات بعد</p>
      </div>`;
    return;
  }

  for (const hw of archived) {
    const canDelete = isAdmin;
    const card = document.createElement('div');
    card.className = 'bg-gray-50 border-2 border-gray-200 rounded-xl p-6 opacity-75';
    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-700 mb-2">${hw.title}</h3>
          <div class="space-y-1 mb-3">
            ${hw.dueDay ? `<p class="text-sm text-orange-500">📅 ليوم ${hw.dueDay}</p>` : ''}
            <p class="text-sm text-gray-400">👁 ${formatViews(hw)}</p>
            ${hw.creatorName ? `<p class="text-xs text-gray-400">بواسطة: ${hw.creatorName}</p>` : ''}
            <span class="inline-block bg-gray-300 text-gray-600 px-2 py-1 rounded-full text-xs">مؤرشف</span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button data-id="${hw.id}" class="zoom-btn px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all hover:bg-blue-700">تكبير</button>
          ${canDelete ? `<button data-id="${hw.id}" class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg font-medium transition-all hover:bg-red-700">حذف</button>` : ''}
        </div>
      </div>`;
    archivedListEl.appendChild(card);
  }

  // Bind events for archived list
  archivedListEl.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const all = await getHomework();
      const hw = all.find(h => String(h.id) === String(id));
      if (!hw) return;
      const session = getSession();
      const incremented = ensureViewCount(hw, session?.studentCode);
      if (incremented) await setHomework(all);
      openHomeworkDetails(hw);
      await renderArchived();
    });
  });
  archivedListEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await deleteHomework(id);
    });
  });
}

async function archiveHomework(id) {
  try {
    const all = await getHomework();
    const idx = all.findIndex(h => String(h.id) === String(id));
    if (idx === -1) {
      toastError('لم يتم العثور على الواجب');
      return;
    }
    
    const hw = all[idx];
    if (!confirm(`هل أنت متأكد من أرشفة الواجب: "${hw.title}"\n\nسينتقل إلى قسم الواجبات القديمة`)) {
      return;
    }
    
    all[idx].isArchived = true;
    all[idx].archivedAt = new Date().toISOString();
    
    await setHomework(all);
    toastSuccess('تم نقل الواجب إلى الواجبات القديمة');
    
    await Promise.all([renderHomework(), renderArchived()]);
  } catch (error) {
    console.error('Error archiving homework:', error);
    toastError('حدث خطأ أثناء أرشفة الواجب');
  }
}

async function deleteHomework(id) {
  try {
    const all = await getHomework();
    const hw = all.find(h => String(h.id) === String(id));
    
    if (!hw) {
      toastError('لم يتم العثور على الواجب');
      return;
    }
    
    if (!confirm(`هل أنت متأكد من حذف الواجب: "${hw.title}"\n\nهذا الإجراء لا يمكن التراجع عنه!`)) {
      return;
    }
    
    const filtered = all.filter(h => String(h.id) !== String(id));
    await setHomework(filtered);
    toastSuccess('تم حذف الواجب');
    
    await Promise.all([renderHomework(), renderArchived()]);
  } catch (error) {
    console.error('Error deleting homework:', error);
    toastError('حدث خطأ أثناء حذف الواجب');
  }
}

// Enhanced Form validation functions with better security and validation
function validateHomeworkForm(title, description, dueDay) {
  const errors = [];
  
  // فحص العنوان
  if (!title || typeof title !== 'string') {
    errors.push('يجب إدخال عنوان صحيح');
  } else if (title.trim().length < 3) {
    errors.push('عنوان الواجب يجب أن يكون 3 أحرف على الأقل');
  } else if (title.trim().length > 100) {
    errors.push('عنوان الواجب يجب ألا يتجاوز 100 حرف');
  }
  
  // فحص الوصف
  if (!description || typeof description !== 'string') {
    errors.push('يجب إدخال تفاصيل الواجب');
  } else if (description.trim().length < 10) {
    errors.push('تفاصيل الواجب يجب أن تكون 10 أحرف على الأقل');
  } else if (description.trim().length > 500) {
    errors.push('تفاصيل الواجب يجب ألا تتجاوز 500 حرف');
  }
  
  // فحص يوم الاستحقاق
  const validDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  if (!dueDay) {
    errors.push('يجب اختيار يوم الاستحقاق');
  } else if (!validDays.includes(dueDay)) {
    errors.push('يوم الاستحقاق غير صحيح');
  }
  
  return errors;
}

function validateAnnouncementForm(title, body) {
  const errors = [];
  
  // فحص العنوان
  if (!title || typeof title !== 'string') {
    errors.push('يجب إدخال عنوان صحيح');
  } else if (title.trim().length < 3) {
    errors.push('عنوان التبليغ يجب أن يكون 3 أحرف على الأقل');
  } else if (title.trim().length > 80) {
    errors.push('عنوان التبليغ يجب ألا يتجاوز 80 حرف');
  }
  
  // فحص نص التبليغ
  if (!body || typeof body !== 'string') {
    errors.push('يجب إدخال نص التبليغ');
  } else if (body.trim().length < 5) {
    errors.push('نص التبليغ يجب أن يكون 5 أحرف على الأقل');
  } else if (body.trim().length > 300) {
    errors.push('نص التبليغ يجب ألا يتجاوز 300 حرف');
  }
  
  return errors;
}

function validateStudentLogin(name, code) {
  const errors = [];
  
  // فحص الاسم
  if (!name || typeof name !== 'string') {
    errors.push('يجب إدخال اسم صحيح');
  } else if (name.trim().length < 2) {
    errors.push('يجب إدخال اسم صحيح (حرفين على الأقل)');
  } else if (name.trim().length > 50) {
    errors.push('الاسم طويل جداً (أقصى حد 50 حرف)');
  } else if (!/^[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿\sa-zA-Z]+$/.test(name.trim())) {
    errors.push('الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط');
  }
  
  // فحص الكود
  if (!code || typeof code !== 'string') {
    errors.push('يجب إدخال كود صحيح');
  } else if (code.trim().length < 4) {
    errors.push('يجب إدخال كود صحيح');
  } else if (code.trim().length > 10) {
    errors.push('الكود طويل جداً');
  } else if (!/^[A-Za-z0-9]+$/.test(code.trim())) {
    errors.push('الكود يجب أن يحتوي على أحرف وأرقام إنجليزية فقط');
  }
  
  return errors;
}

// تحسين دالة تنظيف المدخلات
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // إزالة المسافات الزائدة
  let cleaned = input.trim();
  
  // إزالة HTML tags و script tags
  cleaned = cleaned.replace(/<script[^>]*>.*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // إزالة أحرف خطيرة
  cleaned = cleaned.replace(/[<>"'&]/g, '');
  
  // إزالة المسافات الزائدة في النهاية
  return cleaned.trim();
}

async function createHomework(e) {
  e.preventDefault();
  
  const session = getSession();
  if (!session) {
    toastError('يجب تسجيل الدخول أولاً');
    return;
  }
  
  const title = sanitizeInput(hwTitle.value.trim());
  const description = sanitizeInput(hwDescription.value.trim());
  const dueDay = hwDueDay ? hwDueDay.value : '';
  
  // Validate form
  const errors = validateHomeworkForm(title, description, dueDay);
  if (errors.length > 0) {
    toastError(errors[0]); // Show first error
    return;
  }

  const targetSection = (session.isAdmin && hwSectionAdmin && hwSectionAdmin.value) ? hwSectionAdmin.value : session.section;
  const createdAt = new Date().toISOString();
  const archiveAt = computeArchiveAt(dueDay, createdAt);

  try {
    const all = await getHomework();
    const newHomework = {
      id: Date.now() + Math.random(), // Better unique ID
      title,
      description,
      dueDay: dueDay || '',
      section: targetSection,
      createdByCode: session.studentCode,
      creatorName: session.studentName,
      isArchived: false,
      createdAt,
      archiveAt,
      viewsCount: 0,
      viewers: [],
    };
    
    all.unshift(newHomework);
    await setHomework(all);
    toastSuccess('تم إنشاء الواجب بنجاح!');
    
    // Clear form
    hwTitle.value = '';
    hwDescription.value = '';
    if (hwDueDay) hwDueDay.value = '';
    if (hwSectionAdmin) hwSectionAdmin.value = '';
    
    setActiveTab('homework');
    await renderHomework();
  } catch (error) {
    console.error('Error creating homework:', error);
    toastError('حدث خطأ أثناء إنشاء الواجب');
  }
}

function onSignIn() {
  // إخفاء authSection وإظهار studentLoginSection
  hide(authSection);
  show(studentLoginSection);
  
  toastSuccess('مرحباً بك! أدخل بياناتك');
}

async function onSignOut() {
  const session = getSession();
  try {
    if (session) {
      // تحرير القفل المركزي إن وُجد
      await releaseCodeLock(session.studentCode, session.sessionId);
      stopHeartbeat();
      // تحديث الحالة محلياً كأفضل جهد
      const codes = getCodes();
      if (codes[session.studentCode]) {
        codes[session.studentCode].isActive = false;
        setCodes(codes);
      }
    }
  } catch (e) {
    console.warn('Sign out cleanup failed:', e?.message || e);
  }
  clearSession();
  setAuth(false);
  toastSuccess('تم تسجيل الخروج');
  renderApp();
}

// دالة لتنظيف جميع الأكواد المستخدمة (للاختبار)
function clearAllActiveCodes() {
  const codes = getCodes();
  Object.keys(codes).forEach(code => {
    codes[code].isActive = false;
  });
  setCodes(codes);
}


async function onStudentLogin(e) {
  e.preventDefault();
  
  const name = sanitizeInput(studentNameInput.value.trim());
  const code = sanitizeInput(studentCodeInput.value.trim());
  
  // Validate inputs
  const errors = validateStudentLogin(name, code);
  if (errors.length > 0) {
    toastError(errors[0]);
    return;
  }

  const useCentral = !!JSONBIN_CONFIG.CODES_BIN;

  try {
    // Load codes map (central first, fallback to local)
    let codesMap;
    let central;
    if (useCentral) {
      central = await getCodesCentral();
      codesMap = central?.codes || getCodes();
    } else {
      codesMap = getCodes();
    }

    if (!codesMap[code]) {
      toastError('كود الطالب غير صحيح, الرجاء التحقق من الكود');
      return;
    }

    const isAdmin = code === 'baqermanee';
    if (isAdmin) {
      const requiredName = 'باقر أسعد حسين';
      if (name !== requiredName) {
        toastError('الحساب هو للأدمن فقط');
        return;
      }
    }

    // If no central locking, enforce local lock check
    if (!useCentral) {
      if (codesMap[code].isActive) {
        toastError('هذا الحساب مستخدم حالياً. جرب كود آخر.');
        return;
      }
    }

    const session = {
      studentName: isAdmin ? 'باقر أسعد حسين' : name,
      studentCode: code,
      section: codesMap[code].section,
      canPostHomework: isAdmin ? true : !!codesMap[code].canPost,
      isAdmin,
      sessionId: generateSessionId(),
    };

    if (useCentral) {
      const res = await acquireCodeLock(code, session);
      if (!res.ok) {
        toastError(res.error || 'تعذر تأمين الكود مركزياً');
        return;
      }
    } else {
      // Local-only: mark active
      codesMap[code].isActive = true;
      codesMap[code].name = name;
      setCodes(codesMap);
    }

    setSession(session);
    setAuth(true); // تعيين حالة المصادقة
    toastSuccess('تم تسجيل الدخول بنجاح!');

    // مسح النموذج
    if (studentNameInput) studentNameInput.value = '';
    if (studentCodeInput) studentCodeInput.value = '';

    // ابدأ النبض لتجديد القفل
    startHeartbeat();

    // إعادة تحميل التطبيق
    await renderApp();
  } catch (error) {
    console.error('Login error:', error);
    toastError('حدث خطأ أثناء تسجيل الدخول');
  }
}


async function renderApp() {
  try {
    // Apply saved theme
    applyTheme(isDarkMode());
    
    // تأكد من وجود عناصر DOM
    if (!authSection || !studentLoginSection || !dashboardSection) {
      toastError('خطأ في تحميل عناصر الصفحة');
      return;
    }
    
    initDatasets();
    
    const isLogged = getAuth();
    const session = getSession();

    // Header button visibility
    if (isLogged && session) { 
      show(signOutBtn);
    } else { 
      hide(signOutBtn);
    }
    
    // زر الوضع يظهر دائماً
    show(themeToggle);

    if (!isLogged) {
      show(authSection); 
      hide(studentLoginSection); 
      hide(dashboardSection);
      // تعيين الحالة بشكل صحيح
      setAuth(false);
      return;
    }

    if (!session) {
      hide(authSection); show(studentLoginSection); hide(dashboardSection);
      return;
    }

    // Render dashboard
    hide(authSection); hide(studentLoginSection); show(dashboardSection);
    
  // تعيين الحالة بشكل صحيح للمستخدم المسجل
  setAuth(true);
  // ابدأ نبض الجلسة لتجديد القفل المركزي عند وجود جلسة محفوظة
  startHeartbeat();

  if (studentNameDisplay) studentNameDisplay.textContent = session.studentName;
    if (studentSectionDisplay) studentSectionDisplay.textContent = session.section;
    if (homeworkSectionLabel) homeworkSectionLabel.textContent = session.section;

    // الشارة تظهر فقط للمسؤول
    if (session.isAdmin) {
      show(publisherBadge);
    } else {
      hide(publisherBadge);
    }

    // إظهار تبويب الإنشاء لمن يملك النشر (الناشرين والمسؤول)
    if (session.canPostHomework) {
      show(createTabBtn);
    } else {
      hide(createTabBtn);
    }

    // عناصر خاصة بالمسؤول
    if (session.isAdmin) {
      if (adminAnnouncementFormWrapper) show(adminAnnouncementFormWrapper);
      const adminSectionSelect = document.getElementById('adminSectionSelect');
      if (adminSectionSelect) show(adminSectionSelect);
      if (adminTabsRow) show(adminTabsRow);
    } else {
      if (adminAnnouncementFormWrapper) hide(adminAnnouncementFormWrapper);
      const adminSectionSelect = document.getElementById('adminSectionSelect');
      if (adminSectionSelect) hide(adminSectionSelect);
      if (adminTabsRow) hide(adminTabsRow);
    }

    // Set default tab to homework on first load
    if (!tabBtns.some(b => b.classList.contains('active'))) {
      setActiveTab('homework');
    }

    await renderHomework();
    await renderArchived();
    await renderAnnouncements();
  } catch (error) {
    console.error('❌ خطأ في renderApp:', error);
    toastError('حدث خطأ في تحميل التطبيق');
    
    // Fallback: show authSection manually if there's an error
    if (authSection) {
      authSection.classList.remove('hidden');
    }
    if (studentLoginSection) {
      studentLoginSection.classList.add('hidden');
    }
    if (dashboardSection) {
      dashboardSection.classList.add('hidden');
    }
  }
}

// Event bindings - إعادة تفعيل الأزرار
function bindEvents() {
  try {
    // إعادة الحصول على العناصر للتأكد
    const signInButton = document.getElementById('signInBtn');
    const themeButton = document.getElementById('themeToggle');
    const signOutButton = document.getElementById('signOutBtn');
    const loginForm = document.getElementById('studentLoginForm');
  
  // زر تسجيل الدخول في الشاشة الأولى
  if (signInButton) {
    signInButton.addEventListener('click', function(e) {
      e.preventDefault();
      onSignIn();
    });
  }
  
  // زر تسجيل الخروج
  if (signOutButton) {
    signOutButton.addEventListener('click', function(e) {
      e.preventDefault();
      onSignOut();
    });
  }
  
  // زر تبديل الوضع
  if (themeButton) {
    themeButton.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTheme();
    });
  }
  
  // نموذج تسجيل دخول الطالب
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      onStudentLogin(e);
    });
  }
  
  // نموذج إنشاء واجب
  if (createHomeworkForm) {
    createHomeworkForm.addEventListener('submit', function(e) {
      e.preventDefault();
      createHomework(e);
    });
  }
  
  // ربط أحداث التبويبات
  tabBtns.forEach(btn => btn.addEventListener('click', async () => {
    const tab = btn.dataset.tab;
    setActiveTab(tab);
    if (tab === 'announcements') await renderAnnouncements();
    if (tab === 'homework') await renderHomework();
    if (tab === 'archived') await renderArchived();
    if (tab === 'stats') await renderStats();
  }));
  
  // نموذج إنشاء تبليغ
  if (createAnnouncementForm) {
    createAnnouncementForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const session = getSession();
      if (!session?.isAdmin) {
        toastError('صلاحية غير كافية');
        return;
      }
      
      const title = sanitizeInput((annTitle?.value || '').trim());
      const body = sanitizeInput((annBody?.value || '').trim());
      
      // Validate form
      const errors = validateAnnouncementForm(title, body);
      if (errors.length > 0) {
        toastError(errors[0]);
        return;
      }
      
      try {
        const all = await getAnnouncements();
        const newAnnouncement = {
          id: Date.now() + Math.random(),
          title,
          body,
          createdAt: new Date().toISOString(),
          creator: session.studentName,
          isArchived: false
        };
        
        all.unshift(newAnnouncement);
        await setAnnouncements(all);
        toastSuccess('تم نشر التبليغ الإداري');
        
        // Clear form
        if (annTitle) annTitle.value = '';
        if (annBody) annBody.value = '';
        
        await renderAnnouncements();
      } catch (error) {
        console.error('Error creating announcement:', error);
        toastError('حدث خطأ أثناء نشر التبليغ');
      }
    });
  }
  
  // ربط أحداث Modal
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  
  // Keyboard navigation for modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay?.classList.contains('hidden')) {
      closeModal();
    }
  });
  } catch (error) {
    console.error('❌ خطأ في ربط الأحداث:', error);
    toastError('حدث خطأ في ربط أحداث الصفحة');
  }
}

async function renderAnnouncements() {
  if (!announcementsListEl) return;
  const session = getSession();
  if (!session) return;
  const isAdmin = !!session.isAdmin;
  const raw = await getAnnouncements();
  const list = isAdmin ? raw : raw.filter(a => !a.isArchived);
  announcementsListEl.innerHTML = '';
  if (list.length === 0) {
    announcementsListEl.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">📢</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">لا توجد تبليغات</h3>
        <p class="text-gray-500">ستظهر هنا التبليغات الإدارية الجديدة</p>
      </div>`;
    return;
  }
  for (const ann of list) {
    const card = document.createElement('div');
    card.className = 'bg-white border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md hover:border-blue-300';
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <!-- المعلومات اليسرى -->
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h4 class="text-lg font-bold text-gray-800">${ann.title}</h4>
            ${ann.isArchived ? `<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">مؤرشف</span>` : ''}
          </div>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">${ann.body}</p>
          <div class="text-xs text-gray-500">بواسطة: ${ann.creator} • ${new Date(ann.createdAt).toLocaleString()}</div>
        </div>
        
        <!-- الأزرار اليمين -->
        <div class="flex flex-col gap-2 ml-4">
          <button data-id="${ann.id}" class="zoom-ann-btn px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-all">تكبير</button>
          ${isAdmin ? `
            <button data-id="${ann.id}" class="arch-ann px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-all">${ann.isArchived ? 'إلغاء' : 'أرشفة'}</button>
            <button data-id="${ann.id}" class="del-ann px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-all">حذف</button>
          ` : ''}
        </div>
      </div>
    `;
    announcementsListEl.appendChild(card);
  }
  
  // Zoom announcements event listeners
  announcementsListEl.querySelectorAll('.zoom-ann-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const all = await getAnnouncements();
      const ann = all.find(a => String(a.id) === String(id));
      if (!ann) return;
      openAnnouncementDetails(ann);
    });
  });
  
  announcementsListEl.querySelectorAll('.arch-ann').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const all = await getAnnouncements();
      const idx = all.findIndex(a => String(a.id) === String(id));
      if (idx !== -1) {
        all[idx].isArchived = !all[idx].isArchived;
        await setAnnouncements(all);
        toastSuccess(all[idx].isArchived ? 'تمت أرشفة التبليغ' : 'تم إلغاء الأرشفة');
        await renderAnnouncements();
      }
    });
  });
  announcementsListEl.querySelectorAll('.del-ann').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const all = await getAnnouncements();
      const filtered = all.filter(a => String(a.id) !== String(id));
      await setAnnouncements(filtered);
      toastSuccess('تم حذف التبليغ');
      await renderAnnouncements();
    });
  });
}

async function renderStats() {
  const statsEl = document.getElementById('statsContent');
  if (!statsEl) return;
  const session = getSession();
  if (!session?.isAdmin) return;
  const all = await getHomework();
  const total = all.length;
  const current = all.filter(h => !h.isArchived).length;
  const archived = all.filter(h => h.isArchived).length;
  const totalViews = all.reduce((sum, h) => sum + (h.viewsCount || 0), 0);

  statsEl.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div class="text-sm text-gray-500">إجمالي الواجبات</div>
        <div class="text-2xl font-bold">${total}</div>
      </div>
      <div class="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div class="text-sm text-gray-500">الحالية</div>
        <div class="text-2xl font-bold">${current}</div>
      </div>
      <div class="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div class="text-sm text-gray-500">المؤرشفة</div>
        <div class="text-2xl font-bold">${archived}</div>
      </div>
      <div class="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div class="text-sm text-gray-500">إجمالي المشاهدات</div>
        <div class="text-2xl font-bold">${totalViews}</div>
      </div>
    </div>
    <div class="mt-6">
      <h4 class="text-lg font-bold text-gray-800 mb-2">تفاصيل الواجبات</h4>
      <div id="statsList" class="space-y-2"></div>
    </div>
  `;

  const listEl = document.getElementById('statsList');
  for (const hw of all) {
    const row = document.createElement('div');
    row.className = 'flex flex-wrap items-center justify-between bg-white border-2 border-gray-200 rounded-lg p-3';
    row.innerHTML = `
      <div class="flex-1 min-w-[200px]">
        <div class="font-semibold text-gray-800">${hw.title}</div>
        <div class="text-sm text-gray-500">شعبة ${hw.section} • ${hw.isArchived ? 'مؤرشف' : 'حالي'}</div>
      </div>
      <div class="flex items-center gap-4">
        <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">👁 ${hw.viewsCount || 0}</span>
        <button data-id="${hw.id}" class="stats-del px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">حذف</button>
      </div>
    `;
    listEl.appendChild(row);
  }

  listEl.querySelectorAll('.stats-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await deleteHomework(id);
      await renderStats();
    });
  });
}

// Initialize app with error handling
async function initializeApp() {
  // تأخير قصير للتأكد من تحميل جميع العناصر
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // ربط الأحداث مرة واحدة فقط
    bindEvents();
    
    await renderApp();
    
    // Start auto-archive timer
    setInterval(checkAndAutoArchive, 60 * 1000);
    await checkAndAutoArchive();
  } catch (error) {
    console.error('❌ خطأ في تهيئة التطبيق:', error);
    toastError('حدث خطأ في تحميل التطبيق');
    
    // Fallback: show authSection manually if there's an error
    if (authSection) {
      authSection.classList.remove('hidden');
    }
    if (studentLoginSection) {
      studentLoginSection.classList.add('hidden');
    }
    if (dashboardSection) {
      dashboardSection.classList.add('hidden');
    }
  }
}

// Bootstrap the application after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}
