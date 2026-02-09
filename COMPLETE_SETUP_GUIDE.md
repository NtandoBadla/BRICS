# 🚀 BIFA Platform - Complete Setup & Testing Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [MVP Features Overview](#mvp-features-overview)
4. [Language Toggle Usage](#language-toggle-usage)
5. [Testing All Features](#testing-all-features)
6. [User Roles & Access](#user-roles--access)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** v18 or higher
- **MySQL** database (or PostgreSQL)
- **npm** or **yarn** package manager

---

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
# Copy .env.example to .env and configure:
# - DATABASE_URL
# - JWT_SECRET
# - DIRECT_URL (optional)

# Run database migrations
npx prisma migrate dev

# Start backend server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

---

## MVP Features Overview

### ✅ All 10 MVP Features Implemented

#### 1. 🌐 Public Website with CMS Functionality
- **Access:** `http://localhost:3000`
- **Features:**
  - Homepage with hero section
  - Upcoming matches display
  - Competitions showcase
  - News articles
  - Multi-language support (EN/FR)
  - Responsive design

**Admin CMS Access:** `http://localhost:3000/admin/cms`
- Create/edit news articles
- Manage pages
- Content versioning

#### 2. 📚 Governance Portal
- **Access:** `http://localhost:3000/admin/governance`
- **Features:**
  - Document management
  - Policy uploads
  - Version control
  - Access permissions
  - Document categories

#### 3. 📋 Secretariat Workflows
- **Access:** `http://localhost:3000/secretariat`
- **Features:**
  - Task assignment
  - Workflow tracking
  - Status monitoring
  - Document processing
  - Team collaboration

#### 4. 👨‍⚖️ Referee Registry
- **Access:** `http://localhost:3000/referee`
- **Features:**
  - Secure login system
  - Referee profiles
  - Certification tracking
  - Match assignments
  - Performance reviews

#### 5. ⚠️ Disciplinary Reporting Flow
- **Access:** `http://localhost:3000/admin/disciplinary`
- **Referee Reports:** `http://localhost:3000/referee/reports`
- **Features:**
  - Incident reporting
  - Case management
  - Evidence upload
  - Decision tracking
  - Appeal process

#### 6. 🏆 League/Competition Management
- **Access:** `http://localhost:3000/competitions`
- **Leagues:** `http://localhost:3000/leagues`
- **Features:**
  - Create competitions
  - Manage leagues
  - Season setup
  - Team registration
  - Fixture generation

#### 7. ⚽ Match Management
- **Access:** `http://localhost:3000/matches`
- **Admin:** `http://localhost:3000/admin/matches`
- **Features:**
  - Schedule matches
  - Assign venues
  - Record results
  - Live updates
  - Match reports

#### 8. 👤 Athlete Management System
- **Access:** `http://localhost:3000/player`
- **Features:**
  - Player registration
  - Profile management
  - Transfer system
  - Medical records
  - Contract tracking

#### 9. 🇧🇷 Federation Team Module
- **Access:** `http://localhost:3000/federation`
- **Features:**
  - National squad management
  - Player selection
  - Training camps
  - International matches
  - Call-ups system

#### 10. 📊 Player/Team Stats Engine
- **Integrated across:**
  - Match pages
  - Team pages
  - Player profiles
- **Features:**
  - Real-time statistics
  - Performance metrics
  - Historical data
  - Comparative analysis
  - Export functionality

---

## 🌐 Language Toggle Usage

### How to Use Language Toggle

1. **Visit Homepage:** `http://localhost:3000`
2. **Locate Toggle:** Look for the 🌐 globe icon in the top-right header
3. **Select Language:**
   - Click the globe icon
   - Choose from dropdown:
     - 🇬🇧 English
     - 🇫🇷 Français
4. **Instant Translation:** Page content updates immediately
5. **Persistent:** Your language preference is saved automatically

### Translated Elements

- ✅ Navigation menu
- ✅ Hero section
- ✅ Buttons and CTAs
- ✅ Authentication pages
- ✅ Dashboard elements
- ✅ Common UI components

### Adding More Languages

To add additional languages:

1. Create new translation file: `frontend/src/i18n/locales/[lang].json`
2. Add language to `frontend/src/components/LanguageToggle.tsx`
3. Update `frontend/src/i18n/index.ts` resources

---

## 🧪 Testing All Features

### Automated Test Script

Run the comprehensive test script:

```bash
# Make sure backend is running on port 5000
cd backend
npm run dev

# In another terminal, run the test script
node test-mvp-features.js
```

This will test:
- ✅ Backend health
- ✅ Public endpoints
- ✅ Authentication
- ✅ Protected routes
- ✅ All MVP features

### Manual Testing

#### Test Public Features (No Login Required)

1. **Homepage:**
   ```
   http://localhost:3000
   ```
   - View upcoming matches
   - See competitions
   - Test language toggle

2. **News:**
   ```
   http://localhost:3000/news
   ```

3. **Teams:**
   ```
   http://localhost:3000/teams
   ```

4. **Matches:**
   ```
   http://localhost:3000/matches
   ```

#### Test Protected Features (Login Required)

Use these test credentials:

**Admin:**
- Email: `admin@bifa.com`
- Password: `admin123`
- Access: Full system access

**Referee:**
- Email: `referee@bifa.com`
- Password: `referee123`
- Access: Match officiating, reports

**Team Manager:**
- Email: `manager@bifa.com`
- Password: `manager123`
- Access: Team and player management

**Federation Official:**
- Email: `federation@bifa.com`
- Password: `federation123`
- Access: Governance, national teams

**Agent:**
- Email: `agent@bifa.com`
- Password: `agent123`
- Access: Player representation

**Player:**
- Email: `player@bifa.com`
- Password: `player123`
- Access: Personal profile, stats

**Coach:**
- Email: `coach@bifa.com`
- Password: `coach123`
- Access: Team training, tactics

---

## 👥 User Roles & Access

| Role | Dashboard | Key Features |
|------|-----------|--------------|
| **Admin** | `/admin` | Full system access, CMS, user management |
| **Secretariat** | `/secretariat` | Workflows, task management |
| **Referee** | `/referee` | Match officiating, reports |
| **Team Manager** | `/team-manager` | Team and player management |
| **Federation Official** | `/federation` | Governance, national teams |
| **Agent** | `/agent` | Player representation |
| **Player** | `/player` | Personal profile, statistics |
| **Coach** | `/coach` | Team training, tactics |

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Failed:**
```bash
# Check DATABASE_URL in backend/.env
# Run migrations
cd backend
npx prisma migrate dev
```

**Port Already in Use:**
```bash
# Change PORT in backend/.env
PORT=5001
```

### Frontend Issues

**Module Not Found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**i18n Not Working:**
```bash
# Clear browser cache and localStorage
# Restart frontend server
npm run dev
```

### Language Toggle Not Appearing

1. Check `frontend/src/App.tsx` imports `LanguageToggle`
2. Verify `frontend/src/i18n/index.ts` is initialized
3. Clear browser cache
4. Check browser console for errors

---

## 📱 Responsive Design

All features work on:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

---

## 🎯 Feature Checklist

- ✅ Public Website with CMS
- ✅ Governance Portal
- ✅ Secretariat Workflows
- ✅ Referee Registry
- ✅ Disciplinary Reporting
- ✅ League/Competition Management
- ✅ Match Management
- ✅ Athlete Management
- ✅ Federation Team Module
- ✅ Stats Engine
- ✅ Multi-Language Support
- ✅ Language Toggle on Homepage
- ✅ Role-Based Access Control
- ✅ Responsive Design
- ✅ Secure Authentication

---

## 🎉 Success!

All MVP features are implemented and functional. The platform is ready for:
- Development testing
- User acceptance testing
- Production deployment

For deployment instructions, see `DEPLOYMENT.md`

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review `MVP_FEATURES_STATUS.md`
3. Check backend logs
4. Check browser console

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ All MVP Features Complete
