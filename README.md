# AI Forge Hub

A comprehensive platform for AI training, knowledge sharing, tools walkthroughs, and community access. Built with modern web technologies and following Test-Driven Development (TDD) principles.

## 🎯 Purpose

AI Forge Hub is a **landing page / marketing funnel with Admin CMS** that:

- Showcases AI trainings, tools, products, and knowledge articles
- Routes users to external platforms (YouTube, LinkedIn, Skool, etc.)
- Provides an admin panel for content management
- Uses Role-Based Access Control (RBAC) for admin access

## 🚀 Features

### Public Pages (No Auth Required)
- **Home** - Hero section, featured content, CTAs
- **Training** - List of trainings with filters and external links
- **Knowledge Hub** - Articles/blog posts with search
- **Tools** - Tool walkthroughs with external links
- **Products** - SaaS product showcase
- **Community** - Links to Skool, Slack, Discord
- **Internships** - Information page with CTA
- **Enterprise** - B2B page with contact form
- **Contact** - Contact form and newsletter signup

### Admin Panel (Auth + RBAC Required)
- **Content Management** - Full CRUD for:
  - Trainings (with external links)
  - Knowledge articles
  - Tools (with external links)
  - Products (with external links)
  - Community links
- **Image Upload** - Upload and manage images
- **User Management** - RBAC with ADMIN and SUPER_ADMIN roles

## 🛠 Tech Stack

### Backend
- **Node.js 18+** with **TypeScript**
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **JWT** - Authentication with refresh tokens
- **Jest** - Testing framework
- **Winston** - Structured logging
- **Resend** - Email service
- **Multer** - File uploads

### Frontend
- **React 18** with **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router DOM** - Routing
- **React Query** - Data fetching
- **Vitest** - Testing framework

### Database
- **PostgreSQL** - Primary database
- **Prisma Migrations** - Database versioning

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vapmail16/contextfirstai.git
cd contextfirstai
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (see backend/.env.example)
cp .env.example .env

# Update DATABASE_URL in .env
# DATABASE_URL=postgresql://user@localhost:5432/contextfirstai_db

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:8080`

## 📁 Project Structure

```
contextfirstai/
├── backend/              # Backend API
│   ├── src/             # Source code
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/ # Express middleware
│   │   └── config/     # Configuration
│   ├── prisma/         # Database schema & migrations
│   ├── Dockerfile      # Production Docker image
│   └── package.json
├── frontend/            # Frontend React app
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/  # Reusable components
│   │   ├── contexts/   # React contexts
│   │   └── services/   # API services
│   └── package.json
└── docs/                # Documentation
    ├── DEPLOYMENT.md
    ├── DEPLOYMENT_ISSUE_LOG.md
    └── ISSUE_LOG.md
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
cd backend
npm test -- integration
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
cd backend
./test-docker-build.sh
```

### Deploy to DCDeploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Step-by-step deployment instructions
- [Backend Deployment Checklist](docs/BACKEND_DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [Deployment Issue Log](docs/DEPLOYMENT_ISSUE_LOG.md) - All deployment issues and solutions
- [Issue Log](docs/ISSUE_LOG.md) - Development issues and learnings
- [Testing Strategy](docs/TESTING_STRATEGY.md) - Testing approach and best practices
- [Integration Testing Guide](docs/INTEGRATION_TESTING_GUIDE.md) - E2E testing guide

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user@localhost:5432/contextfirstai_db

# Server
PORT=3001
NODE_ENV=development

# JWT (must be 32+ characters)
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters-long

# Frontend
FRONTEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

## 🎯 Development Approach

This project follows **Test-Driven Development (TDD)**:

1. **RED** - Write failing test
2. **GREEN** - Write minimal code to pass
3. **REFACTOR** - Improve while keeping tests green

All features are built using this approach to ensure quality and maintainability.

## 🚢 Deployment Status

- ✅ Database migrations applied
- ✅ Backend Dockerfile ready
- ✅ CORS configuration updated
- ✅ All known deployment issues addressed
- ✅ Ready for DCDeploy deployment

See [docs/BACKEND_DEPLOYMENT_READY.md](docs/BACKEND_DEPLOYMENT_READY.md) for details.

## 📝 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/content/trainings` - List trainings
- `GET /api/content/tools` - List tools
- `GET /api/content/products` - List products
- `GET /api/content/knowledge` - List knowledge articles
- `GET /api/content/community` - List community links
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Admin Endpoints (Require Authentication)
- `GET /api/admin/trainings` - List all trainings
- `POST /api/admin/trainings` - Create training
- `PUT /api/admin/trainings/:id` - Update training
- `DELETE /api/admin/trainings/:id` - Delete training
- Similar endpoints for tools, products, knowledge articles, community links
- `POST /api/upload/image` - Upload image (Admin only)

## 🤝 Contributing

1. Follow TDD approach for all new features
2. Write tests first (RED phase)
3. Implement minimal code (GREEN phase)
4. Refactor while keeping tests green
5. Update documentation as needed

## 📄 License

MIT

## 👥 Authors

- Development Team

## 🔗 Links

- **GitHub Repository**: https://github.com/vapmail16/contextfirstai.git
- **Documentation**: See `docs/` folder

---

**Last Updated**: December 19, 2025

