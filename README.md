# 🌍 Carbon Footprint Awareness Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faaryan1847%2Fcarbon-footprint-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Vercel-black?logo=vercel)](https://vercel.com)
[![Web Tech](https://img.shields.io/badge/Project-Web%20Technology-blue)](https://github.com/aaryan1847/carbon-footprint-platform)

An interactive, responsive web application designed to measure individual carbon emissions, calculate your **Eco Score**, visualize emission breakdowns with dynamic charts, and provide actionable tips alongside downloadable PDF reports.

---

## 🌟 Key Features

- 🔐 **Authentication System (Client-Side Storage)**:
  - Form validation with strict regex patterns for emails and 10-digit phone numbers.
  - SHA-256 hashed password storage using browser Web Cryptography API.
  - Instant **⚡ Quick Demo Login** button for fast evaluation and testing.
  - Per-user session isolation and history persistence.

- 🧮 **Accurate Carbon Footprint Calculator**:
  - Calculates annual carbon footprints ($kg\text{ CO}_2/\text{year}$) across 5 key pillars:
    - **Electricity**: Grid factor $0.82\text{ kg CO}_2/\text{kWh}$
    - **Ground Travel**: Petrol/Diesel factor $0.21\text{ kg CO}_2/\text{km}$
    - **Air Travel**: Aviation factor $0.15\text{ kg CO}_2/\text{km}$
    - **LPG Cooking**: $42\text{ kg CO}_2$ per 14.2 kg cylinder
    - **Dietary Footprint**: Categorized by Vegetarian, Mixed, or Heavy Meat diets
  - Real-time **Eco Score (0-100)**, **Carbon Level** badge (Low, Medium, High), and **Trees Needed to Offset** calculation.

- 📊 **Dynamic Data Visualizations (Chart.js)**:
  - Interactive Doughnut chart showcasing category distribution.
  - Comparative Bar chart benchmarking your footprint against India's average ($2{,}000\text{ kg}$), World average ($4{,}700\text{ kg}$), and the Paris Agreement $1.5^\circ\text{C}$ climate goal ($2{,}300\text{ kg}$).

- 📄 **Instant PDF Report Export (jsPDF)**:
  - Generates downloadable, styled multi-page PDF reports containing personal activity summaries, scores, recommendations, and rendered canvas charts.

- 🧠 **Climate Literacy & Interactive Quiz**:
  - Educational modules covering greenhouse gas dynamics and net-zero targets.
  - Gamified multiple-choice quiz with real-time feedback and scoring progress bars.

- 🚀 **Optimized for Vercel Deployment**:
  - Zero-config static hosting with `vercel.json`.
  - Clean URLs enabled (e.g. `/calculator`, `/learn`, `/about`).
  - Native custom 404 page, SVG favicon, and security headers.

---

## 📁 Project Structure

```text
carbon-footprint-platform/
├── .gitignore             # Ignored directories and build artifacts
├── vercel.json            # Vercel deployment & routing configuration
├── package.json           # Project metadata and npm scripts
├── README.md              # Project documentation
├── index.html             # Main dashboard & landing page
├── login.html             # User registration and login page
├── calculator.html        # Interactive footprint calculator
├── learn.html             # Educational guide and quiz
├── about.html             # Project background and contact form
├── 404.html               # Custom 404 error page
├── favicon.svg            # Eco-themed SVG favicon
├── css/
│   └── style.css          # Glassmorphic dark green design system
└── js/
    ├── auth.js            # Auth logic, validation, session management
    └── calculator.js      # Footprint calculations, Chart.js, PDF generation
```

---

## 🚀 Live Deployment on Vercel

### Option 1: Import via Vercel Dashboard (Recommended)

1. Push this repository to GitHub: `https://github.com/aaryan1847/carbon-footprint-platform`.
2. Visit [Vercel Dashboard](https://vercel.com/new).
3. Log in with your GitHub account.
4. Click **"Import"** next to `carbon-footprint-platform`.
5. Leave the default settings as-is (Framework Preset: **Other**, Build Command: empty).
6. Click **"Deploy"**! Your site will be live at `https://carbon-footprint-platform.vercel.app` in seconds!

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy directly from terminal
vercel
```

---

## 💻 Running Locally

Simply double-click `login.html` or `index.html` to open in any web browser, or use a local static server:

```bash
# Using Python
python -m http.server 3000

# Open in browser:
# http://localhost:3000
```

---

## 👨‍💻 Author

- **Aaryan** — [@aaryan1847](https://github.com/aaryan1847)
- **Course**: Web Technology Project
