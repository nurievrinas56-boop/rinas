// ===== STORE =====
function getUsers() {
    let data = localStorage.getItem('users');
    if (!data) {
        data = JSON.stringify([
            { login: 'testuser', password: '12345678', fio: 'Тестов Тест', phone: '+7 (999) 111-22-33', email: 'test@test.ru' }
        ]);
        localStorage.setItem('users', data);
    }
    return JSON.parse(data);
}

function getRequests() { return JSON.parse(localStorage.getItem('requests') || '[]'); }

function saveRequests(r) { localStorage.setItem('requests', JSON.stringify(r)); }

function toast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${msg}`;
    c.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        el.style.transition = '0.2s';
        setTimeout(() => el.remove(), 250);
    }, 3500);
}

function getCurrentUser() { return sessionStorage.getItem('currentUser'); }

function getCurrentRole() {
    if (sessionStorage.getItem('isAdmin') === 'true') return 'admin';
    if (sessionStorage.getItem('currentUser')) return 'user';
    return 'guest';
}

// ===== ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ИНТЕРФЕЙСА В АДМИНКЕ =====
function updateAdminUI() {
    const nameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (isAdmin) {
        nameSpan.textContent = 'Администратор';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        nameSpan.textContent = 'Гость';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

document.getElementById('logoutBtn')?.addEventListener('click', function () {
    sessionStorage.clear();
    updateAdminUI();
    toast('Вы вышли', 'info');
    window.location.href = 'index.html';
});

function checkAdmin() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const loginBox = document.getElementById('adminLoginBox');
    const panel = document.getElementById('adminPanel');

    if (loginBox) loginBox.style.display = isAdmin ? 'none' : 'block';
    if (panel) panel.style.display = isAdmin ? 'block' : 'none';

    if (isAdmin) {
        renderAdmin();
        updateAdminUI(); // ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ
    }
}

// ===== ВХОД В АДМИНКУ =====
document.getElementById('adminLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const login = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    const errorEl = document.getElementById('adminErrorMsg');

    if (login === 'Admin26' && pass === 'Demo20') {
        sessionStorage.clear(); // чистим всё
        sessionStorage.setItem('isAdmin', 'true');

        toast('✅ Вход в админ-панель выполнен!', 'success');
        updateAdminUI(); // ПРИНУДИТЕЛЬНО МЕНЯЕМ ИМЯ
        checkAdmin();
    } else {
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Неверный логин или пароль';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 3000);
    }
});

document.getElementById('adminLogoutBtn').addEventListener('click', function () {
    sessionStorage.clear();
    updateAdminUI();
    checkAdmin();
    toast('Вы вышли из админки', 'info');
    window.location.href = 'index.html';
});

// ===== РЕНДЕР АДМИНКИ =====
let adminPage = 1;
const perPage = 3;

function renderAdmin() {
    const container = document.getElementById('adminRequestsList');
    const pagination = document.getElementById('adminPagination');

    let all = getRequests();
    const filter = document.getElementById('adminFilter').value;
    const sort = document.getElementById('adminSort').value;

    if (filter !== 'all') {
        all = all.filter(r => r.status === filter);
    }

    if (sort === 'date-asc') {
        all.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'date-desc') {
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'status') {
        const order = { 'Новая': 0, 'Идет обучение': 1, 'Обучение завершено': 2 };
        all.sort((a, b) => order[a.status] - order[b.status]);
    }

    const total = Math.max(1, Math.ceil(all.length / perPage));
    if (adminPage > total) adminPage = total;

    const start = (adminPage - 1) * perPage;
    const pageItems = all.slice(start, start + perPage);

    if (pageItems.length === 0) {
        container.innerHTML = '<div class="empty"><i class="fas fa-inbox"></i><p>Нет заявок</p></div>';
    } else {
        let html = '';
        const users = getUsers();
        pageItems.forEach(r => {
            const user = users.find(u => u.login === r.user);
            const name = user ? user.fio || r.user : r.user;
            const cls = r.status === 'Новая' ? 'status-new' : r.status === 'Идет обучение' ? 'status-learning' : 'status-done';

            html += `
                <div class="admin-request-item">
                    <div class="top">
                        <strong>${r.course}</strong>
                        <span class="status ${cls}">${r.status}</span>
                    </div>
                    <div class="request-meta">
                        <span><i class="fas fa-user"></i> ${name}</span>
                        <span><i class="fas fa-calendar-day"></i> ${r.date}</span>
                        <span><i class="fas fa-credit-card"></i> ${r.payment}</span>
                    </div>
                    <div class="actions">
                        ${r.status === 'Новая' ? `<button class="btn primary" onclick="changeStatus('${r.id}','Идет обучение')">Начать</button>` : ''}
                        ${r.status === 'Идет обучение' ? `<button class="btn success" onclick="changeStatus('${r.id}','Обучение завершено')">Завершить</button>` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    let pagHtml = '';
    for (let i = 1; i <= total; i++) {
        pagHtml += `<button class="${i === adminPage ? 'active' : ''}" onclick="adminGoPage(${i})">${i}</button>`;
    }
    pagination.innerHTML = pagHtml;
}

window.changeStatus = function (id, newStatus) {
    const reqs = getRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx === -1) return;
    reqs[idx].status = newStatus;
    saveRequests(reqs);
    toast(`Статус изменён на «${newStatus}»`, 'success');
    renderAdmin();
};

window.adminGoPage = function (page) {
    adminPage = page;
    renderAdmin();
};

document.getElementById('adminFilter').addEventListener('change', () => {
    adminPage = 1;
    renderAdmin();
});
document.getElementById('adminSort').addEventListener('change', () => {
    adminPage = 1;
    renderAdmin();
});

// ===== СТАРТ =====
document.addEventListener('DOMContentLoaded', function () {
    updateAdminUI();
    checkAdmin();
});