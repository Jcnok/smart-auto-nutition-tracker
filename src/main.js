import './style.css';
import { createIcons } from 'lucide';
import * as icons from 'lucide';
import Chart from 'chart.js/auto';
import {
    loadState, getGoals, updateGoals, addMeal, deleteMeal,
    getTodayMeals, getTodayTotals, getHistory, getTodayDateString
} from './store.js';
import { analyzeMealImage, analyzeMealText } from './gemini.js';
import { compressImage } from './image-utils.js';
import { initAuth, showToast } from './auth.js';
import { t, getLang, setLang } from './translations.js';

let chartInstance = null;
let currentPendingImageBase64 = null; // Store base64 for pre-analysis confirmation
let currentPendingImageUrl = null;

// DOM Elements
const els = {
    themeBtn: document.getElementById('theme-toggle'),
    currentDate: document.getElementById('current-date'),
    langSelector: document.getElementById('lang-selector'),
    navAppName: document.getElementById('nav-app-name'),

    // Core Modals
    mealModal: document.getElementById('meal-modal'),
    addMealBtn: document.getElementById('add-meal-btn'),
    closeMealModal: document.getElementById('close-meal-modal'),
    mealForm: document.getElementById('meal-form'),
    modalAddTitle: document.getElementById('modal-add-title'),

    settingsModal: document.getElementById('settings-modal'),
    settingsBtn: document.getElementById('settings-btn'),
    closeSettingsModal: document.getElementById('close-settings-modal'),
    settingsForm: document.getElementById('settings-form'),
    modalGoalsTitle: document.getElementById('modal-goals-title'),

    // Auth features (Re-query via DOM dynamically when accessed across files)

    // AI Features
    cameraBtn: document.getElementById('camera-btn'),
    galleryBtn: document.getElementById('gallery-btn'),
    imageInput: document.getElementById('image-input'),
    aiDescription: document.getElementById('ai-description'),
    aiTextBtn: document.getElementById('ai-text-btn'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingText: document.getElementById('loading-text'),

    // AI Pre-Analysis Preview Modal
    aiImagePreviewModal: document.getElementById('ai-image-preview-modal'),
    closeAiPreviewModal: document.getElementById('close-ai-preview-modal'),
    aiPreAnalysisImg: document.getElementById('ai-pre-analysis-img'),
    aiAnalyzeConfirmBtn: document.getElementById('ai-analyze-confirm-btn'),
    modalConfirmImgTitle: document.getElementById('modal-confirm-img-title'),
    txtConfirmAnalysis: document.getElementById('txt-confirm-analysis'),
    btnAnalyzeConfirmText: document.getElementById('btn-analyze-confirm'),

    // AI Review Modal
    aiReviewModal: document.getElementById('ai-review-modal'),
    closeAiModal: document.getElementById('close-ai-modal'),
    aiReviewForm: document.getElementById('ai-review-form'),
    aiPreviewContainer: document.getElementById('ai-preview-container'),
    aiPreviewImg: document.getElementById('ai-preview-img'),
    aiItemsList: document.getElementById('ai-items-list'),
    aiMealName: document.getElementById('ai-meal-name'),
    modalVerifyAiTitle: document.getElementById('modal-verify-ai-title'),
    lblAiMealName: document.getElementById('lbl-ai-meal-name'),
    lblAiDetected: document.getElementById('lbl-ai-detected'),
    lblAiAdjust: document.getElementById('lbl-ai-adjust'),
    btnAiConfirm: document.getElementById('btn-ai-confirm'),

    // Editable AI Totals
    aiTotalKcal: document.getElementById('ai-total-kcal'),
    aiTotalProtein: document.getElementById('ai-total-protein'),
    aiTotalCarbs: document.getElementById('ai-total-carbs'),
    aiTotalFat: document.getElementById('ai-total-fat'),

    // Dashboard Stats
    kcalConsumed: document.getElementById('kcal-consumed'),
    kcalGoal: document.getElementById('kcal-goal'),
    calorieRing: document.getElementById('calorie-progress-ring'),
    dashTitle: document.getElementById('dash-title'),

    proteinConsumed: document.getElementById('protein-consumed'),
    proteinGoal: document.getElementById('protein-goal'),
    proteinBar: document.getElementById('protein-bar'),
    carbsConsumed: document.getElementById('carbs-consumed'),
    carbsGoal: document.getElementById('carbs-goal'),
    carbsBar: document.getElementById('carbs-bar'),
    fatConsumed: document.getElementById('fat-consumed'),
    fatGoal: document.getElementById('fat-goal'),
    fatBar: document.getElementById('fat-bar'),

    mealsContainer: document.getElementById('meals-container'),
    historyChart: document.getElementById('historyChart'),
    historyTitle: document.getElementById('history-title'),
};

const CATEGORY_ICONS = {
    breakfast: 'coffee',
    lunch: 'sun',
    dinner: 'moon',
    snack: 'apple'
};

function init() {
    loadState();
    reinitializeIcons();
    updateDateDisplay();

    // Set initial language
    els.langSelector.value = getLang();
    applyTranslations();

    initAuth((isAuth) => {
        if (isAuth) {
            setupEventListeners();
            renderAll();
        }
    });
}

function updateDateDisplay() {
    const lang = getLang();
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
    els.currentDate.textContent = new Date().toLocaleDateString(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

export function applyTranslations() {
    const setIfExist = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.textContent = t(key);
    };

    // Nav
    els.navAppName.textContent = t('appName');

    // Dashboard
    els.dashTitle.textContent = t('dailySummary');
    els.historyTitle.textContent = t('history');

    // Main UI
    els.addMealBtn.innerHTML = `<i data-lucide="plus"></i> ${t('addMeal')}`;
    els.cameraBtn.innerHTML = `<i data-lucide="camera"></i> ${t('camera')}`;
    els.galleryBtn.innerHTML = `<i data-lucide="image"></i> ${t('gallery')}`;
    els.aiDescription.placeholder = t('placeholderDescription');

    // Modals Base
    els.modalAddTitle.textContent = t('addMeal');
    els.modalGoalsTitle.textContent = t('calorieGoal');
    els.modalConfirmImgTitle.textContent = t('confirmImage');
    els.txtConfirmAnalysis.textContent = t('txtConfirmAnalysis');
    els.btnAnalyzeConfirmText.textContent = t('analyzeMore');
    els.modalVerifyAiTitle.textContent = t('mealReview');
    els.lblAiMealName.textContent = t('mealName');
    els.lblAiDetected.textContent = t('detectedItems');
    els.lblAiAdjust.textContent = t('totals');
    els.btnAiConfirm.textContent = t('save');
    els.loadingText.textContent = t('loading');

    // Auth View
    setIfExist('login-title', 'loginTitle');
    setIfExist('login-subtitle', 'loginSubtitle');
    setIfExist('lbl-login-email', 'lblLoginEmail');
    setIfExist('lbl-login-password', 'lblLoginPassword');
    setIfExist('btn-login', 'btnLogin');
    setIfExist('txt-no-account', 'txtNoAccount');
    setIfExist('show-register', 'showRegister');
    setIfExist('register-title', 'registerTitle');
    setIfExist('register-subtitle', 'registerSubtitle');
    setIfExist('lbl-reg-name', 'lblRegName');
    setIfExist('lbl-reg-email', 'lblRegEmail');
    setIfExist('lbl-reg-password', 'lblRegPassword');
    setIfExist('lbl-reg-calories', 'lblRegCalories');
    setIfExist('btn-signup', 'btnSignup');
    setIfExist('txt-have-account', 'txtHaveAccount');
    setIfExist('show-login', 'showLogin');

    // Goal Modal Settings
    setIfExist('lbl-goal-kcal', 'lblGoalKcal');
    setIfExist('lbl-goal-prot', 'lblGoalProt');
    setIfExist('lbl-goal-carb', 'lblGoalCarb');
    setIfExist('lbl-goal-fat', 'lblGoalFat');
    setIfExist('btn-save-goals', 'btnSaveGoals');

    // Add Meal Modal
    setIfExist('lbl-meal-name', 'lblMealName');
    setIfExist('lbl-meal-cat', 'lblMealCat');
    setIfExist('lbl-meal-time', 'lblMealTime');
    setIfExist('lbl-meal-kcal', 'lblMealKcal');
    setIfExist('lbl-meal-prot', 'lblMealProt');
    setIfExist('lbl-meal-carb', 'lblMealCarb');
    setIfExist('lbl-meal-fat', 'lblMealFat');
    setIfExist('btn-save-meal', 'btnSaveMeal');

    // Dropdown Categories
    const mealCatSelect = document.getElementById('meal-category');
    if (mealCatSelect && mealCatSelect.options.length === 4) {
        mealCatSelect.options[0].text = t('catBreakfast');
        mealCatSelect.options[1].text = t('catLunch');
        mealCatSelect.options[2].text = t('catDinner');
        mealCatSelect.options[3].text = t('catSnack');
    }

    // Footer
    const footerDev = document.getElementById('footer-dev');
    if (footerDev) footerDev.innerHTML = `${t('developedBy')} <strong>Julio Okuda</strong>`;

    const footerPow = document.getElementById('footer-pow');
    if (footerPow) footerPow.innerHTML = `${t('poweredBy')} <strong>Vibecoding</strong> & <strong>Gemini</strong>`;

    updateDateDisplay();
    reinitializeIcons(); // In case labels changed
}

function reinitializeIcons() {
    createIcons({
        icons: {
            Leaf: icons.Leaf,
            Sun: icons.Sun,
            Moon: icons.Moon,
            Settings: icons.Settings,
            Plus: icons.Plus,
            X: icons.X,
            UtensilsCrossed: icons.UtensilsCrossed,
            Trash2: icons.Trash2,
            Coffee: icons.Coffee,
            Apple: icons.Apple,
            Camera: icons.Camera,
            Image: icons.Image,
            Sparkles: icons.Sparkles,
            User: icons.User,
            LogOut: icons.LogOut
        }
    });
}

// Track listeners to prevent duplicating if login/logout toggled multiple times
let listenersAttached = false;
function setupEventListeners() {
    if (listenersAttached) return;
    listenersAttached = true;

    els.themeBtn.addEventListener('click', toggleTheme);

    els.langSelector.addEventListener('change', (e) => {
        setLang(e.target.value);
        applyTranslations();
        renderAll(); // Refresh date strings in list
    });

    els.addMealBtn.addEventListener('click', () => {
        const now = new Date();
        document.getElementById('meal-time').value = now.toTimeString().slice(0, 5);
        els.mealModal.showModal();
    });
    els.closeMealModal.addEventListener('click', () => els.mealModal.close());
    els.mealForm.addEventListener('submit', handleAddMeal);

    els.settingsBtn.addEventListener('click', openSettingsModal);
    els.closeSettingsModal.addEventListener('click', () => els.settingsModal.close());
    els.settingsForm.addEventListener('submit', handleUpdateSettings);

    // AI Events
    els.cameraBtn.addEventListener('click', () => {
        els.imageInput.setAttribute('capture', 'environment');
        els.imageInput.click();
    });
    els.galleryBtn.addEventListener('click', () => {
        els.imageInput.removeAttribute('capture');
        els.imageInput.click();
    });

    els.imageInput.addEventListener('change', handleImageSelection);
    els.closeAiPreviewModal.addEventListener('click', () => {
        els.aiImagePreviewModal.close();
        els.imageInput.value = ''; // Reset input
    });
    els.aiAnalyzeConfirmBtn.addEventListener('click', executeImageAnalysis);

    els.aiTextBtn.addEventListener('click', handleTextAnalysis);
    els.aiDescription.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleTextAnalysis();
    });

    els.closeAiModal.addEventListener('click', () => els.aiReviewModal.close());
    els.aiReviewForm.addEventListener('submit', handleConfirmAiMeal);

    // Close Modals on backdrop click
    [els.mealModal, els.settingsModal, els.aiImagePreviewModal, els.aiReviewModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.close();
            });
        }
    });

    // Meal deletion
    els.mealsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-btn');
        if (btn) {
            deleteMeal(btn.dataset.id);
            renderAll();
            showToast('Meal removed.');
        }
    });
}

