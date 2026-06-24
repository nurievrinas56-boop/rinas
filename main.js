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

function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }

function getRequests() { return JSON.parse(localStorage.getItem('requests') || '[]'); }

function saveRequests(r) { localStorage.setItem('requests', JSON.stringify(r)); }

function getReviews() { return JSON.parse(localStorage.getItem('reviews') || '[]'); }

function saveReviews(r) { localStorage.setItem('reviews', JSON.stringify(r)); }

function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 4); }

// ===== TOAST =====
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

// ===== NAVIGATION =====
function goTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (btn) btn.classList.add('active');

    if (pageId === 'requests') renderRequests();
    if (pageId === 'new-request') checkNewRequest();
    if (pageId === 'admin') checkAdmin();
}

// ===== USER =====
function getCurrentUser() { return sessionStorage.getItem('currentUser'); }

function isLoggedIn() { return !!getCurrentUser(); }

function updateUserUI() {
    const user = getCurrentUser();
    const nameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        const users = getUsers();
        const found = users.find(u => u.login === user);
        nameSpan.textContent = found ? found.fio || user : user;
        logoutBtn.style.display = 'inline-block';
    } else {
        nameSpan.textContent = 'Гость';
        logoutBtn.style.display = 'none';
    }
    updateNav();
}

function updateNav() {
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');

    if (isLoggedIn()) {
        guestNav.style.display = 'none';
        userNav.style.display = 'flex';
        document.querySelectorAll('#userNav .nav-link').forEach(b => b.classList.remove('active'));
        document.querySelector('#userNav .nav-link[data-page="requests"]')?.classList.add('active');
    } else {
        guestNav.style.display = 'flex';
        userNav.style.display = 'none';
        document.querySelectorAll('#guestNav .nav-link').forEach(b => b.classList.remove('active'));
        document.querySelector('#guestNav .nav-link[data-page="login"]')?.classList.add('active');
    }
}

document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAdmin');
    updateUserUI();
    toast('Вы вышли', 'info');
    goTo('login');
});

// ===== LOGO CLICK =====
document.getElementById('logoLink').addEventListener('click', function(e) {
    e.preventDefault();
    if (isLoggedIn()) {
        goTo('requests');
    } else {
        goTo('login');
    }
});

// ===== REGISTER =====
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('regLogin').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    const fio = document.getElementById('regFio').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const loginErr = document.getElementById('regLoginError');
    const passErr = document.getElementById('regPassError');
    loginErr.classList.remove('show');
    passErr.classList.remove('show');

    if (!/^[a-zA-Z0-9]{6,}$/.test(login)) {
        loginErr.textContent = 'Логин: ≥6 символов, только латиница и цифры';
        loginErr.classList.add('show');
        return;
    }
    const users = getUsers();
    if (users.some(u => u.login === login)) {
        loginErr.textContent = 'Такой логин уже занят';
        loginErr.classList.add('show');
        return;
    }
    if (pass.length < 8) {
        passErr.textContent = 'Пароль должен быть ≥8 символов';
        passErr.classList.add('show');
        return;
    }
    users.push({ login, password: pass, fio, phone, email });
    saveUsers(users);
    toast('Регистрация успешна!', 'success');
    this.reset();
    goTo('login');
});

// ===== LOGIN =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const err = document.getElementById('loginError');
    err.classList.remove('show');

    const users = getUsers();
    const found = users.find(u => u.login === login && u.password === pass);
    if (found) {
        sessionStorage.setItem('currentUser', login);
        updateUserUI();
        toast(`Добро пожаловать, ${found.fio || login}!`, 'success');
        this.reset();
        goTo('requests');
    } else {
        err.textContent = 'Неверный логин или пароль';
        err.classList.add('show');
    }
});

// ===== NEW REQUEST =====
function checkNewRequest() {
    const block = document.getElementById('newRequestFormBlock');
    const guest = document.getElementById('newRequestGuest');
    if (isLoggedIn()) {
        block.style.display = 'block';
        guest.style.display = 'none';
    } else {
        block.style.display = 'none';
        guest.style.display = 'block';
    }
}

document.getElementById('newRequestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!isLoggedIn()) { toast('Войдите в систему', 'error'); return; }
    const course = document.getElementById('requestCourse').value;
    const date = document.getElementById('requestDate').value.trim();
    const payment = document.getElementById('requestPayment').value;
    if (!course || !payment) { toast('Заполните все поля', 'error'); return; }
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) { toast('Дата в формате ДД.ММ.ГГГГ', 'error'); return; }
    const parts = date.split('.');
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    if (d.getDate() != parseInt(parts[0]) || d.getMonth() != parseInt(parts[1]) - 1) {
        toast('Некорректная дата', 'error');
        return;
    }
    const reqs = getRequests();
    reqs.push({
        id: genId(),
        user: getCurrentUser(),
        course,
        date,
        payment,
        status: 'Новая',
        createdAt: new Date().toISOString()
    });
    saveRequests(reqs);
    toast('Заявка отправлена!', 'success');
    this.reset();
    goTo('requests');
});

