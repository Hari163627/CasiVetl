// ==================== ИНИЦИАЛИЗАЦИЯ ====================
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0c05');
    tg.setBackgroundColor('#0f0c05');
}

// ==================== ПОЛУЧЕНИЕ USER DATA ====================
let currentUser = null;

function getUserData() {
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        return null;
    }
    return tg.initDataUnsafe.user;
}

// ==================== ЗАГРУЗКА ДАННЫХ ====================
// Данные из бота приходят через sendData (когда бот отправляет)
// Пока используем заглушку — заполним после настройки бота
const API = {
    getUser: () => {
        const user = getUserData();
        return {
            id: user?.id || 0,
            username: user?.username || 'guest',
            first_name: user?.first_name || 'Гость',
            balance: 0,
            rank: 'Новичок',
            streak: 0,
            turnover: 0
        };
    },
    getTop: (type) => {
        // Пока заглушка — потом заменим на реальный запрос к боту
        return [];
    },
    getHistory: () => {
        return [];
    },
    getQuests: () => {
        return { daily: [], weekly: [] };
    }
};

// ==================== ФОРМАТИРОВАНИЕ ====================
function fmt(n) {
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ==================== UI ====================
function updateHeader() {
    const user = API.getUser();
    const el = document.getElementById('user-info');
    if (el) {
        el.textContent = `@${user.username}`;
    }
}

function updateHome() {
    const user = API.getUser();
    document.getElementById('balance').textContent = fmt(user.balance) + ' $';
    document.getElementById('rank').textContent = user.rank;
    document.getElementById('streak').textContent = user.streak + ' дн.';
    document.getElementById('turnover').textContent = fmt(user.turnover) + ' $';
}

// ==================== ТОПЫ ====================
function loadTop(type) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const list = document.getElementById('top-list');
    list.innerHTML = '<div class="loading">Загрузка...</div>';

    // Пока заглушка
    setTimeout(() => {
        const data = API.getTop(type);
        if (!data || data.length === 0) {
            list.innerHTML = '<div class="empty">Пока нет данных</div>';
            return;
        }

        let html = '';
        data.forEach((item, i) => {
            const rank = i + 1;
            let rankClass = 'top-rank';
            let rankText = rank;
            if (rank === 1) { rankClass += ' gold'; rankText = '🥇'; }
            else if (rank === 2) { rankClass += ' silver'; rankText = '🥈'; }
            else if (rank === 3) { rankClass += ' bronze'; rankText = '🥉'; }

            html += `
                <div class="top-item">
                    <div class="${rankClass}">${rankText}</div>
                    <div class="top-name">@${item.username}</div>
                    <div class="top-value">${item.value}</div>
                </div>
            `;
        });

        html += `<div class="my-place">📍 Ваше место: #${data.length + 1}</div>`;
        list.innerHTML = html;
    }, 300);
}

// ==================== ИСТОРИЯ ====================
function loadHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '<div class="loading">Загрузка...</div>';

    setTimeout(() => {
        const data = API.getHistory();
        if (!data || data.length === 0) {
            list.innerHTML = '<div class="empty">Пока нет ставок</div>';
            return;
        }

        let html = '';
        data.forEach(item => {
            const cls = item.win > 0 ? 'history-win' : 'history-loss';
            const amount = item.win > 0 ? `+${fmt(item.win)} $` : `-${fmt(item.bet)} $`;
            const emoji = item.win > 0 ? '✅' : '❌';
            html += `
                <div class="history-item">
                    <div>
                        <div class="history-game">${item.game}</div>
                        <div class="history-result">${fmt(item.bet)} $ ${emoji}</div>
                    </div>
                    <div class="history-amount ${cls}">${amount}</div>
                </div>
            `;
        });
        list.innerHTML = html;
    }, 300);
}

// ==================== КВЕСТЫ ====================
function loadQuests() {
    const daily = document.getElementById('quests-daily');
    const weekly = document.getElementById('quests-weekly');
    daily.innerHTML = '<div class="loading">Загрузка...</div>';
    weekly.innerHTML = '<div class="loading">Загрузка...</div>';

    setTimeout(() => {
        const data = API.getQuests();

        if (!data.daily || data.daily.length === 0) {
            daily.innerHTML = '<div class="empty">Нет активных квестов</div>';
        } else {
            daily.innerHTML = data.daily.map(q => renderQuest(q)).join('');
        }

        if (!data.weekly || data.weekly.length === 0) {
            weekly.innerHTML = '<div class="empty">Нет активных квестов</div>';
        } else {
            weekly.innerHTML = data.weekly.map(q => renderQuest(q)).join('');
        }
    }, 300);
}

function renderQuest(q) {
    const percent = Math.min(100, (q.progress / q.target) * 100);
    const isDone = q.progress >= q.target;
    const statusText = isDone ? '🎁 Забрать' : `${q.progress}/${q.target}`;
    const statusClass = isDone ? 'quest-claim' : '';

    return `
        <div class="quest-item">
            <div class="quest-title">${q.title}</div>
            <div class="quest-progress">
                <div class="quest-progress-bar" style="width: ${percent}%"></div>
            </div>
            <div class="quest-status">
                <span>💰 ${fmt(q.reward)} $</span>
                <span class="${statusClass}">${statusText}</span>
            </div>
        </div>
    `;
}

// ==================== НАВИГАЦИЯ ====================
function switchScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(`screen-${name}`)?.classList.add('active');
    document.querySelector(`[data-screen="${name}"]`)?.classList.add('active');

    if (name === 'tops') loadTop('balance');
    if (name === 'history') loadHistory();
    if (name === 'quests') loadQuests();
}

// ==================== ССЫЛКИ НА БОТЫ ====================
function openCasino() {
    if (tg) {
        tg.openTelegramLink('https://t.me/CasinoVetlBot');
    } else {
        window.open('https://t.me/CasinoVetlBot', '_blank');
    }
}

function openBank() {
    if (tg) {
        tg.openTelegramLink('https://t.me/BankVetlBot');
    } else {
        window.open('https://t.me/BankVetlBot', '_blank');
    }
}

// ==================== СТАРТ ====================
document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    updateHome();
});

// Хак: добавим событие к табам для правильного event.target
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        const tabs = e.target.parentElement.querySelectorAll('.tab');
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
    }
});
