// Income form handling
document.addEventListener('DOMContentLoaded', function() {
    const incomeForm = document.getElementById('incomeForm');
    
    if (incomeForm) {
        incomeForm.addEventListener('submit', handleIncomeSubmit);
        
        // Set default date to today
        const receivedOnInput = document.getElementById('receivedOn');
        if (receivedOnInput) {
            receivedOnInput.value = new Date().toISOString().split('T')[0];
        }
    }
});

async function handleIncomeSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const incomeData = {};
    
    // Convert FormData to regular object
    for (let [key, value] of formData.entries()) {
        incomeData[key] = value;
    }
    
    // Validate required fields
    const requiredFields = ['income_cat', 'amount'];
    const errors = validateForm(incomeData, requiredFields);
    
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
            ...incomeData,
            entry_by: 'Web User',
            ip_address: ipAddress,
            browser_name: browserInfo.browserName,
            browser_ver: browserInfo.browserVersion,
            operating_sys: browserInfo.operatingSystem
        };
        
        // Submit to API
        const response = await financeAPI.addIncome(submissionData);
        
        if (response.success) {
            showMessage('Income added successfully!', 'success');
            resetForm();
        } else {
            throw new Error(response.message || 'Failed to add income');
        }
        
    } catch (error) {
        console.error('Error adding income:', error);
        showMessage('Failed to add income. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function resetForm() {
    const form = document.getElementById('incomeForm');
    if (form) {
        form.reset();
        
        // Reset date to today
        const receivedOnInput = document.getElementById('receivedOn');
        if (receivedOnInput) {
            receivedOnInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Reset status to default
        const statusSelect = document.getElementById('status');
        if (statusSelect) {
            statusSelect.value = '1';
        }
    }
}

// Category mapping for display purposes
const incomeCategoryMap = {
    '1': 'Course',
    '2': 'Internship',
    '3': 'Project',
    '4': 'Digital Marketing',
    '5': 'Others'
};

const statusMap = {
    '1': 'Success',
    '2': 'Failed',
    '3': 'Wrong Entry',
    '4': 'Inactive'
};

// Utility function to get category name
function getIncomeCategoryName(categoryId) {
    return incomeCategoryMap[categoryId] || 'Unknown';
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
    
    // Auto-format mobile number
    const mobileInput = document.getElementById('senderMobile');
    if (mobileInput) {
        mobileInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 10) {
                value = value.slice(0, 10); // Limit to 10 digits
            }
            e.target.value = value;
        });
    }
    
    // Category change handler to show relevant remarks
    const categorySelect = document.getElementById('incomeCategory');
    const remarksInput = document.getElementById('categoryRemarks');
    
    if (categorySelect && remarksInput) {
        categorySelect.addEventListener('change', function(e) {
            const category = e.target.value;
            const categoryName = getIncomeCategoryName(category);
            
            if (category) {
                remarksInput.placeholder = `Enter remarks for ${categoryName}`;
            } else {
                remarksInput.placeholder = 'Enter category remarks';
            }
        });
    }
});