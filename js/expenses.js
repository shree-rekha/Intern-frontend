// Expenses form handling
document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expenseForm');
    
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
        
        // Set default date to today
        const spentOnInput = document.getElementById('spentOn');
        if (spentOnInput) {
            spentOnInput.value = new Date().toISOString().split('T')[0];
        }
    }
});

async function handleExpenseSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const expenseData = {};
    
    // Convert FormData to regular object
    for (let [key, value] of formData.entries()) {
        expenseData[key] = value;
    }
    
    // Validate required fields
    const requiredFields = ['expense_cat', 'amount'];
    const errors = validateForm(expenseData, requiredFields);
    
    if (errors.length > 0) {
        showMessage(errors.join(', '), 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;
        
        // Get browser info for tracking
        const browserInfo = getBrowserInfo();
        const ipAddress = await getUserIP();
        
        // Prepare data for submission
        const submissionData = {
            ...expenseData,
            entry_by: 'Web User',
            ip_address: ipAddress,
            browser_name: browserInfo.browserName,
            browser_ver: browserInfo.browserVersion,
            operating_sys: browserInfo.operatingSystem
        };
        
        // Submit to API
        const response = await financeAPI.addExpense(submissionData);
        
        if (response.success) {
            showMessage('Expense added successfully!', 'success');
            resetForm();
        } else {
            throw new Error(response.message || 'Failed to add expense');
        }
        
    } catch (error) {
        console.error('Error adding expense:', error);
        showMessage('Failed to add expense. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function resetForm() {
    const form = document.getElementById('expenseForm');
    if (form) {
        form.reset();
        
        // Reset date to today
        const spentOnInput = document.getElementById('spentOn');
        if (spentOnInput) {
            spentOnInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Reset status to default
        const statusSelect = document.getElementById('status');
        if (statusSelect) {
            statusSelect.value = '1';
        }
    }
}

// Category mapping for display purposes
const expenseCategoryMap = {
    '1': 'Travel',
    '2': 'Food',
    '3': 'Stationery',
    '4': 'Banking',
    '5': 'Others'
};

const statusMap = {
    '1': 'Success',
    '2': 'Failed',
    '3': 'Wrong Entry',
    '4': 'Inactive'
};

// Utility function to get category name
function getExpenseCategoryName(categoryId) {
    return expenseCategoryMap[categoryId] || 'Unknown';
}

// Utility function to get status name
function getStatusName(statusId) {
    return statusMap[statusId] || 'Unknown';
}

// Form field event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Auto-format amount input
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            let value = e.target.value;
            // Remove any non-numeric characters except decimal point
            value = value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            e.target.value = value;
        });
    }
    
    // Category change handler to show relevant remarks
    const categorySelect = document.getElementById('expenseCategory');
    const remarksInput = document.getElementById('categoryRemarks');
    
    if (categorySelect && remarksInput) {
        categorySelect.addEventListener('change', function(e) {
            const category = e.target.value;
            const categoryName = getExpenseCategoryName(category);
            
            if (category) {
                remarksInput.placeholder = `Enter remarks for ${categoryName}`;
            } else {
                remarksInput.placeholder = 'Enter category remarks';
            }
        });
    }
    
    // Transaction mode suggestions
    const spentThroughInput = document.getElementById('spentThrough');
    if (spentThroughInput) {
        const commonModes = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque'];
        
        spentThroughInput.addEventListener('focus', function() {
            // You could implement autocomplete functionality here
            console.log('Transaction modes:', commonModes);
        });
    }
    
    // Spent by field suggestions
    const spentByInput = document.getElementById('spentBy');
    if (spentByInput) {
        spentByInput.addEventListener('focus', function() {
            // You could load previous "spent by" entries for autocomplete
            console.log('Loading previous spenders...');
        });
    }
});

// Validation functions specific to expenses
function validateExpenseForm(expenseData) {
    const errors = [];
    
    // Check if amount is reasonable for the category
    const amount = parseFloat(expenseData.amount);
    const category = expenseData.expense_cat;
    
    if (category === '2' && amount > 10000) { // Food
        errors.push('Food expense seems unusually high. Please verify the amount.');
    }
    
    if (category === '3' && amount > 5000) { // Stationery
        errors.push('Stationery expense seems unusually high. Please verify the amount.');
    }
    
    // Check if future date
    if (expenseData.spent_on) {
        const spentDate = new Date(expenseData.spent_on);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (spentDate > today) {
            errors.push('Expense date cannot be in the future.');
        }
    }
    
    return errors;
}