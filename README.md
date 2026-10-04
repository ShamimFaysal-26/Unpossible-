<div align="center">

# 💰 FinSathi AI
### Intelligent Personal Finance, Budgeting & Wealth Management Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<p align="center">
  <strong>FinSathi AI</strong> is a full-stack, cloud-synchronized personal finance assistant designed to help individuals, freelancers, and households track expenses, master category budgets, plan savings milestones, and gain real-time conversational financial guidance.
</p>

[Key Features](#-key-features) •
[Tech Stack](#-technology-stack) •
[Architecture](#-architecture) •
[Getting Started](#-getting-started) •
[Firebase Setup](#-firebase-configuration) •
[Scripts](#-available-scripts) •
[License](#-license)

</div>

---

## 🌟 Key Features

### 1. 🔄 Live Cloud Synchronization (Firebase Firestore)
- **Zero Data Loss**: Every income, expense, monthly budget limit, and savings target is synced in real-time to Google Cloud Firestore.
- **Offline & Optimistic Updates**: Changes reflect instantly on the UI while syncing reliably in the background.

### 2. 🔐 Multi-Device Isolation & User Authentication
- **User Account Sync**: Sign in with **1-Click Google Sign-In** or **Email & Password** to synchronize your exact ledger across your laptop, desktop, tablet, and smartphone.
- **Guest Device Isolation**: Anonymous/guest users receive an isolated unique device partition (`dev_...`) so multiple people using the application never have their data mixed.
- **Cross-Device Device Linking**: Link guest sessions between devices effortlessly using a Device Sync ID.

### 3. 🤖 FinSathi AI Advisor & Financial Assistant
- **Context-Aware Recommendations**: Converses naturally about your real financial situation (income, spending, surplus, savings rate, and category budgets).
- **Auto-Categorization**: Intelligently predicts whether an expense is *Food & Dining*, *Transportation*, *Housing*, *Bills*, *Healthcare*, or *Shopping* as you type.
- **Spending Anomaly Alerts**: Proactively flags transactions that spike far above your category historical averages.
- **High-Availability Engine**: Seamlessly falls back to a built-in semantic financial intelligence engine if offline or when external API quotas are constrained.

### 4. 📊 Transaction Ledger & CSV Tools
- **Comprehensive Ledger**: Filter by income/expense, category, or payment method (*Credit Card, Debit Card, Bank Transfer, Mobile Wallet, Cash*).
- **Full Search & Sorting**: Real-time keyword search and date/amount sorting.
- **1-Click CSV Import**: Bulk-upload historical bank or credit card statements with field mapping.
- **CSV Data Export**: Download your full filtered financial ledger as a clean `.csv` file.

### 5. 🎯 Dynamic Budgets & Savings Goals
- **Category Spending Limits**: Set monthly allowances for Groceries, Dining, Transit, Shopping, and more with live progress bars and alert states (Healthy, Warning, Over Budget).
- **Savings Milestones**: Create dedicated funds for Emergency Reserves, Equipment, Travel, or Education.
- **Interactive Deposits & Withdrawals**: Allocate funds toward targets with AI-computed monthly contribution pace calculators.

### 6. 📈 Visual Analytics & Reports
- **Visual Charts**: Powered by Recharts with Category Breakdown Donut charts, Monthly Cash Flow Balance comparisons, and Expense Trajectory.
- **Key Metrics**: Dynamic calculation of Net Cash Flow, Savings Rate (%), Total Inflow, and Total Burn.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 6](https://vitejs.dev/) with Fast Refresh |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Backend & API Proxy** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx) |
| **Database & Cloud Storage** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) (Google OAuth & Email/Password) |
| **AI & NLP Model** | [Google Gemini 3.8 Flash](https://ai.google.dev/) via `@google/genai` TypeScript SDK |

---

## 📂 Project Structure

```text
├── firebase-applet-config.json    # Firebase project credentials & database configuration
├── firebase-blueprint.json        # Database schema definitions and path mapping
├── firestore.rules                # Production security access control rules
├── package.json                   # Dependencies and build scripts
├── server.ts                      # Express backend entry point with Vite middleware
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration
│
└── src/
    ├── assets/                    # Optimized icons, illustrations, and banners
    ├── components/
    │   ├── AiAssistantTab.tsx     # Conversational NLP Financial Advisor
    │   ├── AnalyticsTab.tsx       # Recharts visualizations & financial summaries
    │   ├── AuthModal.tsx          # Google & Email/Password Sign-In / Sign-Up modal
    │   ├── BudgetsTab.tsx         # Monthly category limit management & progress
    │   ├── CsvImportModal.tsx     # Batch CSV spreadsheet statement import tool
    │   ├── DatabaseModal.tsx      # Cloud sync status, partition management & device linking
    │   ├── GoalsTab.tsx           # Multi-target savings goals & fund progress
    │   ├── Header.tsx             # Responsive navigation bar & user account dropdown
    │   ├── OverviewTab.tsx        # Financial dashboard with KPI metric cards
    │   ├── TransactionModal.tsx   # Add/Edit transaction with AI auto-categorization
    │   ├── TransactionsTab.tsx    # Transaction ledger table with search & export
    │   └── UnusualSpendingAlert.tsx # Anomaly alert banner for unexpected expenses
    │
    ├── context/
    │   └── FinanceContext.tsx     # Centralized global state, subscriptions & calculation engine
    ├── data/
    │   └── initialData.ts         # Initial schema models, category mappings & presets
    ├── lib/
    │   └── firebase.ts            # Firebase app, Auth, and Firestore connection initialization
    ├── services/
    │   ├── api.ts                 # Client API client for AI assistant & categorization
    │   ├── authService.ts         # Firebase Authentication methods (Google & Email)
    │   └── dbService.ts           # Firestore real-time snapshot listeners & CRUD operations
    └── types/
        └── finance.ts             # TypeScript interface definitions for transactions, budgets, goals
```

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn** / **pnpm**
- A **Google AI Studio API Key** (optional for Gemini AI features): [Get a Gemini API Key](https://aistudio.google.com/)
- A **Firebase Project** with Firestore and Authentication enabled: [Firebase Console](https://console.firebase.google.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/finsathi-ai.git
cd finsathi-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your variables:
```env
# Google Gemini API key for natural language financial advice
GEMINI_API_KEY="your-gemini-api-key"

# App URL (default for local development)
APP_URL="http://localhost:3000"
```

---

### Step 4: Configure Firebase (`firebase-applet-config.json`)
Create or edit `firebase-applet-config.json` in the project root:
```json
{
  "projectId": "your-firebase-project-id",
  "appId": "your-firebase-app-id",
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-firebase-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-firebase-project-id.firebasestorage.app",
  "messagingSenderId": "your-messaging-sender-id"
}
```

> **Tip**: Enable **Google** and **Email/Password** under **Firebase Console > Authentication > Sign-in method**.

---

### Step 5: Start the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express full-stack backend with Vite middleware in development mode (`port 3000`) |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle in `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to verify static types |
| `npm run clean` | Cleans up previous build artifacts |

---

## 🛡️ Firestore Security & Data Isolation Architecture

FinSathi AI uses a **per-workspace partition pattern** in Firestore to ensure complete privacy:

```text
/databases/(default)/documents/
  ├── devices/
  │   └── {deviceId}/                 # Isolated partition for guest/device sessions
  │         ├── transactions/{txId}
  │         ├── budgets/{budgetId}
  │         └── goals/{goalId}
  │
  └── devices/
      └── usr_{userId}/               # Isolated partition for authenticated users
            ├── transactions/{txId}
            ├── budgets/{budgetId}
            └── goals/{goalId}
```

- When signed in, all data is partitioned under `usr_<firebase_uid>`, synchronizing across all devices logged into that account.
- When unauthenticated, data remains strictly isolated to the browser's persistent device identity.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ using React 19, Tailwind CSS v4, Firebase & Google Gemini AI.</sub>
</div>