// AI Analysis Handlers
async function handleImageSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        // Compress and prepare preview
        const { base64, dataUrl } = await compressImage(file);

        // Store globally for the confirmation step
        currentPendingImageBase64 = base64;
        currentPendingImageUrl = dataUrl;

        // Show Pre-analysis preview modal
        els.aiPreAnalysisImg.src = dataUrl;
        els.aiImagePreviewModal.showModal();

    } catch (err) {
        alert('Error processing image: ' + err.message);
    }
}

async function executeImageAnalysis() {
    if (!currentPendingImageBase64) return;

    els.aiImagePreviewModal.close();

    try {
        showLoading(true);
        const result = await analyzeMealImage(currentPendingImageBase64);
        showAiReview(result, currentPendingImageUrl);
    } catch (err) {
        alert('Error analyzing image: ' + err.message);
    } finally {
        showLoading(false);
        els.imageInput.value = ''; // Reset
        currentPendingImageBase64 = null;
        currentPendingImageUrl = null;
    }
}

async function handleTextAnalysis() {
    const description = els.aiDescription.value.trim();
    if (!description) {
        alert("Please describe your meal first.");
        return;
    }

    try {
        showLoading(true);
        const result = await analyzeMealText(description);
        showAiReview(result);
    } catch (err) {
        alert('Error analyzing description: ' + err.message);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    els.loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showAiReview(result, previewUrl = null) {
    els.aiMealName.value = result.mealName || "Unknown Meal";
    els.aiItemsList.innerHTML = '';

    const items = result.items || [];
    if (items.length === 0) {
        els.aiItemsList.innerHTML = '<p style="color:hsl(var(--text-secondary)); font-size: 0.875rem;">No specific items detected. Using global estimates.</p>';
    }

    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'ai-item-row';
        row.innerHTML = `
            <div class="ai-item-header">
                <span class="ai-item-name">${item.name}</span>
                <span class="ai-item-portion">${item.portion}</span>
            </div>
            <div class="ai-item-macros">
                <span class="macro-badge badge-protein">P: ${item.protein}g</span>
                <span class="macro-badge badge-carbs">C: ${item.carbs}g</span>
                <span class="macro-badge badge-fat">F: ${item.fat}g</span>
                <span class="macro-badge">Cal: ${item.calories}</span>
            </div>
        `;
        els.aiItemsList.appendChild(row);
    });

    const totals = result.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Set editable inputs
    els.aiTotalKcal.value = totals.calories || 0;
    els.aiTotalProtein.value = totals.protein || 0;
    els.aiTotalCarbs.value = totals.carbs || 0;
    els.aiTotalFat.value = totals.fat || 0;

    if (previewUrl) {
        els.aiPreviewImg.src = previewUrl;
        els.aiPreviewContainer.style.display = 'block';
    } else {
        els.aiPreviewContainer.style.display = 'none';
    }

    els.aiReviewModal.showModal();
}

