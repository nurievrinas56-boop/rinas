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
    if (!c) return;
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

// ===== ОБНОВЛЕНИЕ ВСЕГО ИНТЕРФЕЙСА =====
function updateUI() {
    const role = getCurrentRole();
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const navLogin = document.getElementById('navLogin');
    const navRegister = document.getElementById('navRegister');
    const navRequests = document.getElementById('navRequests');
    const navNewRequest = document.getElementById('navNewRequest');

    // Имя и кнопка выхода
    if (role === 'admin') {
        if (userName) userName.textContent = 'Администратор';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else if (role === 'user') {
        const user = getCurrentUser();
        const users = getUsers();
        const found = users.find(u => u.login === user);
        if (userName) userName.textContent = found ? found.fio || user : user;
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (userName) userName.textContent = 'Гость';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    // Навигация
    if (role === 'user' || role === 'admin') {
        if (navLogin) navLogin.style.display = 'none';
        if (navRegister) navRegister.style.display = 'none';
        if (navRequests) navRequests.style.display = 'flex';
        if (navNewRequest) navNewRequest.style.display = 'flex';
    } else {
        if (navLogin) navLogin.style.display = 'flex';
        if (navRegister) navRegister.style.display = 'flex';
        if (navRequests) navRequests.style.display = 'none';
        if (navNewRequest) navNewRequest.style.display = 'none';
    }
}

// ===== ВЫХОД =====
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        sessionStorage.clear();
        updateUI();
        toast('Вы вышли', 'info');
        window.location.href = 'index.html';
    });
}

// ===== РЕГИСТРАЦИЯ =====
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const login = document.getElementById('regLogin').value.trim();
        const pass = document.getElementById('regPass').value.trim();
        const fio = document.getElementById('regFio').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const loginErr = document.getElementById('regLoginError');
        const passErr = document.getElementById('regPassError');
        if (loginErr) loginErr.classList.remove('show');
        if (passErr) passErr.classList.remove('show');

        if (!/^[a-zA-Z0-9]{6,}$/.test(login)) {
            if (loginErr) {
                loginErr.textContent = 'Логин: ≥6 символов, только латиница и цифры';
                loginErr.classList.add('show');
            }
            return;
        }
        const users = getUsers();
        if (users.some(u => u.login === login)) {
            if (loginErr) {
                loginErr.textContent = 'Такой логин уже занят';
                loginErr.classList.add('show');
            }
            return;
        }
        if (pass.length < 8) {
            if (passErr) {
                passErr.textContent = 'Пароль должен быть ≥8 символов';
                passErr.classList.add('show');
            }
            return;
        }
        users.push({ login, password: pass, fio, phone, email });
        saveUsers(users);
        toast('Регистрация успешна!', 'success');
        this.reset();
        window.location.href = 'index.html';
    });
}

// ===== ВХОД =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const login = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();
        const err = document.getElementById('loginError');
        if (err) err.classList.remove('show');

        const users = getUsers();
        const found = users.find(u => u.login === login && u.password === pass);
        if (found) {
            sessionStorage.clear();
            sessionStorage.setItem('currentUser', login);
            toast(`Добро пожаловать, ${found.fio || login}!`, 'success');
            this.reset();
            window.location.href = 'cabinet.html';
        } else {
            if (err) {
                err.textContent = 'Неверный логин или пароль';
                err.classList.add('show');
            }
        }
    });
}

// ===== НОВАЯ ЗАЯВКА =====
function checkNewRequest() {
    const block = document.getElementById('newRequestFormBlock');
    const guest = document.getElementById('newRequestGuest');
    const role = getCurrentRole();
    if (block && guest) {
        if (role === 'user') {
            block.style.display = 'block';
            guest.style.display = 'none';
        } else {
            block.style.display = 'none';
            guest.style.display = 'block';
        }
    }
}

const newRequestForm = document.getElementById('newRequestForm');
if (newRequestForm) {
    newRequestForm.addEventListener('submit', function (e) {
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
}

// ===== ОТОБРАЖЕНИЕ ЗАЯВОК =====
function renderRequests() {
    const container = document.getElementById('requestsList');
    const reviewBlock = document.getElementById('reviewBlock');
    if (!container) return;

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

    // ===== ОТЗЫВЫ =====
    const allReviews = getReviews();
    const userReviews = allReviews.filter(r => r.user === getCurrentUser());

    if (userReviews.length > 0) {
        let reviewHtml = `<div style="margin-top:16px;"><h3>Мои отзывы</h3>`;
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

    // ===== БЛОК НОВОГО ОТЗЫВА =====
    if (reviewBlock) {
        if (hasCompleted) {
            reviewBlock.style.display = 'block';
            const already = userReviews.some(r => r.user === getCurrentUser());
            const textarea = document.getElementById('reviewText');
            const submitBtn = document.getElementById('submitReview');
            const msg = document.getElementById('reviewMsg');

            if (already) {
                if (textarea) textarea.disabled = true;
                if (submitBtn) submitBtn.disabled = true;
                if (msg) msg.textContent = 'Вы уже оставили отзыв. Спасибо!';
            } else {
                if (textarea) textarea.disabled = false;
                if (submitBtn) submitBtn.disabled = false;
                if (msg) msg.textContent = '';
            }
        } else {
            reviewBlock.style.display = 'none';
        }
    }
}

// ===== ОТПРАВКА ОТЗЫВА =====
const submitReviewBtn = document.getElementById('submitReview');
if (submitReviewBtn) {
    submitReviewBtn.addEventListener('click', function () {
        if (getCurrentRole() !== 'user') {
            toast('Войдите как пользователь', 'error');
            return;
        }

        const textarea = document.getElementById('reviewText');
        if (!textarea) return;
        const text = textarea.value.trim();
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
        textarea.value = '';
        textarea.disabled = true;
        this.disabled = true;
        const msg = document.getElementById('reviewMsg');
        if (msg) msg.textContent = 'Отзыв сохранён!';

        setTimeout(() => renderRequests(), 300);
    });
}

// ===== СЛАЙДЕР =====
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

const sliderPrev = document.getElementById('sliderPrev');
const sliderNext = document.getElementById('sliderNext');
if (sliderPrev) sliderPrev.addEventListener('click', () => {
    prevSlide();
    startSlider();
});
if (sliderNext) sliderNext.addEventListener('click', () => {
    nextSlide();
    startSlider();
});

// ===== СТАРТ =====
document.addEventListener('DOMContentLoaded', function () {
    updateUI();
    initSlider();

    if (window.location.pathname.includes('cabinet.html')) {
        renderRequests();
    }

    if (window.location.pathname.includes('new-request.html')) {
        checkNewRequest();
    }
});