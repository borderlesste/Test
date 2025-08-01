# GitHub Copilot Instructions - Borderless Web Application

## Project Overview
This is a full-stack business management application built with React 18 + Vite (frontend) and Node.js/Express (backend) with MySQL database. It provides role-based dashboards for admin/client management with comprehensive CRM functionality including payments, orders, quotes, and customer management.

## Architecture & Technology Stack

### Frontend (client/)
- **Framework**: React 18 with Vite bundler
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Context API (`ApiContext`, `ThemeContext`)
- **Routing**: React Router v6 with protected routes
- **HTTP Client**: Axios with interceptors for authentication
- **UI Components**: Custom component library with reusable patterns

### Backend (server/)
- **Runtime**: Node.js with Express.js framework
- **Database**: MySQL with connection pooling
- **Authentication**: JWT tokens + express-session
- **Security**: CORS configuration, auth middleware
- **File Structure**: MVC pattern with controllers, services, routes
- **APIs**: RESTful endpoints with consistent response patterns

### Database Schema
- **Users/Clientes**: Authentication and profile management
- **Orders/Pedidos**: Order management with status tracking
- **Payments/Pagos**: Payment processing with multiple gateways
- **Quotes/Cotizaciones**: Quote generation and management
- **Notifications**: System notifications and alerts

## Development Patterns & Conventions

### Component Architecture
- **File Naming**: PascalCase for components (`AdminDashboard.jsx`)
- **Structure**: Functional components with hooks
- **Props**: Always use PropTypes validation
- **State**: Prefer useState for local state, Context for global state
- **Error Handling**: Implement error boundaries and try-catch blocks

### Component Patterns
```jsx
// Standard component structure
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Component logic here

  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.object,
  onAction: PropTypes.func
};

export default ComponentName;
```

### API Integration Patterns
- **Base URL**: Use axios instance from `api/axios.js`
- **Authentication**: JWT tokens automatically handled by interceptors
- **Error Handling**: Consistent error response structure
- **Loading States**: Always implement loading indicators
- **Data Fetching**: Use useEffect with cleanup for async operations

```jsx
// API call pattern
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/endpoint');
      setData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependency]);
```

### State Management
- **Local State**: useState for component-specific data
- **Global State**: Context API for user auth, theme, API client
- **Form State**: Controlled components with validation
- **Modal State**: Boolean flags with proper cleanup

### Styling Guidelines
- **Framework**: Tailwind CSS exclusively
- **Dark Mode**: Support both light/dark themes using `dark:` prefixes
- **Responsive**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Colors**: Use consistent color palette (violet, blue, gray scales)
- **Spacing**: Follow Tailwind spacing scale
- **Glass Morphism**: Use backdrop-blur effects for modern UI

```jsx
// Styling pattern example
<div className="
  bg-white/30 dark:bg-slate-800/30 
  backdrop-blur-xl border border-white/20 dark:border-slate-700/30
  rounded-lg shadow-lg p-6
  hover:bg-white/40 dark:hover:bg-slate-800/40
  transition-colors duration-200
">
```

### Authentication & Authorization
- **Role System**: 'admin' and 'client' roles with different dashboards
- **Protected Routes**: Use `ProtectedRoute` component wrapper
- **Session Management**: JWT + express-session for persistence
- **Remember Me**: localStorage persistence for credentials

### Dashboard Architecture
- **Admin Panel**: Sidebar navigation with content panels
- **Layout**: `DashboardLayout` wrapper component
- **Sidebar Pattern**: Collapsible sections with active state management
- **Content Switching**: Button-based navigation instead of routing for panel content

```jsx
// Sidebar pattern
const handleOptionSelect = (optionId, label, sectionTitle) => {
  setActiveOption(optionId);
  // Update content panel
};
```

### Database Integration
- **Connection**: MySQL with connection pooling
- **Queries**: Prepared statements for security
- **Error Handling**: Consistent database error responses
- **Migrations**: SQL files in `server/src/migrations/`

### API Endpoint Patterns
```javascript
// Standard controller pattern
const getEndpoint = async (req, res) => {
  try {
    const result = await Service.getData(req.params);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## Code Quality Standards

### Error Handling
- Always implement try-catch blocks for async operations
- Use error boundaries for React components
- Provide user-friendly error messages
- Log errors for debugging

### Performance
- Implement loading states for all async operations
- Use React.memo for expensive components
- Lazy load routes and components when appropriate
- Optimize images and assets

### Security
- Validate all inputs on both client and server
- Use parameterized queries for database operations
- Implement proper CORS configuration
- Sanitize user data before display

### Testing
- Write unit tests for utility functions
- Test API endpoints with proper error scenarios
- Implement integration tests for critical flows

## Specific Implementation Guidelines

### Admin Dashboard
- Uses sidebar-to-content-panel architecture
- Real database integration for all views
- Comprehensive CRUD operations
- Statistics and analytics integration

### Client Dashboard
- Simplified interface for client operations
- Payment integration (PayPal/Stripe)
- Order tracking and history
- Profile management

### Form Handling
- Controlled components with validation
- Real-time feedback
- Proper error states
- Loading indicators during submission

### Modal Management
- Centralized modal state management
- Proper cleanup on close
- Keyboard navigation support
- Accessibility considerations

## Development Workflow

### File Organization
```
client/src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── api/                # API client configuration
└── assets/             # Static assets

server/src/
├── controllers/        # Route handlers
├── services/           # Business logic
├── routes/             # API route definitions
├── middleware/         # Express middleware
├── config/             # Configuration files
└── migrations/         # Database migrations
```

### Naming Conventions
- **Components**: PascalCase (`AdminDashboard.jsx`)
- **Files**: kebab-case for utilities (`use-mobile.tsx`)
- **Variables**: camelCase (`activeOption`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes**: Tailwind utility classes

### Git Workflow
- Feature branches for new functionality
- Descriptive commit messages
- Code review before merge
- Automated testing where applicable

## Common Patterns to Follow

### Loading States
```jsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### API Error Handling
```jsx
catch (error) {
  const message = error.response?.data?.message || error.message;
  setError(message);
}
```

### Conditional Rendering
```jsx
{user?.role === 'admin' && <AdminPanel />}
{!loading && data && <DataDisplay data={data} />}
```

### Event Handlers
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await submitData();
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Integration Points
- **Payment Gateways**: PayPal and Stripe integration
- **Email Service**: SMTP configuration for notifications
- **File Uploads**: Handle file uploads for documents/images
- **Real-time Updates**: Consider WebSocket integration for live updates

This application prioritizes user experience, security, and maintainability. Always consider the business context when implementing features and maintain consistency with existing patterns.
