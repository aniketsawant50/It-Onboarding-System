# IT Onboarding System - Frontend

A modern React SPA frontend for the IT Onboarding System with role-based dashboards and responsive UI.

## Technology Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.18
- **Routing**: React Router 6.30.0
- **HTTP Client**: Axios 1.8.4
- **Styling**: CSS Modules & Global CSS
- **Node Version**: 18+ recommended

## Project Structure

```
frontend/
├── src/
│   ├── api/                 # API client & endpoints
│   ├── components/          # Reusable React components
│   │   ├── Layout/          # Layout components (Navbar, Sidebar)
│   │   └── UI/              # Basic UI components (Button, Input, Card, Table)
│   ├── pages/               # Page/view components
│   │   ├── Admin/           # Admin dashboard & pages
│   │   ├── Auth/            # Login, registration, password reset
│   │   ├── Employee/        # Employee pages
│   │   ├── HR/              # HR management pages
│   │   └── Manager/         # Manager pages
│   ├── layouts/             # Layout wrapper components
│   ├── routes/              # Route protection & definitions
│   ├── context/             # React Context API (state management)
│   ├── hooks/               # Custom React hooks
│   ├── constants/           # App constants & enums
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles
│   ├── assets/              # Images, icons, fonts
│   ├── App.jsx              # Root app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── .env.example             # Environment variables template
├── .gitignore
└── README.md
```

## Setup & Running

### Prerequisites
- Node 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file from template
cp .env.example .env
```

### Environment Configuration

Create `.env` file in frontend root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=IT Onboarding System
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Folder Descriptions

| Folder | Purpose |
|--------|---------|
| `/api` | API client configuration and endpoint definitions |
| `/components` | Reusable React components (UI, Layout) |
| `/pages` | Full-page components organized by role |
| `/layouts` | Layout wrapper components |
| `/routes` | Route definitions and protection logic |
| `/context` | Global state management (Auth, User, etc.) |
| `/hooks` | Custom React hooks for common logic |
| `/constants` | Application constants, role enums, API endpoints |
| `/utils` | Helper functions (formatters, validators, etc.) |
| `/styles` | Global CSS and theme definitions |
| `/assets` | Static files (images, icons, fonts) |

## Key Features

- 🔐 Role-based dashboards (Admin, HR, Manager, Employee)
- 🎨 Responsive UI with CSS Modules
- 🔄 API integration with Axios
- 🛡️ Protected routes with authentication
- 📱 Mobile-friendly design
- ⚡ Fast development with Vite

## Authentication Flow

1. User logs in via `/pages/Auth/Login.jsx`
2. Credentials sent to backend `/api/auth/login`
3. JWT token stored in context (`/context/AuthContext.jsx`)
4. Protected routes check auth status
5. Token sent with requests via axios interceptor

## API Integration

Api client is configured in `/src/api/`:

```javascript
import api from './api';

// Uses authenticated requests with JWT token
api.get('/users').then(response => {
  // Handle response
});
```

## Styling

- Global styles: `/src/styles/`
- Component styles: CSS Modules (`.module.css`)
- Theme configuration in global CSS

## Testing

```bash
# Run tests (configure in package.json)
npm test
```

## Building for Production

```bash
npm run build
```

Output will be in `dist/` folder, ready to deploy to:
- Vercel
- Netlify  
- Docker
- Any static file server (nginx, Apache)

## Development Notes

- **State Management**: Currently using React Context API. Consider Redux for larger apps.
- **Styling**: CSS Modules used for component scoping. Consider Tailwind for faster development.
- **Testing**: Add Jest + React Testing Library for unit/integration tests.
- **Linting**: Configure ESLint for code quality.

## Deployment

For deployment instructions, see project root README.
npm run build
```

Output is in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── Layout/    # Navigation and layout components
│   └── UI/        # Reusable UI components (Button, Card, Input, Table)
├── pages/
│   ├── Auth/      # Login and password reset pages
│   ├── Admin/     # Admin dashboard and management pages
│   ├── HR/        # HR operations pages
│   ├── Manager/   # Manager dashboard and task pages
│   └── Employee/  # Employee profile and task pages
├── context/       # Authentication context
├── services/      # API integration
├── styles/        # Global CSS variables
└── routes/        # Route protection and configuration
```

## Login

Navigate to `http://localhost:5173/login` to access the login page. Enter your credentials registered in the backend system.

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_BASE_URL=http://localhost:8084/api
```

## Technologies

- React 18
- Vite 5.4
- React Router 6
- Modern CSS with CSS Modules

## Notes

- The frontend communicates with the backend API on `http://localhost:8084`
- JWT tokens are stored in localStorage and included in all API requests
- Sessions expire according to backend JWT configuration
