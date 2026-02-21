// Global storage key
const STORE_KEY = 'nutri_ai_app_state';

const defaultGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
};

// State structure redefined for multiple users
let state = {
    users: [], // { id, name, email, password }
    currentUser: null, // id of the logged-in user
    userData: {} // Map of userId -> { goals: {}, meals: [] }
};

export const loadState = () => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
        state = JSON.parse(saved);
        if (!state.users) state.users = [];
        if (!state.userData) state.userData = {};
    }
};

export const saveState = () => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
};

// --- AUTHENTICATION METHODS ---
export const registerUser = (name, email, password, initialGoals) => {
    const existing = state.users.find(u => u.email === email);
    if (existing) {
        throw new Error("Email already in use.");
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password // Note: Plaintext used here strictly for local demonstration purposes.
    };

    state.users.push(newUser);

    // Initialize their data
    state.userData[newUser.id] = {
        goals: initialGoals ? { ...defaultGoals, ...initialGoals } : { ...defaultGoals },
        meals: []
    };

    saveState();
    return newUser;
};

export const loginUser = (email, password) => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (!user) {
        throw new Error("Invalid credentials.");
    }
    state.currentUser = user.id;
    saveState();
    return user;
};

export const logoutUser = () => {
    state.currentUser = null;
    saveState();
};

export const getCurrentUser = () => {
    if (!state.currentUser) return null;
    return state.users.find(u => u.id === state.currentUser);
};

export const isAuthenticated = () => {
    return !!state.currentUser;
};

// --- DATA METHODS (Namespaced to currentUser) ---

const getUserData = () => {
    if (!state.currentUser) return { goals: { ...defaultGoals }, meals: [] };
    return state.userData[state.currentUser];
};

export const getGoals = () => {
    return getUserData().goals;
};

export const updateGoals = (newGoals) => {
    if (!state.currentUser) return;
    const userData = getUserData();
    userData.goals = { ...userData.goals, ...newGoals };
    saveState();
};

export const getMeals = () => {
    return getUserData().meals;
};

export const addMeal = (meal) => {
    if (!state.currentUser) return;
    const userData = getUserData();

    meal.id = Date.now().toString();
    meal.date = meal.date || new Date().toISOString().split('T')[0];

    // Parse numeric fields safely, handling commas
    const parseNumber = (val) => Number(String(val).replace(',', '.')) || 0;
    meal.calories = parseNumber(meal.calories);
    meal.protein = parseNumber(meal.protein);
    meal.carbs = parseNumber(meal.carbs);
    meal.fat = parseNumber(meal.fat);

    userData.meals.push(meal);
    userData.meals.sort((a, b) => a.time.localeCompare(b.time));
    saveState();
};

export const deleteMeal = (id) => {
    if (!state.currentUser) return;
    const userData = getUserData();
    userData.meals = userData.meals.filter(m => m.id !== id);
    saveState();
};

export const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

export const getTodayMeals = () => {
    const today = getTodayDateString();
    return getMeals().filter(m => m.date === today);
};

export const getTodayTotals = () => {
    const todayMeals = getTodayMeals();
    return todayMeals.reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

export const getHistory = (days = 7) => {
    const history = [];
    const today = new Date();
    const meals = getMeals();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const dayMeals = meals.filter(m => m.date === dateStr);
        const calories = dayMeals.reduce((sum, m) => sum + m.calories, 0);

        history.push({
            date: dateStr,
            displayDate: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
            calories
        });
    }

    return history;
};
