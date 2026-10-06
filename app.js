// ==================== ИНИЦИАЛИЗАЦИЯ ====================
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0c05');
    tg.setBackgroundColor('#0f0c05');
}

// ==================== СПИСКИ ====================
const ADMIN_IDS = [8616584126, 8195062682];

// ==================== ПОЛУЧЕНИЕ USER ====================
function getUser() {
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        return { id: 0, username: 'guest', first_name: 'Гость' };
    }
    return tg.initDataUnsafe.user;
}

function isAdmin() {
    const user = getUser();
    return ADMIN_IDS.includes(user.id);
}

// ==================== ДАННЫЕ ИЗ БОТА ====================
// Данные, которые бот передаёт при открытии Mini App
function getBotData() {
    if (!tg || !tg.initDataUnsafe) return null;
    return tg.initDataUnsafe.start_param ? null : null;
}

// Локальные данные (в реальности надо получать от бота)
// Пока показываем заглушки
const USER_DATA = {
    balance: 0,
    rank: 'Новичок',
    streak: 0,
    turnover: 0
};

// ==================== ФОРМАТИРОВАНИЕ ====================
function fmt(n) {
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ==================== ОБНОВЛЕНИЕ UI ====================
function updateHeader() {
    const user = getUser();
    const el = document.getElementById('user-info');
    if (el) el.textContent = `@${user.username || user.first_name}`;
}

function updateHome() {
    const el1 = document.getElementById('balance');
    const el2 = document.getElementById('rank');
    const el3 = document.getElementById('streak');
    const el4 = document.getElementById('turnover');

    if (el1) el1.textContent = fmt(USER_DATA.balance) + ' $';
    if (el2) el2.textContent = USER_DATA.rank;
    if (el3) el3.textContent = USER_DATA.streak + ' дн.';
    if (el4) el4.textContent = fmt(USER_DATA.turnover) + ' $';
}

// ==================== SEND DATA ====================
function sendAction(action, data = {}) {
    if (!tg) {
        alert('Открой в Telegram');
        return;
    }
    const payload = { action: action, ...data };
    tg.sendData(JSON.stringify(payload));
}

// ==================== ДЕЙСТВИЯ ЮЗЕРА ====================
function claimStreak() {
    sendAction('claim_streak');
}

function claimQuest(key) {
    sendAction('claim_quest', { key: key });
}

function activatePromo() {
    const input = document.getElementById('promo-input');
    if (!input || !input.value) {
        alert('Введите промокод');
        return;
    }
    sendAction('activate_promo', { code: input.value.trim() });
}

function openCase(name) {
    sendAction('open_case', { name: name });
}

function spinWheel() {
    sendAction('spin_wheel');
}

function createDeposit(amount) {
    if (!amount || amount < 10000) {
        alert('Минимум 10,000 $');
        return;
    }
    sendAction('create_deposit', { amount: amount });
}

function withdrawDeposit(id) {
    sendAction('withdraw_deposit', { id: id });
}

// ==================== ДЕЙСТВИЯ АДМИНА ====================
function adminBroadcast() { sendAction('admin_broadcast'); }
function adminGive() { sendAction('admin_give'); }
function adminTake() { sendAction('admin_take'); }
function adminBan() { sendAction('admin_ban'); }
function adminReset() { sendAction('admin_reset'); }
function adminRank() { sendAction('admin_rank'); }
function adminRankTake() { sendAction('admin_rank_take'); }
function adminVip() { sendAction('admin_vip'); }
function adminMsg() { sendAction('admin_msg'); }
function adminMaintenance() { sendAction('admin_maintenance'); }
function adminPromoNew() { sendAction('admin_promo_new'); }
function adminPromoDel() { sendAction('admin_promo_del'); }

// ==================== НАВИГАЦИЯ ====================
function switchScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const screen = document.getElementById(`screen-${name}`);
    const btn = document.querySelector(`[data-screen="${name}"]`);

    if (screen) screen.classList.add('active');
    if (btn) btn.classList.add('active');
}

// ==================== ССЫЛКИ ====================
function openCasino() {
    if (tg) tg.openTelegramLink('https://t.me/CasinoVetlBot');
    else window.open('https://t.me/CasinoVetlBot', '_blank');
}

function openBank() {
    if (tg) tg.openTelegramLink('https://t.me/BankVetlBot');
    else window.open('https://t.me/BankVetlBot', '_blank');
}

function openSupport() {
    if (tg) tg.openTelegramLink('https://t.me/SuppCasinoVetlBot');
    else window.open('https://t.me/SuppCasinoVetlBot', '_blank');
}

// ==================== ЗАГРУЗКА ====================
document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    updateHome();

    // Показываем админ-вкладку только админам
    if (isAdmin()) {
        const adminNav = document.getElementById('nav-admin');
        if (adminNav) adminNav.style.display = 'flex';
    }
});

// Табы в топах
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        const tabs = e.target.parentElement.querySelectorAll('.tab');
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
    }
});
