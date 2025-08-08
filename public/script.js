// Global variables
let currentUser = null;

// DOM elements
const welcomeSection = document.getElementById('welcomeSection');
const registrationSection = document.getElementById('registrationSection');
const loginSection = document.getElementById('loginSection');
const successSection = document.getElementById('successSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const notification = document.getElementById('notification');

// Form elements
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');

// Success section elements
const successMessage = document.getElementById('successMessage');
const credentials = document.getElementById('credentials');
const credUsername = document.getElementById('credUsername');
const credPassword = document.getElementById('credPassword');

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
});

// Navigation functions
function showWelcome() {
    hideAllSections();
    welcomeSection.style.display = 'block';
}

function showRegistration() {
    hideAllSections();
    registrationSection.style.display = 'block';
}

function showLogin() {
    hideAllSections();
    loginSection.style.display = 'block';
}

function showSuccess(message, showCredentials = false, username = '', password = '') {
    hideAllSections();
    successSection.style.display = 'block';
    successMessage.textContent = message;
    
    if (showCredentials) {
        credentials.style.display = 'block';
        credUsername.textContent = username;
        credPassword.textContent = password;
    } else {
        credentials.style.display = 'none';
    }
}

function hideAllSections() {
    welcomeSection.style.display = 'none';
    registrationSection.style.display = 'none';
    loginSection.style.display = 'none';
    successSection.style.display = 'none';
}

// API functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/portal/status');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.username;
            showSuccess(`Welcome back, ${data.username}! You are connected to the internet.`);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

async function registerUser(formData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(
                'Registration successful! You can now connect to the internet.',
                true,
                data.credentials.username,
                data.credentials.password
            );
            showNotification('Registration successful!', 'success');
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
    }
}

async function loginUser(formData) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            currentUser = formData.username;
            showSuccess(`Welcome back! You are now connected to the internet.`);
            showNotification('Login successful!', 'success');
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            currentUser = null;
            showWelcome();
            showNotification('Logged out successfully', 'success');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// Form event listeners
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        companyName: document.getElementById('companyName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim()
    };

    await registerUser(formData);
    hideLoading();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const formData = {
        username: document.getElementById('loginUsername').value.trim(),
        password: document.getElementById('loginPassword').value.trim()
    };

    await loginUser(formData);
    hideLoading();
});

// Utility functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Input validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Real-time validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    if (email && !validateEmail(email)) {
        this.style.borderColor = '#ef4444';
        showNotification('Please enter a valid email address', 'error');
    } else {
        this.style.borderColor = '#e1e5e9';
    }
});

document.getElementById('phoneNumber').addEventListener('blur', function() {
    const phone = this.value.trim();
    if (phone && !validatePhone(phone)) {
        this.style.borderColor = '#ef4444';
        showNotification('Please enter a valid phone number', 'error');
    } else {
        this.style.borderColor = '#e1e5e9';
    }
});

// Copy credentials to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Add click handlers for credential copying
document.addEventListener('click', (e) => {
    if (e.target.closest('.credential-item span')) {
        const text = e.target.textContent;
        copyToClipboard(text);
    }
});

// Handle back button
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
        switch(e.state.section) {
            case 'welcome':
                showWelcome();
                break;
            case 'registration':
                showRegistration();
                break;
            case 'login':
                showLogin();
                break;
        }
    }
});

// Update browser history
function updateHistory(section) {
    const state = { section: section };
    const url = section === 'welcome' ? '/' : `/${section}`;
    history.pushState(state, '', url);
}

// Enhanced navigation with history
const originalShowWelcome = showWelcome;
const originalShowRegistration = showRegistration;
const originalShowLogin = showLogin;

showWelcome = function() {
    originalShowWelcome();
    updateHistory('welcome');
};

showRegistration = function() {
    originalShowRegistration();
    updateHistory('registration');
};

showLogin = function() {
    originalShowLogin();
    updateHistory('login');
};