// ===== REQUESTS =====
function renderRequests() {
    const container = document.getElementById('requestsList');
    const reviewBlock = document.getElementById('reviewBlock');

    if (!isLoggedIn()) {
        container.innerHTML =
            `<div class="empty"><i class="fas fa-lock"></i><p>Войдите, чтобы увидеть заявки</p></div>`;
        reviewBlock.style.display = 'none';
        return;
    }

    const all = getRequests();
    const userReqs = all.filter(r => r.user === getCurrentUser());

    if (userReqs.length === 0) {
        container.innerHTML =
            `<div class="empty"><i class="fas fa-inbox"></i><p>У вас пока нет заявок</p></div>`;
        reviewBlock.style.display = 'none';
        return;
    }

    userReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let html = '';
    let hasCompleted = false;

    userReqs.forEach(r => {
        const cls = r.status === 'Новая' ? 'status-new' :
            r.status === 'Идет обучение' ? 'status-learning' : 'status-done';
        if (r.status === 'Обучение завершено') hasCompleted = true;

        html += `
            <div class="request-card">
                <div class="top">
                    <strong>${r.course}</strong>
                    <span class="status ${cls}">${r.status}</span>
                </div>
                <div class="request-meta">
                    <span><i class="fas fa-calendar-day"></i> ${r.date}</span>
                    <span><i class="fas fa-credit-card"></i> ${r.payment}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    if (hasCompleted) {
        reviewBlock.style.display = 'block';
        const reviews = getReviews();
        const already = reviews.some(r => r.user === getCurrentUser());
        const textarea = document.getElementById('reviewText');
        const submitBtn = document.getElementById('submitReview');
        const msg = document.getElementById('reviewMsg');

        if (already) {
            textarea.disabled = true;
            submitBtn.disabled = true;
            msg.textContent = '✅ Вы уже оставили отзыв. Спасибо!';
        } else {
            textarea.disabled = false;
            submitBtn.disabled = false;
            msg.textContent = '';
        }
    } else {
        reviewBlock.style.display = 'none';
    }
}

// ===== REVIEW =====
document.getElementById('submitReview').addEventListener('click', function() {
    if (!isLoggedIn()) {
        toast('Войдите в систему', 'error');
        return;
    }
    const text = document.getElementById('reviewText').value.trim();
    if (!text) {
        toast('Напишите текст отзыва', 'error');
        return;
    }
    const reviews = getReviews();
    if (reviews.some(r => r.user === getCurrentUser())) {
        toast('Вы уже оставили отзыв', 'error');
        return;
    }
    reviews.push({ id: genId(), user: getCurrentUser(), text, createdAt: new Date().toISOString() });
    saveReviews(reviews);
    toast('Спасибо за отзыв!', 'success');
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewText').disabled = true;
    this.disabled = true;
    document.getElementById('reviewMsg').textContent = '✅ Отзыв сохранён!';
});

// ===== SLIDER =====
let slideIndex = 0;
let slideTimer = null;

function initSlider() {
    const track = document.getElementById('sliderTrack');
    const dots = document.getElementById('sliderDots');
    if (!track) return;

    const slides = track.querySelectorAll('.slide');
    if (slides.length === 0) return;

    dots.innerHTML = '';
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('span');
        dot.dataset.index = i;
        dot.addEventListener('click', () => goSlide(i));
        dots.appendChild(dot);
    }

    goSlide(0);
    startSlider();
}

function goSlide(index) {
    const track = document.getElementById('sliderTrack');
    const slides = track.querySelectorAll('.slide');
    if (slides.length === 0) return;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    slideIndex = index;

    track.style.transform = `translateX(-${slideIndex * 100}%)`;

    document.querySelectorAll('.slider-dots span').forEach((dot, i) => {
        dot.classList.toggle('active', i === slideIndex);
    });
}

function nextSlide() { goSlide(slideIndex + 1); }

function prevSlide() { goSlide(slideIndex - 1); }

function startSlider() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, 3000);
}

document.getElementById('sliderPrev').addEventListener('click', () => { prevSlide();
    startSlider(); });
document.getElementById('sliderNext').addEventListener('click', () => { nextSlide();
    startSlider(); });

// ===== ADMIN =====
function checkAdmin() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    document.getElementById('adminLoginBox').style.display = isAdmin ? 'none' : 'block';
    document.getElementById('adminPanel').style.display = isAdmin ? 'block' : 'none';
    if (isAdmin) renderAdmin();
}

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value.trim();

    if (login === 'Admin26' && pass === 'Demo20') {
        sessionStorage.setItem('isAdmin', 'true');
        toast('Вход в админ-панель', 'success');
        checkAdmin();
    } else {
        toast('Неверный логин или пароль', 'error');
    }
});

document.getElementById('adminLogoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('isAdmin');
    checkAdmin();
    toast('Вы вышли из админки', 'info');
});

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
            const cls = r.status === 'Новая' ? 'status-new' :
                r.status === 'Идет обучение' ? 'status-learning' : 'status-done';

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

window.changeStatus = function(id, newStatus) {
    const reqs = getRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx === -1) return;
    reqs[idx].status = newStatus;
    saveRequests(reqs);
    toast(`Статус изменён на «${newStatus}»`, 'success');
    renderAdmin();
    renderRequests();
};

window.adminGoPage = function(page) {
    adminPage = page;
    renderAdmin();
};

document.getElementById('adminFilter').addEventListener('change', () => { adminPage = 1;
    renderAdmin(); });
document.getElementById('adminSort').addEventListener('change', () => { adminPage = 1;
    renderAdmin(); });

// ===== NAV EVENTS =====
document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = this.dataset.page;
        if ((page === 'requests' || page === 'new-request') && !isLoggedIn()) {
            toast('Сначала войдите в систему', 'error');
            goTo('login');
            return;
        }
        goTo(page);
    });
});

document.querySelectorAll('.link').forEach(btn => {
    btn.addEventListener('click', function() {
        goTo(this.dataset.page);
    });
});

// ===== START =====
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
    initSlider();

    if (isLoggedIn()) {
        goTo('requests');
    } else {
        goTo('login');
    }
});