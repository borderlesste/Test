# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack business management system for **BODERLESS TECHNO COMPANY** built with React.js frontend and Node.js/Express backend, using MySQL database.

**Architecture:** Traditional client-server monorepo with separate `client/` and `server/` directories.

## Common Commands

### Development Workflow
```bash
# Database setup (first time)
cd server/
npm run db:setup

# Start backend (port 4000)
cd server/
npm run dev

# Start frontend (port 5173)  
cd client/
npm run dev

# Linting
cd client/
npm run lint
```

### Database Operations
```bash
cd server/
npm run db:init      # Initialize database
npm run db:setup     # Setup database with sample data
npm run db:test      # Test database connection
npm run db:reset     # Reset database
```

### Testing
```bash
# Playwright automated tests
node quick-start.js           # Quick development testing
node ui-analysis.js           # UX/UI analysis
node test-specific.js         # Specific functionality tests
node playwright-init.js       # Complete initialization tests
```

## Architecture & Key Technologies

### Frontend (client/)
- **React 18.2.0** with **Vite 7.0.3** build system
- **Tailwind CSS 3.4.3** with custom design system
- **Radix UI** components in `/components/ui/`
- **React Context** for state management (ApiContext, ThemeContext)
- **Axios** for API communication
- Path alias: `@/` → `src/`

### Backend (server/)
- **Express.js 4.18.2** with MySQL database
- **JWT authentication** with bcrypt password hashing
- **Payment integration:** Stripe 18.3.0 + PayPal Server SDK
- **Email system:** Nodemailer 7.0.5
- **Validation:** express-validator

### Database Schema
18+ tables supporting:
- Multi-role authentication (admin/client)
- Complete order lifecycle (quotes → orders → payments → invoices)
- Communication system (notifications, messages, email campaigns)
- Audit logging and file management

## Application Structure

### Core Modules
- **Public Website:** Home, services, portfolio, contact with lead generation
- **Client Portal:** Protected dashboard, order tracking, payments, profile management
- **Admin Dashboard:** 15+ pages for business management including analytics, client management, financial reports, and communication tools

### Key Directories
```
client/src/
├── components/ui/     # Reusable UI component library
├── pages/            # Route-specific components
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── api/              # API communication layer

server/src/
├── controllers/      # Business logic
├── routes/           # API endpoints  
├── services/         # Service layer
├── middleware/       # Custom middleware
├── config/           # Database configuration
├── migrations/       # Database schema
```

## Development Notes

### Authentication System
- Admin: admin@borderlesstechno.com / password
- Client: juan@example.com / password

### API Proxy Configuration
Frontend proxies `/api` requests to backend (port 4000) via Vite config.

### Styling System
Custom Tailwind theme with:
- Color palette: primary, secondary, accent, ghost variants  
- Typography: Montserrat (headings) + Inter (body)
- Animations: fadeIn, slideIn, bounce, pulse, shimmer

### Database Connection
Server uses MySQL2 driver with connection pooling. Environment variables in `.env` file control database credentials.

## Testing & Quality Assurance

The project includes comprehensive Playwright test scripts for automated UI/UX testing and functionality validation. Forms include validation with error handling and accessibility improvements (aria-labels, required field indicators).