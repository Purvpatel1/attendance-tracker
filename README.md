# attendance-tracker

> A student-focused attendance tracking web application for managing attendance, academic information, timetables and attendance analytics.

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Custom_Tokens-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## Project Links

- **Live Demo**: Not deployed yet
- **GitHub Repository**: [https://github.com/Purvpatel1/attendance-tracker](https://github.com/Purvpatel1/attendance-tracker)

---

## Overview

**attendance-tracker** is a student-focused web application designed for college students to track, record, and analyze their lecture and laboratory attendance.

Students authenticate via Google OAuth or Email/Password credentials powered by Supabase Auth. New users undergo mandatory profile setup to explicitly specify their full name, roll number, academic branch, and batch (no default values are assigned). Authenticated students with complete profiles gain direct access to their dashboard, timetables, and analytics.

---

## Main Features

- **Authentication**: Support for Google OAuth and Email/Password authentication with session persistence.
- **Mandatory Profile Setup**: Enforces full name, roll number, branch, and batch selection before granting dashboard access.
- **Dynamic Branch & Batch Selection**: Automatically maps available batches based on the selected academic branch.
- **Student Dashboard**: Overview of overall attendance percentage, subject cards, and quick daily marking.
- **Attendance Analytics**: Subject breakdown, minimum percentage thresholds, and target calculations.
- **Attendance History**: Paginated log of historical attendance records with date, subject, and status filters.
- **Subjects Directory**: Detailed curriculum list showing course codes, credit types, and faculty information.
- **Timetable View**: Daily and weekly schedule views filtered by the student's branch and batch.
- **Theme & Responsive UI**: Built-in light/dark theme support with a responsive layout across desktop and mobile browsers.

---

## User Flow

### New User
1. Sign in with Google OAuth or Email/Password.
2. Redirected to mandatory **Complete Profile** page.
3. Enter roll number and select branch and batch. (Branch and batch are never automatically assigned).
4. Save profile and access the Dashboard.

### Existing User
1. Sign in with Google OAuth or Email/Password.
2. Saved profile details load automatically.
3. Bypass onboarding and proceed directly to the Dashboard.

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| **React** | Frontend UI library |
| **Vite** | Development server and build tool |
| **JavaScript** | Application logic |
| **CSS3 / Custom CSS** | Design system tokens and styling |
| **Supabase** | Backend services and authentication |
| **PostgreSQL** | Database storage |
| **Google OAuth** | Identity provider authentication |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Purvpatel1/attendance-tracker.git

# Navigate to project directory
cd attendance-tracker

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Security Warning**: Never expose your Supabase `service_role` key in frontend code or commit `.env` files to source control. Only use the public `anon` key in client applications.

---

## Supabase Setup

1. **Create Supabase Project**: Set up a project at [supabase.com](https://supabase.com).
2. **Authentication**: Enable Google OAuth and Email providers in Supabase Auth settings.
3. **Database Schema**: Execute [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
4. **Onboarding Trigger Migration**: Apply [`supabase/migrations/20260913_fix_onboarding_trigger.sql`](supabase/migrations/20260913_fix_onboarding_trigger.sql) so `public.handle_new_user()` does not auto-assign default branch or batch values.
5. **Row Level Security**: Ensure RLS policies are enabled for `public.profiles`, `public.attendance_logs`, and `public.extra_lectures`.

---

## Security

- **Authentication**: Token-based session management with Supabase Auth & Google OAuth.
- **Environment Protection**: Secrets kept out of repository source code.
- **Row Level Security (RLS)**: Database policies restrict data access per authenticated student (`auth.uid() = id` for profiles; `auth.uid() = student_id` for attendance logs).

---

## Author

**Purv Patel**  
Information Technology  
SVKM’s Shri Bhagubhai Mafatlal Polytechnic and College of Engineering  