function handleConfirmAiMeal(e) {
    e.preventDefault();

    const now = new Date();
    // Use the potentially user-edited values from the form inputs
    const meal = {
        name: els.aiMealName.value,
        category: getCategoryByTime(now.getHours()),
        time: now.toTimeString().slice(0, 5),
        calories: Number(els.aiTotalKcal.value),
        protein: Number(els.aiTotalProtein.value),
        carbs: Number(els.aiTotalCarbs.value),
        fat: Number(els.aiTotalFat.value),
        date: getTodayDateString(),
    };

    addMeal(meal);
    els.aiReviewModal.close();
    els.aiDescription.value = '';
    renderAll();
}

function getCategoryByTime(hour) {
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 18 && hour < 22) return 'dinner';
    return 'snack';
}

// Rendering Logic
function renderAll() {
    renderDashboard();
    renderMealsList();
    renderChart();
}

function updateRingProgress(element, current, max) {
    const percentage = Math.min((current / max) * 100, 100);
    element.style.strokeDasharray = `${percentage}, 100`;

    element.classList.remove('status-green', 'status-yellow', 'status-red');
    if (percentage > 100) element.classList.add('status-red');
    else if (percentage > 85) element.classList.add('status-yellow');
    else element.classList.add('status-green');
}

function updateBarProgress(element, current, max) {
    const percentage = Math.min((current / max) * 100, 100);
    element.style.width = `${percentage}%`;
    element.style.backgroundColor = current > max ? 'hsl(var(--color-danger))' : '';
}

