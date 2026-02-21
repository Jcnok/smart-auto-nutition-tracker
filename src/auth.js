import { loginUser, registerUser, logoutUser, isAuthenticated, getCurrentUser } from './store.js';
import { t } from './translations.js';

// DOM Elements
const els = {
    authView: document.getElementById('auth-view'),
    dashboardView: document.getElementById('dashboard-view'),

    loginCard: document.getElementById('login-card'),
    registerCard: document.getElementById('register-card'),
    showRegisterBtn: document.getElementById('show-register'),
    showLoginBtn: document.getElementById('show-login'),

    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),

    settingsBtn: document.getElementById('settings-btn'),
    logoutBtn: document.getElementById('logout-btn'),

    toastContainer: document.getElementById('toast-container')
};

export function initAuth(onAuthChange) {
    setupAuthListeners(onAuthChange);
    checkAuthState(onAuthChange);
}

function setupAuthListeners(onAuthChange) {
    // View Switching
    els.showRegisterBtn.addEventListener('click', () => {
        els.loginCard.style.display = 'none';
        els.registerCard.style.display = 'block';
    });

    els.showLoginBtn.addEventListener('click', () => {
        els.registerCard.style.display = 'none';
        els.loginCard.style.display = 'block';
    });

    // Forms
    els.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        try {
            loginUser(email, pass);
            els.loginForm.reset();
            checkAuthState(onAuthChange);
            showToast(`${t('appName')}: Welcome back!`, 'success');
        } catch (err) {
            showToast(t('invalidCreds'), 'error');
        }
    });

    els.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-password').value;
        const calories = Number(document.getElementById('reg-calories').value);

        try {
            registerUser(name, email, pass, { calories });
            // Auto login after register
            loginUser(email, pass);
            els.registerForm.reset();
            checkAuthState(onAuthChange);
            showToast(`${t('appName')}: Welcome, ${name}!`, 'success');
        } catch (err) {
            showToast(t('emailInUse'), 'error');
        }
    });

    els.logoutBtn.addEventListener('click', () => {
        logoutUser();
        checkAuthState(onAuthChange);
        showToast(t('logout'), 'success');
    });
}

function checkAuthState(onAuthChange) {
    const isAuth = isAuthenticated();

    if (isAuth) {
        els.authView.style.display = 'none';
        els.dashboardView.style.display = 'grid';
        els.settingsBtn.style.display = 'inline-flex';
        els.logoutBtn.style.display = 'inline-flex';
    } else {
        els.authView.style.display = 'flex';
        els.dashboardView.style.display = 'none';
        els.settingsBtn.style.display = 'none';
        els.logoutBtn.style.display = 'none';
    }

    // Trigger callback to render dashboard if needed
    if (onAuthChange) onAuthChange(isAuth);
}

// Toast Notification System
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'error' ? 'alert-circle' : 'check-circle';

    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="icon-btn" style="width: 24px; height: 24px; margin-left: 0.5rem" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    els.toastContainer.appendChild(toast);

    // Close button logic
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => removeToast(toast));

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    toast.classList.add('toast-fade-out');
    toast.addEventListener('animationend', () => {
        if (toast.parentElement) {
            toast.remove();
        }
    });
}
