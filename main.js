import { STUDENT_CODES } from './data/studentCodes.js';

// ⚠️ JSONBin.io Configuration - أدخل بياناتك هنا
const JSONBIN_CONFIG = {
  API_KEY: '$2a$10$fuuDWFJZi.HrgUohTmYJced2J.i2oUiPYpNMzGax/x/MK3CM31EZu', // 🔑 ضع الـ Master Key هنا
  HOMEWORK_BIN: '68d66c19d0ea881f408bb3b3', // 📚 ضع bin ID للواجبات هنا
  ANNOUNCEMENTS_BIN: '68d66c3143b1c97be950c256', // 📢 ضع bin ID للتبليغات هنا
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
  try {
    const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${binId}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_CONFIG.API_KEY
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('Error fetching from JSONBin:', error);
    return null;
  }
}

async function saveToBin(binId, data) {
  try {
    const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_CONFIG.API_KEY
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return true;
  } catch (error) {
    console.error('Error saving to JSONBin:', error);
    return false;
  }
}

// Local storage fallback functions
const getJSON = (k, d) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
}
const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Initialize persisted datasets
function initDatasets() {
  if (!getJSON(LS_KEYS.CODES, null)) {
    // Clone to avoid mutating import
    const copy = JSON.parse(JSON.stringify(STUDENT_CODES));
    setJSON(LS_KEYS.CODES, copy);
  }
  // Subjects removed from creation flow; keep key for backward compatibility but don't (re)initialize
  if (!getJSON(LS_KEYS.HOMEWORK, null)) {
    setJSON(LS_KEYS.HOMEWORK, []);
  }
  if (!getJSON(LS_KEYS.ANNOUNCEMENTS, null)) {
    setJSON(LS_KEYS.ANNOUNCEMENTS, []);
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

// JSONBin functions for homework and announcements
async function getHomework() {
  const binData = await fetchFromBin(JSONBIN_CONFIG.HOMEWORK_BIN);
  if (binData && binData.homework) {
    return binData.homework;
  }
  // Fallback to localStorage if JSONBin fails
  return getJSON(LS_KEYS.HOMEWORK, []);
}

async function setHomework(list) {
  const success = await saveToBin(JSONBIN_CONFIG.HOMEWORK_BIN, { homework: list });
  if (success) {
    console.log('✅ Homework saved to JSONBin successfully');
  } else {
    console.log('❌ Failed to save to JSONBin, using localStorage fallback');
    setJSON(LS_KEYS.HOMEWORK, list);
  }
}

async function getAnnouncements() {
  const binData = await fetchFromBin(JSONBIN_CONFIG.ANNOUNCEMENTS_BIN);
  if (binData && binData.announcements) {
    return binData.announcements;
  }
  // Fallback to localStorage if JSONBin fails
  return getJSON(LS_KEYS.ANNOUNCEMENTS, []);
}

async function setAnnouncements(list) {
  const success = await saveToBin(JSONBIN_CONFIG.ANNOUNCEMENTS_BIN, { announcements: list });
  if (success) {
    console.log('✅ Announcements saved to JSONBin successfully');
  } else {
    console.log('❌ Failed to save to JSONBin, using localStorage fallback');
    setJSON(LS_KEYS.ANNOUNCEMENTS, list);
  }
}

// DOM refs
const authSection = document.getElementById('authSection');
const studentLoginSection = document.getElementById('studentLoginSection');
const dashboardSection = document.getElementById('dashboardSection');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

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

// Bind modal close globally so it's always closable
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
const createHomeworkForm = document.getElementById('createHomeworkForm');

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function setActiveTab(id) {
  tabBtns.forEach(btn => {
    const active = btn.dataset.tab === id;
    btn.classList.toggle('active', active);
  });
  Object.entries(tabPanels).forEach(([key, panel]) => {
    if (key === id) show(panel); else hide(panel);
  });
}

// Subjects removed from creation flow

function formatViews(hw) {
  const n = hw.viewsCount || 0;
  return `${n} مشاهدة`;
}

function openHomeworkDetails(hw) {
  if (!modalOverlay) return;
  modalTitle.textContent = hw.title || '';
  modalBody.textContent = hw.description || '';
  if (modalMeta) {
    const metaParts = [];
    if (hw.section) metaParts.push(`🏢 شعبة ${hw.section}`);
    if (hw.dueDay) metaParts.push(`📅 ليوم ${hw.dueDay}`);
    if (hw.viewsCount || hw.viewsCount === 0) metaParts.push(`👁 ${formatViews(hw)}`);
    if (hw.creatorName) metaParts.push(`👤 بواسطة: ${hw.creatorName}`);
    if (hw.isArchived) metaParts.push(`📋 مؤرشف`);
    if (hw.createdAt) {
      const createdDate = new Date(hw.createdAt);
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
  hw.viewers = hw.viewers || [];
  if (!viewerCode) return false;
  if (!hw.viewers.includes(viewerCode)) {
    hw.viewers.push(viewerCode);
    hw.viewsCount = (hw.viewsCount || 0) + 1;
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
    // Refresh UI if visible
    await renderHomework();
    await renderArchived();
  }
}

async function renderHomework() {
  const session = getSession();
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
    card.className = 'bg-white border-2 border-gray-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-blue-300';
    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-800 mb-2">${hw.title}</h3>
          <div class="space-y-1 mb-3">
            ${hw.dueDay ? `<p class="text-sm text-orange-600">📅 ليوم ${hw.dueDay}</p>` : ''}
            <p class="text-sm text-gray-500">👁 ${formatViews(hw)}</p>
            ${hw.creatorName ? `<p class="text-xs text-gray-400">بواسطة: ${hw.creatorName}</p>` : ''}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button data-id="${hw.id}" class="zoom-btn px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all hover:bg-blue-700">تكبير</button>
          ${canArchive ? `<button data-id="${hw.id}" class="archive-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium transition-all hover:bg-red-600 hover:text-white">أرشفة</button>` : ''}
          ${canDelete ? `<button data-id="${hw.id}" class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg font-medium transition-all hover:bg-red-700">حذف</button>` : ''}
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
  const all = await getHomework();
  const idx = all.findIndex(h => String(h.id) === String(id));
  if (idx === -1) return;
  
  const hw = all[idx];
  if (!confirm(`هل أنت متأكد من أرشفة الواجب: "${hw.title}"\n\nسينتقل إلى قسم الواجبات القديمة`)) return;
  
  all[idx].isArchived = true;
  await setHomework(all);
  toastSuccess('تم نقل الواجب إلى الواجبات القديمة');
  await renderHomework();
  await renderArchived();
}

async function deleteHomework(id) {
  const all = await getHomework();
  const hw = all.find(h => String(h.id) === String(id));
  if (!hw) return;
  
  if (!confirm(`هل أنت متأكد من حذف الواجب: "${hw.title}"\n\nهذا الإجراء لا يمكن التراجع عنه!`)) return;
  
  const filtered = all.filter(h => String(h.id) !== String(id));
  await setHomework(filtered);
  toastSuccess('تم حذف الواجب');
  await renderHomework();
  await renderArchived();
}

async function createHomework(e) {
  e.preventDefault();
  const session = getSession();
  const title = hwTitle.value.trim();
  const description = hwDescription.value.trim();
  const dueDay = hwDueDay ? hwDueDay.value : '';
  if (!title || !description || !dueDay) return;

  const targetSection = (session.isAdmin && hwSectionAdmin && hwSectionAdmin.value) ? hwSectionAdmin.value : session.section;
  const createdAt = new Date().toISOString();
  const archiveAt = computeArchiveAt(dueDay, createdAt);

  const all = await getHomework();
  all.unshift({
    id: Date.now(),
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
  });
  await setHomework(all);
  toastSuccess('تم إنشاء الواجب بنجاح!');
  hwTitle.value = '';
  hwDescription.value = '';
  if (hwDueDay) hwDueDay.value = '';
  if (hwSectionAdmin) hwSectionAdmin.value = '';
  setActiveTab('homework');
  await renderHomework();
}

function onSignIn() {
  setAuth(true);
  toastSuccess('تم تسجيل الدخول');
  renderApp();
}

function onSignOut() {
  const session = getSession();
  if (session) {
    const codes = getCodes();
    if (codes[session.studentCode]) {
      codes[session.studentCode].isActive = false;
      setCodes(codes);
    }
  }
  clearSession();
  setAuth(false);
  toastSuccess('تم تسجيل الخروج');
  renderApp();
}

function onStudentLogin(e) {
  e.preventDefault();
  const name = studentNameInput.value.trim();
  const code = studentCodeInput.value.trim();
  if (!name || !code) return;

  const codes = getCodes();
  if (!codes[code]) {
    toastError('كود الطالب غير صحيح');
    return;
  }
  if (codes[code].isActive) {
    toastError('هذا الحساب مستخدم حالياً');
    return;
  }

  // Mark code active and update name
  codes[code].isActive = true;
  codes[code].name = name;
  setCodes(codes);

  const isAdmin = code === 'S1001a';
  const session = {
    studentName: isAdmin ? 'باقر أسعد حسين' : name,
    studentCode: code,
    section: codes[code].section,
    canPostHomework: isAdmin ? true : !!codes[code].canPost,
    isAdmin,
  };
  setSession(session);
  toastSuccess('تم تسجيل الدخول بنجاح!');
  renderApp();
}

async function renderApp() {
  initDatasets();
  const isLogged = getAuth();
  const session = getSession();

  // Header button visibility
  if (isLogged && session) { show(signOutBtn); } else { hide(signOutBtn); }


  if (!isLogged) {
    show(authSection); hide(studentLoginSection); hide(dashboardSection);
    return;
  }

  if (!session) {
    hide(authSection); show(studentLoginSection); hide(dashboardSection);
    return;
  }

  // Render dashboard
  hide(authSection); hide(studentLoginSection); show(dashboardSection);

  studentNameDisplay.textContent = session.studentName;
  studentSectionDisplay.textContent = session.section;
  homeworkSectionLabel.textContent = session.section;

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
}

// Event bindings
if (signInBtn) signInBtn.addEventListener('click', onSignIn);
if (signOutBtn) signOutBtn.addEventListener('click', onSignOut);
if (studentLoginForm) studentLoginForm.addEventListener('submit', onStudentLogin);
if (createHomeworkForm) createHomeworkForm.addEventListener('submit', createHomework);
if (createAnnouncementForm) createAnnouncementForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const session = getSession();
  if (!session?.isAdmin) { toastError('صلاحية غير كافية'); return; }
  const title = (annTitle?.value || '').trim();
  const body = (annBody?.value || '').trim();
  if (!title || !body) return;
  const all = await getAnnouncements();
  all.unshift({ id: Date.now(), title, body, createdAt: new Date().toISOString(), creator: session.studentName, isArchived: false });
  await setAnnouncements(all);
  toastSuccess('تم نشر التبليغ الإداري');
  if (annTitle) annTitle.value = '';
  if (annBody) annBody.value = '';
  await renderAnnouncements();
});

tabBtns.forEach(btn => btn.addEventListener('click', async () => {
  const tab = btn.dataset.tab;
  setActiveTab(tab);
  if (tab === 'announcements') await renderAnnouncements();
  if (tab === 'homework') await renderHomework();
  if (tab === 'archived') await renderArchived();
  if (tab === 'stats') await renderStats();
}));

async function renderAnnouncements() {
  if (!announcementsListEl) return;
  const session = getSession();
  const isAdmin = !!session?.isAdmin;
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
    card.className = 'bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg';
    card.innerHTML = `
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <h4 class="text-lg font-bold text-gray-800">${ann.title}</h4>
          ${ann.isArchived ? `<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">مؤرشف</span>` : ''}
        </div>
        ${isAdmin ? `
          <div class="flex items-center gap-2">
            <button data-id="${ann.id}" class="arch-ann px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">${ann.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}</button>
            <button data-id="${ann.id}" class="del-ann px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">حذف</button>
          </div>
        ` : ''}
      </div>
      <p class="text-gray-700 mb-2">${ann.body}</p>
      <div class="text-sm text-gray-500">بواسطة: ${ann.creator} • ${new Date(ann.createdAt).toLocaleString()}</div>
    `;
    announcementsListEl.appendChild(card);
  }
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
  const session = getSession();
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

// Auto-archive timer
setInterval(checkAndAutoArchive, 60 * 1000);
checkAndAutoArchive();

// Bootstrap
renderApp();