function renderDashboard() {
    const goals = getGoals();
    const totals = getTodayTotals();

    els.kcalConsumed.textContent = totals.calories.toFixed(0);
    els.kcalGoal.textContent = goals.calories;
    els.proteinConsumed.textContent = totals.protein.toFixed(0);
    els.proteinGoal.textContent = goals.protein;
    els.carbsConsumed.textContent = totals.carbs.toFixed(0);
    els.carbsGoal.textContent = goals.carbs;
    els.fatConsumed.textContent = totals.fat.toFixed(0);
    els.fatGoal.textContent = goals.fat;

    updateRingProgress(els.calorieRing, totals.calories, goals.calories);
    updateBarProgress(els.proteinBar, totals.protein, goals.protein);
    updateBarProgress(els.carbsBar, totals.carbs, goals.carbs);
    updateBarProgress(els.fatBar, totals.fat, goals.fat);
}

function renderMeals() {
    const meals = getMeals();
    els.mealsContainer.innerHTML = '';

    if (meals.length === 0) {
        els.mealsContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="utensils-crossed"></i>
                <p>${t('noAccount') === 'No account?' ? 'No meals added today.' : (getLang() === 'pt' ? 'Nenhuma refeição adicionada hoje.' : 'No meals added today.')}</p>
            </div>
        `;
        reinitializeIcons();
        return;
    }

    meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'meal-card card animate-in';
        card.innerHTML = `
            <div class="meal-icon category-${meal.category}">
                <i data-lucide="${CATEGORY_ICONS[meal.category] || 'utensils-crossed'}"></i>
            </div>
            <div class="meal-info">
                <h4>${meal.name}</h4>
                <div class="meal-meta">
                    <span>${meal.time}</span>
                    <span class="dot"></span>
                    <span>${meal.calories} kcal</span>
                </div>
            </div>
            <div class="meal-macros">
                <div class="mini-macro"><span>${meal.protein}g</span><small>${t('protein').charAt(0)}</small></div>
                <div class="mini-macro"><span>${meal.carbs}g</span><small>${t('carbs').charAt(0)}</small></div>
                <div class="mini-macro"><span>${meal.fat}g</span><small>${t('fat').charAt(0)}</small></div>
            </div>
            <button class="delete-btn icon-btn" data-id="${meal.id}" aria-label="Delete meal">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        els.mealsContainer.appendChild(card);
    });

    reinitializeIcons();
}

