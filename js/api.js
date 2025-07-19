// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL

// API Endpoints
const API_ENDPOINTS = {
    auth: `${API_BASE_URL}/auth`,
    income: `${API_BASE_URL}/income`,
    expenses: `${API_BASE_URL}/expenses`,
    salary: `${API_BASE_URL}/salary`,
    accountsDetails: `${API_BASE_URL}/accounts-details`,
    dashboard: `${API_BASE_URL}/dashboard`
};

// Common API functions
class FinanceAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Generic API call method
    async apiCall(url, options = {}) {
        try {
            // Add auth token to headers if available
            const token = localStorage.getItem('finance_auth_token');
            if (token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };
            }

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    // Authentication API methods
    async login(loginData) {
        return this.apiCall(`${API_ENDPOINTS.auth}/login`, {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
    }

    async register(userData) {
        return this.apiCall(`${API_ENDPOINTS.auth}/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        return this.apiCall(`${API_ENDPOINTS.auth}/logout`, {
            method: 'POST'
        });
    }

    async verifyToken() {
        return this.apiCall(`${API_ENDPOINTS.auth}/verify`);
    }

    // Income API methods
    async addIncome(incomeData) {
        return this.apiCall(API_ENDPOINTS.income, {
            method: 'POST',
            body: JSON.stringify(incomeData)
        });
    }

    async getIncome(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return this.apiCall(`${API_ENDPOINTS.income}?${queryParams}`);
    }

    async updateIncome(id, incomeData) {
        return this.apiCall(`${API_ENDPOINTS.income}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(incomeData)
        });
    }

    async deleteIncome(id) {
        return this.apiCall(`${API_ENDPOINTS.income}/${id}`, {
            method: 'DELETE'
        });
    }

    // Expenses API methods
    async addExpense(expenseData) {
        return this.apiCall(API_ENDPOINTS.expenses, {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    }

    async getExpenses(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return this.apiCall(`${API_ENDPOINTS.expenses}?${queryParams}`);
    }

    async updateExpense(id, expenseData) {
        return this.apiCall(`${API_ENDPOINTS.expenses}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData)
        });
    }

    async deleteExpense(id) {
        return this.apiCall(`${API_ENDPOINTS.expenses}/${id}`, {
            method: 'DELETE'
        });
    }

    // Salary API methods
    async addSalary(salaryData) {
        return this.apiCall(API_ENDPOINTS.salary, {
            method: 'POST',
            body: JSON.stringify(salaryData)
        });
    }

    async getSalary(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return this.apiCall(`${API_ENDPOINTS.salary}?${queryParams}`);
    }

    async updateSalary(id, salaryData) {
        return this.apiCall(`${API_ENDPOINTS.salary}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(salaryData)
        });
    }

    async deleteSalary(id) {
        return this.apiCall(`${API_ENDPOINTS.salary}/${id}`, {
            method: 'DELETE'
        });
    }

    // Dashboard API methods
    async getDashboardData() {
        return this.apiCall(API_ENDPOINTS.dashboard);
    }

    // Account details API methods
    async getAccountsDetails(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return this.apiCall(`${API_ENDPOINTS.accountsDetails}?${queryParams}`);
    }
}

// Create global API instance
const financeAPI = new FinanceAPI();

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN');
}

function formatDateTime(datetime) {
    return new Date(datetime).toLocaleString('en-IN');
}

// Form validation functions
function validateForm(formData, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].toString().trim() === '') {
            errors.push(`${field.replace('_', ' ')} is required`);
        }
    });

    // Validate amount
    if (formData.amount && (isNaN(formData.amount) || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > 99999999.99)) {
        errors.push('Amount must be a valid positive number (max: 99,999,999.99)');
    }

    // Validate mobile number
    if (formData.sender_mobile && !/^\d{10}$/.test(formData.sender_mobile)) {
        errors.push('Mobile number must be 10 digits');
    }

    // Validate VARCHAR field lengths
    const fieldLimits = {
        income_cat_remarks: 200,
        expense_cat_remarks: 200,
        payment_type_remarks: 200,
        received_by: 50,
        sender_name: 50,
        sender_mobile: 20,
        spent_by: 50,
        spent_through: 50,
        payment_to_whom: 50,
        payment_through: 50,
        entry_by: 50,
        ip_address: 20,
        browser_name: 20,
        browser_ver: 20,
        operating_sys: 20
    };

    Object.keys(fieldLimits).forEach(field => {
        if (formData[field] && formData[field].length > fieldLimits[field]) {
            errors.push(`${field.replace('_', ' ')} must be ${fieldLimits[field]} characters or less`);
        }
    });

    // Validate specific field constraints
    if (formData.remarks) {
        // For expenses and salary, remarks is VARCHAR(20)
        if ((formData.expense_cat || formData.payment_type) && formData.remarks.length > 20) {
            errors.push('Remarks must be 20 characters or less');
        }
        // For income, remarks is TEXT (no length limit needed)
    }

    return errors;
}

// Show success/error messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.form-container') || document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Get browser information for accounts_details table
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let operatingSystem = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) {
        browserName = 'Chrome';
        browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
    } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        browserVersion = userAgent.match(/Version\/([0-9.]+)/)[1];
    } else if (userAgent.includes('Edge')) {
        browserName = 'Edge';
        browserVersion = userAgent.match(/Edge\/([0-9.]+)/)[1];
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
        operatingSystem = 'Windows';
    } else if (userAgent.includes('Mac')) {
        operatingSystem = 'macOS';
    } else if (userAgent.includes('Linux')) {
        operatingSystem = 'Linux';
    } else if (userAgent.includes('Android')) {
        operatingSystem = 'Android';
    } else if (userAgent.includes('iOS')) {
        operatingSystem = 'iOS';
    }

    return {
        browserName,
        browserVersion,
        operatingSystem
    };
}

// Get user IP address (you might want to use a service for this)
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Failed to get IP address:', error);
        return 'Unknown';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { financeAPI, formatCurrency, formatDate, formatDateTime, validateForm, showMessage, getBrowserInfo, getUserIP };
}