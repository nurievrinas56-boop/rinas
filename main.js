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

// ===== USER =====
function getCurrentUser() { return sessionStorage.getItem('currentUser'); }

function getCurrentRole() {
    if (sessionStorage.getItem('isAdmin') === 'true') return 'admin';
    if (sessionStorage.getItem('currentUser')) return 'user';
    return 'guest';
}

function updateUserUI() {
    const nameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const role = getCurrentRole();

    if (role === 'admin') {
        nameSpan.textContent = '👑 Администратор';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else if (role === 'user') {
        const user = getCurrentUser();
        const users = getUsers();
        const found = users.find(u => u.login === user);
        nameSpan.textContent = found ? found.fio || user : user;
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        nameSpan.textContent = 'Гость';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// ===== LOGOUT =====
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    sessionStorage.clear();
    updateUserUI();
    toast('Вы вышли', 'info');
    window.location.href = 'index.html';
});

// ===== REGISTER =====
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
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
    window.location.href = 'index.html';
});

// ===== LOGIN =====
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const err = document.getElementById('loginError');
    err.classList.remove('show');

    const users = getUsers();
    const found = users.find(u => u.login === login && u.password === pass);
    if (found) {
        sessionStorage.clear();
        sessionStorage.setItem('currentUser', login);
        updateUserUI();
        toast(`Добро пожаловать, ${found.fio || login}!`, 'success');
        this.reset();
        window.location.href = 'cabinet.html';
    } else {
        err.textContent = 'Неверный логин или пароль';
        err.classList.add('show');
    }
});

// ===== NEW REQUEST =====
function checkNewRequest() {
    const block = document.getElementById('newRequestFormBlock');
    const guest = document.getElementById('newRequestGuest');
    const role = getCurrentRole();
    if (role === 'user') {
        block.style.display = 'block';
        guest.style.display = 'none';
    } else {
        block.style.display = 'none';
        guest.style.display = 'block';
    }
}

document.getElementById('newRequestForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    if (getCurrentRole() !== 'user') {
        toast('Войдите как пользователь', 'error');
        return;
    }
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
    window.location.href = 'cabinet.html';
});

// ===== REQUESTS =====
function renderRequests() {
    const container = document.getElementById('requestsList');
    const reviewBlock = document.getElementById('reviewBlock');

    if (getCurrentRole() !== 'user') {
        container.innerHTML = `<div class="empty"><i class="fas fa-lock"></i><p>Войдите как пользователь</p></div>`;
        if (reviewBlock) reviewBlock.style.display = 'none';
        return;
    }

    const all = getRequests();
    const userReqs = all.filter(r => r.user === getCurrentUser());

    if (userReqs.length === 0) {
        container.innerHTML = `<div class="empty"><i class="fas fa-inbox"></i><p>У вас пока нет заявок</p></div>`;
        if (reviewBlock) reviewBlock.style.display = 'none';
        return;
    }

    userReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let html = '';
    let hasCompleted = false;

    userReqs.forEach(r => {
        const cls = r.status === 'Новая' ? 'status-new' : r.status === 'Идет обучение' ? 'status-learning' : 'status-done';
        if (r.status === 'Обучение завершено') hasCompleted = true;
        html += `
            <div class="request-card">
                <div class="top"><strong>${r.course}</strong><span class="status ${cls}">${r.status}</span></div>
                <div class="request-meta">
                    <span><i class="fas fa-calendar-day"></i> ${r.date}</span>
                    <span><i class="fas fa-credit-card"></i> ${r.payment}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Отзывы
    const allReviews = getReviews();
    const userReviews = allReviews.filter(r => r.user === getCurrentUser());

    if (userReviews.length > 0) {
        let reviewHtml = `<div style="margin-top:16px;"><h3>📝 Мои отзывы</h3>`;
        userReviews.forEach(r => {
            reviewHtml += `
                <div style="background:#f8fafc; border-radius:12px; padding:12px 16px; margin-bottom:8px; border-left:3px solid #22c55e;">
                    <div style="font-size:14px; color:#1e293b;">${r.text}</div>
                    <div style="font-size:12px; color:#94a3b8; margin-top:4px;">
                        <i class="fas fa-clock"></i> ${new Date(r.createdAt).toLocaleDateString()}
                    </div>
                </div>
            `;
        });
        reviewHtml += `</div>`;
        container.insertAdjacentHTML('afterend', reviewHtml);
    }

    if (reviewBlock) {
        if (hasCompleted) {
            reviewBlock.style.display = 'block';
            const already = userReviews.some(r => r.user === getCurrentUser());
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
}

document.getElementById('submitReview')?.addEventListener('click', function() {
    if (getCurrentRole() !== 'user') {
        toast('Войдите как пользователь', 'error');
        return;
    }
    const text = document.getElementById('reviewText').value.trim();
    if (!text) { toast('Напишите текст отзыва', 'error'); return; }
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
    setTimeout(() => renderRequests(), 300);
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

document.getElementById('sliderPrev')?.addEventListener('click', () => { prevSlide();
    startSlider(); });
document.getElementById('sliderNext')?.addEventListener('click', () => { nextSlide();
    startSlider(); });

// ===== START =====
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
    initSlider();

    // Если мы на странице заявок — рендерим
    if (window.location.pathname.includes('cabinet.html')) {
        renderRequests();
    }

    // Если на странице новой заявки — проверяем доступ
    if (window.location.pathname.includes('new-request.html')) {
        checkNewRequest();
    }
});