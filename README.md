# Financial Management System - Frontend

A comprehensive web-based financial management system for tracking income, expenses, and salary payments.

## Features

- **Dashboard**: Overview of financial statistics and quick navigation
- **Income Management**: Track income from courses, internships, projects, and digital marketing
- **Expense Tracking**: Monitor expenses across travel, food, stationery, banking, and other categories
- **Salary Management**: Record salary payments and share distributions
- **Records View**: Comprehensive view of all financial records with filtering options
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox and grid layouts
- **Vanilla JavaScript**: Dynamic behavior and form handling
- **Fetch API**: RESTful API communication

## Database Schema

The frontend is designed to work with the following MySQL database structure:

### Income Table
- Categories: Course, Internship, Project, Digital Marketing, Others
- Fields: amount, received_by, received_on, sender details, remarks, status

### Expenses Table
- Categories: Travel, Food, Stationery, Banking, Others
- Fields: amount, spent_by, spent_on, transaction_mode, remarks, status

### Salary Table
- Payment Types: Shares, Salary, Others
- Fields: amount, payment_to_whom, spent_date, payment_through, remarks

### Accounts Details Table
- Tracks all entries with browser info, IP address, and timestamps
- Foreign key relationships to all main tables

## File Structure

```
/
├── index.html          # Dashboard/Home page
├── income.html         # Income entry form
├── expenses.html       # Expense entry form
├── salary.html         # Salary entry form
├── view.html          # Records viewing page
├── css/
│   └── styles.css     # Main stylesheet
├── js/
│   ├── api.js         # API communication layer
│   ├── income.js      # Income form handling
│   ├── expenses.js    # Expense form handling
│   └── salary.js      # Salary form handling
└── README.md          # This file
```

## Setup Instructions

1. Clone this repository
2. Set up your backend API server
3. Update the `API_BASE_URL` in `js/api.js` to point to your backend
4. Open `index.html` in a web browser or serve via a web server

## API Configuration

Update the API base URL in `js/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

## Features Overview

### Dashboard
- Real-time financial statistics
- Quick action cards for easy navigation
- Responsive grid layout

### Forms
- Client-side validation
- Auto-formatting for amounts and phone numbers
- Date pickers with sensible defaults
- Category-specific field suggestions

### Records View
- Tabbed interface for different record types
- Filtering by date range and category
- Responsive table design
- Status badges for easy identification

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
