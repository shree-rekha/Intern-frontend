// Authentication handling
class AuthManager {
    constructor() {
        this.tokenKey = 'finance_auth_token';
        this.userKey = 'finance_user_data';
        // Only initialize auth checks on auth pages or when explicitly needed
        if (this.isAuthPage()) {
            this.init();
        }
    }

    init() {
        // Check if user is already logged in
        if (this.isLoggedIn() && this.isAuthPage()) {
            window.location.href = 'index.html';
        }
        // Remove the automatic redirect to login for non-auth pages
    }

    isAuthPage() {
        const path = window.location.pathname;
        return path.includes('login.html') || path.includes('register.html');
    }

    isLoggedIn() {
        const token = localStorage.getItem(this.tokenKey);
        const user = localStorage.getItem(this.userKey);
        return token && user;
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    setAuth(token, userData) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(userData));
    }

    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    async login(email, password, rememberMe = false) {
        try {
            const response = await financeAPI.login({
                email,
                password,
                rememberMe
            });

            if (response.success) {
                this.setAuth(response.token, response.user);
                return { success: true, message: 'Login successful!' };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }

    async register(userData) {
        try {
            const response = await financeAPI.register(userData);

            if (response.success) {
                return { success: true, message: 'Registration successful! Please login.' };
            } else {
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed. Please try again.' };
        }
    }

    logout() {
        this.clearAuth();
        window.location.href = 'login.html';
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;
    
    try {
        const result = await authManager.login(email, password, rememberMe);
        
        if (result.success) {
            showAuthMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showAuthMessage(result.message, 'error');
        }
    } catch (error) {
        showAuthMessage('Login failed. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        mobile: formData.get('mobile'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }
    
    // Validate mobile number
    if (!/^\d{10}$/.test(userData.mobile)) {
        showAuthMessage('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        const result = await authManager.register(userData);
        
        if (result.success) {
            showAuthMessage('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showAuthMessage(result.message, 'error');
        }
    } catch (error) {
        showAuthMessage('Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showAuthMessage(message, type = 'success') {
    const messageDiv = document.getElementById('loginMessage') || document.getElementById('registerMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Add logout functionality to existing pages
function addLogoutButton() {
    const nav = document.querySelector('.nav');
    if (nav && authManager.isLoggedIn()) {
        const user = authManager.getUser();
        const logoutBtn = document.createElement('div');
        logoutBtn.className = 'nav-user';
        logoutBtn.innerHTML = `
            <span class="user-name">Welcome, ${user?.firstName || 'User'}</span>
            <button class="btn-logout" onclick="authManager.logout()">Logout</button>
        `;
        nav.appendChild(logoutBtn);
    }
}

// Add logout button when page loads (for non-auth pages)
if (!authManager.isAuthPage()) {
    document.addEventListener('DOMContentLoaded', addLogoutButton);
}