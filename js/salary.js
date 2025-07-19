// Salary form handling
document.addEventListener('DOMContentLoaded', function() {
    const salaryForm = document.getElementById('salaryForm');
    
    if (salaryForm) {
        salaryForm.addEventListener('submit', handleSalarySubmit);
        
        // Set default date to today
        const spentDateInput = document.getElementById('spentDate');
        if (spentDateInput) {
            spentDateInput.value = new Date().toISOString().split('T')[0];
        }
    }
});

async function handleSalarySubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const salaryData = {};
    
    // Convert FormData to regular object
    for (let [key, value] of formData.entries()) {
        salaryData[key] = value;
    }
    
    // Validate required fields
    const requiredFields = ['payment_type', 'amount'];
    const errors = validateForm(salaryData, requiredFields);
    
    // Additional salary-specific validation
    const salaryErrors = validateSalaryForm(salaryData);
    errors.push(...salaryErrors);
    
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
            ...salaryData,
            entry_by: 'Web User',
            ip_address: ipAddress,
            browser_name: browserInfo.browserName,
            browser_ver: browserInfo.browserVersion,
            operating_sys: browserInfo.operatingSystem
        };
        
        // Submit to API
        const response = await financeAPI.addSalary(submissionData);
        
        if (response.success) {
            showMessage('Salary entry added successfully!', 'success');
            resetForm();
        } else {
            throw new Error(response.message || 'Failed to add salary entry');
        }
        
    } catch (error) {
        console.error('Error adding salary:', error);
        showMessage('Failed to add salary entry. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function resetForm() {
    const form = document.getElementById('salaryForm');
    if (form) {
        form.reset();
        
        // Reset date to today
        const spentDateInput = document.getElementById('spentDate');
        if (spentDateInput) {
            spentDateInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

// Payment type mapping for display purposes
const paymentTypeMap = {
    '1': 'Shares',
    '2': 'Salary',
    '3': 'Others'
};

// Utility function to get payment type name
function getPaymentTypeName(typeId) {
    return paymentTypeMap[typeId] || 'Unknown';
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
    
    // Payment type change handler
    const paymentTypeSelect = document.getElementById('paymentType');
    const remarksInput = document.getElementById('paymentTypeRemarks');
    const paymentToInput = document.getElementById('paymentToWhom');
    
    if (paymentTypeSelect && remarksInput) {
        paymentTypeSelect.addEventListener('change', function(e) {
            const paymentType = e.target.value;
            const typeName = getPaymentTypeName(paymentType);
            
            if (paymentType) {
                remarksInput.placeholder = `Enter remarks for ${typeName}`;
                
                // Set default values based on payment type
                if (paymentType === '2' && paymentToInput) { // Salary
                    paymentToInput.placeholder = 'Employee name';
                } else if (paymentType === '1' && paymentToInput) { // Shares
                    paymentToInput.placeholder = 'Shareholder name';
                } else if (paymentToInput) {
                    paymentToInput.placeholder = 'Recipient name';
                }
            } else {
                remarksInput.placeholder = 'Enter payment type remarks';
                if (paymentToInput) {
                    paymentToInput.placeholder = 'Payment recipient';
                }
            }
        });
    }
    
    // Payment mode suggestions
    const paymentThroughInput = document.getElementById('paymentThrough');
    if (paymentThroughInput) {
        const commonModes = ['Bank Transfer', 'Cash', 'Cheque', 'UPI', 'NEFT', 'RTGS', 'IMPS'];
        
        paymentThroughInput.addEventListener('focus', function() {
            // You could implement autocomplete functionality here
            console.log('Payment modes:', commonModes);
        });
    }
});

// Validation functions specific to salary
function validateSalaryForm(salaryData) {
    const errors = [];
    
    // Check if amount is reasonable for the payment type
    const amount = parseFloat(salaryData.amount);
    const paymentType = salaryData.payment_type;
    
    if (paymentType === '2' && amount < 1000) { // Salary
        errors.push('Salary amount seems unusually low. Please verify the amount.');
    }
    
    if (paymentType === '2' && amount > 1000000) { // Salary
        errors.push('Salary amount seems unusually high. Please verify the amount.');
    }
    
    // Check if future date
    if (salaryData.spent_date) {
        const paymentDate = new Date(salaryData.spent_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (paymentDate > today) {
            errors.push('Payment date cannot be in the future.');
        }
        
        // Check if date is too far in the past (more than 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        if (paymentDate < oneYearAgo) {
            errors.push('Payment date seems too far in the past. Please verify the date.');
        }
    }
    
    // Validate payment recipient
    if (salaryData.payment_to_whom && salaryData.payment_to_whom.trim().length < 2) {
        errors.push('Payment recipient name should be at least 2 characters long.');
    }
    
    return errors;
}

// Calculate monthly/yearly salary projections
function calculateSalaryProjections(amount, paymentType) {
    if (paymentType === '2') { // Salary
        const monthly = amount;
        const yearly = amount * 12;
        
        return {
            monthly: monthly,
            yearly: yearly,
            formatted: {
                monthly: formatCurrency(monthly),
                yearly: formatCurrency(yearly)
            }
        };
    }
    return null;
}

// Show salary projections (could be used for dashboard or confirmation)
function showSalaryProjections(amount, paymentType) {
    if (paymentType === '2') {
        const projections = calculateSalaryProjections(amount, paymentType);
        if (projections) {
            console.log(`Monthly Salary: ${projections.formatted.monthly}`);
            console.log(`Yearly Salary: ${projections.formatted.yearly}`);
        }
    }
}