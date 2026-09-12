<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=28&duration=3000&pause=900&color=61DAFB&center=true&vCenter=true&width=700&lines=Welcome+to+Attendance+Tracker;Track+Attendance+Without+The+Confusion;Built+For+Students%2C+By+Students" alt="Typing animation" />

<p>
  <strong>A modern student-focused attendance tracking platform.</strong>
  <br />
  Manage attendance, subjects, timetables and academic progress from one place.
</p>

<br />

<a href="https://attendance-tracker-phi-inky.vercel.app/">
  <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-61DAFB?style=for-the-badge&labelColor=111827" alt="Live Demo" />
</a>
<a href="https://github.com/Purvpatel1/attendance-tracker">
  <img src="https://img.shields.io/badge/💻%20Source%20Code-GitHub-181717?style=for-the-badge&logo=github" alt="Source Code" />
</a>

<br />
<br />

<img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Status-Live-success?style=flat-square" />

<br />
<br />

<img src="./public/screenshots/dashboard.png" alt="Attendance Tracker Dashboard" width="650" />

</div>

---

## ⚡ About the Project

**Attendance Tracker** is a clean and practical web application designed to help students manage their academic attendance without depending on spreadsheets, manual calculations or questionable memory.

It brings attendance, subjects, timetables, analytics and history into one simple dashboard.

> **Know your attendance. Plan your lectures. Stay above the required percentage.**

---

## ✨ What You Can Do

<table>
  <tr>
    <td width="50%">
      <h3>🔐 Student Authentication</h3>
      Login using Google OAuth or Email/Password authentication with protected student access.
    </td>
    <td width="50%">
      <h3>🧾 Smart Onboarding</h3>
      Complete your profile with name, roll number, branch and practical batch.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Attendance Analytics</h3>
      Track overall percentage, subject-wise attendance and required attendance targets.
    </td>
    <td width="50%">
      <h3>🗓️ Dynamic Timetable</h3>
      View daily and weekly schedules based on your branch and practical batch.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📚 Subjects Directory</h3>
      Access subject names, course codes, credits, types and faculty information.
    </td>
    <td width="50%">
      <h3>🕘 Attendance History</h3>
      Review previous attendance records with pagination and filtering.
    </td>
  </tr>
</table>

---

## 🎨 Interface Preview

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="./public/screenshots/dashboard.png" width="250" alt="Dashboard" />
      <br />
      <sub><b>Dashboard</b></sub>
    </td>
    <td align="center">
      <img src="./public/screenshots/analytics.png" width="250" alt="Analytics" />
      <br />
      <sub><b>Analytics</b></sub>
    </td>
    <td align="center">
      <img src="./public/screenshots/history.png" width="250" alt="History" />
      <br />
      <sub><b>History</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./public/screenshots/schedule.png" width="250" alt="Schedule" />
      <br />
      <sub><b>Schedule</b></sub>
    </td>
    <td align="center">
      <img src="./public/screenshots/subjects.png" width="250" alt="Subjects" />
      <br />
      <sub><b>Subjects</b></sub>
    </td>
    <td align="center">
      <img src="./public/screenshots/login.png" width="250" alt="Login" />
      <br />
      <sub><b>Login</b></sub>
    </td>
  </tr>
</table>

</div>

---

## 🧭 How It Works

<div align="center">

```text
Create Account
      ↓
Complete Student Profile
      ↓
Select Branch & Practical Batch
      ↓
View Subjects and Timetable
      ↓
Mark Daily Attendance
      ↓
Track Analytics and History
```

</div>

The selected branch and practical batch automatically determine the student's academic subjects and timetable.

---

## 🛠️ Tech Stack

<div align="center">

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | React 18.3                   |
| Build Tool       | Vite 6.1                     |
| Language         | JavaScript ES6+              |
| Styling          | CSS3                         |
| Backend Services | Supabase                     |
| Database         | PostgreSQL                   |
| Authentication   | Google OAuth, Email/Password |
| Security         | Row Level Security           |

</div>

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Purvpatel1/attendance-tracker.git
cd attendance-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure Supabase

Use the database schema located at:

```text
supabase/schema.sql
```

Apply the onboarding migration:

```text
supabase/migrations/20260913_fix_onboarding_trigger.sql
```

Also configure:

* Authentication providers
* Database tables
* Row Level Security policies

### 5. Run the project

```bash
npm run dev
```

Open the local development server:

```text
http://localhost:5173
```

---

## 🌐 Live Demo

<div align="center">

<a href="https://attendance-tracker-phi-inky.vercel.app/">

<img src="https://img.shields.io/badge/OPEN%20ATTENDANCE%20TRACKER-61DAFB?style=for-the-badge&logo=vercel&logoColor=black&labelColor=111827" alt="Open Attendance Tracker" />

</a>

</div>

---

## 🎯 Why This Project?

Students often have to deal with:

* Manual attendance calculations
* Multiple timetable documents
* Unclear subject-wise percentages
* Difficulty tracking attendance history
* Not knowing how many lectures they can miss

Attendance Tracker brings these tasks together in a single interface.

**Less confusion. More control. Better attendance planning.**

---

## 👨‍💻 Author

<div align="center">

### Purv Patel

</div>
