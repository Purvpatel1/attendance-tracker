# attendance-tracker

> A student-focused attendance tracking web application for managing attendance, academic information, timetables and attendance analytics.

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Custom_Tokens-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

### Project Links & Media

- **Live Demo**: `[Add Live Demo Link Here]`
- **GitHub Repository**: `[Add GitHub Repository Link Here]`
- **Screenshots**: See [Screenshots Section](#screenshots)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Flow](#user-flow)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Security](#security)
- [Testing Status](#testing-status)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

---

## Overview

**attendance-tracker** is a web application designed specifically for college students to track, record, and analyze their lecture and laboratory attendance.

### Key Capabilities:
- **Authentication**: Students authenticate using Google OAuth or Email/Password credentials powered by Supabase Auth.
- **Onboarding Flow**: New users undergo mandatory profile setup to explicitly specify their full name, roll number, academic branch, and batch. No default branch or batch is assigned automatically.
- **Dashboard & Analytics**: Existing users with completed profiles are routed directly to their personalized dashboard, displaying subject-wise attendance percentages, timetables, and historical logs.

---

## Features

- **Google OAuth & Email Authentication**: User sign-in, account registration, password reset, and session persistence.
- **Mandatory Profile Completion**: Enforces entry of Full Name, Roll Number, Branch, and Batch prior to dashboard entry.
- **Full Name Management**: Profile storage for student identification.
- **Roll Number Management**: College student ID assignment and editing.
- **Branch Selection**: Support for academic branches (e.g., Computer Engineering, Information Technology).
- **Batch Selection**: Dynamic batch dropdown mapping based on the selected branch (e.g., CE1, CE2, IT1, IT2).
- **Student Dashboard**: Overview of overall attendance percentage, subject cards, and daily attendance marking.
- **Attendance Analytics**: Detailed subject breakdown, threshold warnings, and target calculation.
- **Attendance History**: Paginated log of historical attendance records with date, subject, and status filters.
- **Subjects Directory**: View curriculum subjects, course codes, credit types, and faculty information.
- **Timetable View**: Daily and weekly schedule view filtered by student branch and batch.
- **Responsive User Interface**: Adaptive layout for desktop, tablet, and mobile browsers with light/dark theme support.
- **Supabase Backend Integration**: Database queries and Row Level Security (RLS) policies.

---

## User Flow

### New User Flow
1. User signs in via Google OAuth or registers with Email/Password.
2. App retrieves the authenticated user session.
3. System checks whether a profile exists in `public.profiles` with required details.
4. If details are missing, the user is redirected to the mandatory **Complete Profile** page.
5. User enters Roll Number and selects Branch and Batch. (Branch and batch are **never** assigned automatically).
6. Profile is saved, and the user gains access to the Dashboard.

### Existing User Flow
1. User signs in via Google OAuth or Email.
2. System loads the saved profile from `public.profiles`.
3. Profile completeness check succeeds.
4. User bypasses onboarding and is redirected directly to the Dashboard.

---

## Screenshots

```text
Add login screenshot here
Add complete profile screenshot here
Add dashboard screenshot here
Add attendance analytics screenshot here
Add timetable screenshot here
```

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| **React** | Frontend UI framework |
| **Vite** | Development server and bundler |
| **JavaScript** | Core application logic (ES6+) |
| **CSS3 / Custom CSS** | Design system tokens and styling |
| **Supabase** | Authentication and backend APIs |
| **PostgreSQL** | Relational database storage |
| **Google OAuth** | Identity provider authentication |

---

## Project Structure

```text
attendance-tracker/
├── public/
├── src/
│   ├── components/
│   │   ├── attendance/        # Analytics and subject progress views
│   │   ├── auth/              # Login, signup, and Google OAuth UI
│   │   ├── common/            # Buttons, cards, modals, theme toggles
│   │   ├── dashboard/         # Main student dashboard view
│   │   ├── debug/             # Debug tools and state inspection
│   │   ├── history/           # Paginated attendance history and edit modals
│   │   ├── layout/            # App header, sidebar, mobile navigation
│   │   ├── profile/           # Profile setup and mandatory onboarding page
│   │   ├── subjects/          # Course directory view
│   │   └── timetable/         # Daily schedule and timetable views
│   ├── context/
│   │   ├── AuthContext.jsx    # Supabase Auth provider & profile manager
│   │   └── ThemeContext.jsx   # Light/dark mode provider
│   ├── data/                  # Timetable and subject definitions
│   ├── lib/
│   │   └── supabaseClient.js  # Supabase JS SDK client instance
│   ├── services/
│   │   └── attendanceService.js # Database query services & pagination
│   ├── utils/
│   │   └── profileUtils.js    # Profile completeness validation helpers
│   ├── App.jsx                # Main application route protection
│   ├── index.css              # Design tokens and custom CSS system
│   └── main.jsx               # React DOM entry point
├── supabase/
│   ├── migrations/            # Database migration SQL files
│   │   └── 20260913_fix_onboarding_trigger.sql
│   ├── extra_lectures_migration.sql
│   ├── hour_by_hour_migration.sql
│   ├── phase3_migration.sql
│   ├── schema.sql             # Full database schema and RLS policies
│   └── seed.sql               # Seed data for timetables and subjects
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/attendance-tracker.git
cd attendance-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory (see [Environment Variables](#environment-variables)).

### 4. Run the development server
```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Security Note**:
> - Never commit `.env` or secret keys to Git repositories.
> - Do not include the Supabase `service_role` key in frontend code.
> - Use only the public `anon` key (`VITE_SUPABASE_ANON_KEY`) in client applications.

---

## Supabase Setup

To set up the backend database for **attendance-tracker**:

1. **Create a Supabase Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2. **Configure Authentication Providers**:
   - In Supabase Dashboard -> Auth -> Providers -> Google, enable Google Sign-In with your Google Cloud OAuth credentials.
   - Configure Email provider settings if using Email/Password authentication.
   - Add site URL and redirect URLs (e.g., `http://localhost:3000`).
3. **Run Schema SQL**:
   - Open the SQL Editor in Supabase.
   - Execute the SQL statements from [`supabase/schema.sql`](file:///c:/documents/projects/Attendance%20Tracker%20V2/supabase/schema.sql).
4. **Apply Onboarding Trigger Migration**:
   - Run the migration script [`supabase/migrations/20260913_fix_onboarding_trigger.sql`](file:///c:/documents/projects/Attendance%20Tracker%20V2/supabase/migrations/20260913_fix_onboarding_trigger.sql) in the SQL Editor so `public.handle_new_user()` does not auto-assign default branch or batch values.
5. **Configure Row Level Security (RLS)**:
   - Ensure RLS policies in `schema.sql` are active on `public.profiles`, `public.attendance_logs`, and `public.extra_lectures`.

---

## Security

- **Google OAuth & Supabase Auth**: Secure token-based session handling.
- **Protected Environment Variables**: Secret keys remain outside of client bundles.
- **Supabase Row Level Security (RLS)**:
  - `public.profiles`: Restricted to `auth.uid() = id` for `SELECT`, `INSERT`, and `UPDATE`.
  - `public.attendance_logs` & `public.extra_lectures`: Restricted to `auth.uid() = student_id` for user operations.
  - `public.subjects` & `public.timetable_slots`: Read-only access for authenticated users (`TO authenticated USING (true)`).
- **Client-Side Security**: Service-role keys are excluded from the codebase.
- **Redirect URL Validation**: Strict authentication URL matching.

---

## Testing Status

- [x] Google OAuth login integration
- [x] Email authentication & password recovery
- [x] New-user onboarding flow
- [x] Mandatory profile completion
- [x] Existing-user dashboard bypass
- [x] Attendance dashboard
- [x] Timetable view
- [x] Attendance analytics
- [ ] Row Level Security (RLS) policy verification
- [ ] Mobile responsive UI testing
- [ ] Production deployment

---

## Future Improvements

- [ ] Automated attendance threshold alerts
- [ ] Push notifications for upcoming lectures
- [ ] Progressive Web App (PWA) offline support
- [ ] PDF and CSV attendance export options
- [ ] Faculty & administrator portal

---

## Author

**Purv Patel**  
Information Technology  
SVKM’s Shri Bhagubhai Mafatlal Polytechnic and College of Engineering  

---

## License

This project is currently intended for educational and college-use purposes.
