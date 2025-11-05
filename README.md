# PayGate Frontend

This is the frontend application for PayGate - a content monetization platform that enables creators to instantly monetize their digital content.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Components](#components)
- [Services](#services)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Registration, login, password reset with social login options
- **Paywall Creation**: Intuitive interface for creating paywalls for files and URLs
- **Content Management**: Upload and manage digital content with tagging and organization
- **Dashboard**: Analytics dashboard with revenue tracking and performance metrics
- **Customer Management**: Track customers and their purchase history
- **Marketing Tools**: Discounts, affiliate programs, and social sharing
- **Responsive Design**: Mobile-optimized interface for all device sizes
- **Real-time Updates**: Live analytics and performance data

## Technology Stack

- **Framework**: React with TypeScript
- **Routing**: React Router
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **UI Components**: Recharts for data visualization
- **Forms**: React Hook Form for form validation
- **HTTP Client**: Axios for API requests
- **Build Tool**: Create React App
- **Testing**: Jest and React Testing Library

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd paygate-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

### Frontend

Create a `.env` file in the `paygate-ui` directory based on `.env.example`:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_TOKEN_REFRESH_THRESHOLD=300000  # 5 minutes in milliseconds

# Public Endpoints (comma-separated)
# VITE_PUBLIC_ENDPOINTS=/public/endpoint1,/public/endpoint2
```

## Running the Application

### Development Mode

```bash
npm start
```

This will start the development server on `http://localhost:3000`.

### Production Mode

1. Build the application:
   ```bash
   npm run build
   ```

2. Serve the build:
   ```bash
   npm install -g serve
   serve -s build
   ```

## Project Structure

```
paygate-ui/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point
│   └── ...
├── .env.example            # Environment variables example
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
├── README.md               # This file
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Components

### Authentication
- `Login.tsx` - User login interface
- `Signup.tsx` - User registration interface
- `ForgotPassword.tsx` - Password reset request
- `ResetPassword.tsx` - Password reset form

### Dashboard
- `Dashboard.tsx` - Main dashboard with analytics
- `StatsCard.tsx` - Statistics cards for key metrics
- `BarChart.tsx` - Bar chart component for data visualization
- `RevenueChart.tsx` - Revenue trend visualization

### Paywalls
- `PaywallCreator.tsx` - Interface for creating new paywalls
- `PaywallDetails.tsx` - Detailed view of a single paywall
- `PaywallList.tsx` - List of all paywalls
- `PaywallPreview.tsx` - Preview of paywall appearance
- `Paywalls.tsx` - Main paywall management page

### Content
- `ContentLibrary.tsx` - Content management interface
- `FileUpload.tsx` - File upload component
- `BatchUpload.tsx` - Batch file upload component
- `ContentPage.tsx` - Main content management page

### Customers
- `CustomerList.tsx` - List of customers
- `CustomerDetails.tsx` - Detailed customer view
- `CustomersPage.tsx` - Main customer management page
- `PurchaseHistory.tsx` - Customer purchase history

### Payments
- `CheckoutPage.tsx` - Payment checkout interface
- `PaymentConfirmation.tsx` - Payment confirmation page
- `PaymentHistory.tsx` - Payment history for customers
- `PaymentSuccess.tsx` - Payment success page

### Marketing
- `MarketingHub.tsx` - Marketing tools hub
- `DiscountManager.tsx` - Discount code management
- `AffiliateManager.tsx` - Affiliate program management
- `SocialShare.tsx` - Social sharing tools

### Analytics
- `Analytics.tsx` - Analytics dashboard
- `RevenueReport.tsx` - Revenue reporting
- `CustomerAnalytics.tsx` - Customer analytics
- `PerformanceMetrics.tsx` - Performance metrics

### Settings
- `Settings.tsx` - User settings page
- `ProfileSettings.tsx` - Profile management
- `PaymentSettings.tsx` - Payment configuration
- `NotificationSettings.tsx` - Notification preferences

### UI Components
- `Header.tsx` - Page header component
- `Navigation.tsx` - Navigation bar
- `Footer.tsx` - Footer component
- `LoadingSpinner.tsx` - Loading indicator
- `ErrorMessage.tsx` - Error message display
- `SuccessMessage.tsx` - Success message display

## Services

### API Services
- `authService.ts` - Authentication API calls
- `paywallService.ts` - Paywall management API calls
- `contentService.ts` - Content management API calls
- `paymentService.ts` - Payment processing API calls
- `analyticsService.ts` - Analytics data API calls
- `customerService.ts` - Customer management API calls
- `marketingService.ts` - Marketing tools API calls

### Utility Services
- `api.ts` - Base API configuration and interceptors
- `auth.utils.ts` - Authentication utility functions
- `format.utils.ts` - Data formatting utilities
- `validation.utils.ts` - Form validation utilities

## Routing

The application uses React Router for navigation with the following routes:

```
/                       - Dashboard
/login                  - Login page
/signup                 - Signup page
/forgot-password        - Forgot password page
/reset-password/:token  - Reset password page
/paywalls               - Paywall management
/create-paywall         - Create new paywall
/paywall/:id            - Paywall details
/content                - Content library
/customers              - Customer management
/analytics              - Analytics dashboard
/marketing              - Marketing tools
/settings               - User settings
/checkout               - Payment checkout
/p/:id                  - Public paywall view
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.