function renderChart() {
    const historyData = getHistory(7);
    const goals = getGoals();

    const labels = historyData.map(d => d.displayDate);
    const data = historyData.map(d => d.calories);
    const goalLine = new Array(7).fill(goals.calories);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)';
    const gridColor = isDark ? 'hsl(217 33% 17%)' : 'hsl(214 32% 91%)';
    const accentColor = 'hsl(142 71% 45%)';

    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = data;
        chartInstance.data.datasets[1].data = goalLine;
        chartInstance.options.scales.x.grid.color = gridColor;
        chartInstance.options.scales.y.grid.color = gridColor;
        chartInstance.options.scales.x.ticks.color = textColor;
        chartInstance.options.scales.y.ticks.color = textColor;
        chartInstance.options.plugins.legend.labels.color = textColor;
        chartInstance.update();
        return;
    }

    const ctx = els.historyChart.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Calories',
                    data: data,
                    backgroundColor: 'hsla(142, 71%, 45%, 0.5)',
                    borderColor: accentColor,
                    borderWidth: 2,
                    borderRadius: 4,
                },
                {
                    label: 'Goal',
                    data: goalLine,
                    type: 'line',
                    borderColor: 'hsla(38, 92%, 50%, 0.8)',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: textColor, font: { family: 'Inter' } } },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDark ? 'hsl(222 47% 6%)' : 'white',
                    titleColor: isDark ? 'white' : 'black',
                    bodyColor: isDark ? 'hsl(215 20% 65%)' : 'hsl(215 16% 47%)',
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4
                }
            },
            scales: {
                x: { grid: { display: false, color: gridColor }, ticks: { color: textColor, font: { family: 'Inter' } } },
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter' } } }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);

    els.themeBtn.innerHTML = newTheme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    reinitializeIcons();
    renderChart();
}

function handleAddMeal(e) {
    e.preventDefault();
    const meal = {
        name: document.getElementById('meal-name').value,
        category: document.getElementById('meal-category').value,
        time: document.getElementById('meal-time').value,
        calories: Number(document.getElementById('meal-calories').value),
        protein: Number(document.getElementById('meal-protein').value),
        carbs: Number(document.getElementById('meal-carbs').value),
        fat: Number(document.getElementById('meal-fat').value),
        date: getTodayDateString(),
    };

    addMeal(meal);
    els.mealForm.reset();
    els.mealModal.close();
    renderAll();
}

function openSettingsModal() {
    const goals = getGoals();
    document.getElementById('goal-calories').value = goals.calories;
    document.getElementById('goal-protein').value = goals.protein;
    document.getElementById('goal-carbs').value = goals.carbs;
    document.getElementById('goal-fat').value = goals.fat;
    els.settingsModal.showModal();
}

function handleUpdateSettings(e) {
    e.preventDefault();
    const goals = {
        calories: Number(document.getElementById('goal-calories').value),
        protein: Number(document.getElementById('goal-protein').value),
        carbs: Number(document.getElementById('goal-carbs').value),
        fat: Number(document.getElementById('goal-fat').value),
    };

    updateGoals(goals);
    els.settingsModal.close();
    renderAll();
}

window.addEventListener('DOMContentLoaded', init);
