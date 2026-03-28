# Semstr

This is a zero-backend, unified academic dashboard integrated directly with the Canvas LMS API. It aggregates your assignments, exams, and quizzes into a clean, easy-to-read interface entirely client-side.

## Features

- **Timeline View**: Visualizes your upcoming assignments sorted chronologically and grouped by "This Week", "Next Week", and "Later". Badges indicate the task type (Exam, Quiz, Homework).
- **Workload Analysis**: A visual bar chart breaks down your assignment densities per day, and the app dynamically flags heavy workload weeks (e.g., weeks with 3+ assignments or 1+ exams).
- **100% Client-Side**: Your data never leaves your browser. This app leverages personal Canvas access tokens to communicate directly with the Canvas API. No backend servers involved!
- **Smart Reminders**: Opt-in to browser push notifications to get reminded 24 hours and 1 hour before assignments are due.
- **Customization**: Color-code your courses so you can organize your study sessions at a glance.

## Running Locally

This project is built using React + TypeScript and Vite.

1. Clone the repository:
   ```bash
   git clone https://github.com/Aarush49/Unified-Academic-Calendar.git
   cd "Unified Academic Calender"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL in your browser (usually `http://localhost:5173`).

## Linking your Canvas Account

On first launch, you will be redirected to the Setup screen to enter your Canvas instance URL and a Personal Access Token:
- **Canvas URL**: Your school's specific Canvas domain (e.g., `utdallas.instructure.com`).
- **Access Token**: Generate this in your Canvas account by navigating to **Account** -> **Settings** -> Scroll down to **Approved Integrations** -> **+ New Access Token**.

*(Credentials are stored locally in your browser's `localStorage` and only used to request data directly from Canvas).*

## Technology Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Recharts](https://recharts.org/) (Workload bar charts)
- [date-fns](https://date-fns.org/) (Date scheduling)
- [Lucide React](https://lucide.dev/) (Iconography)
- Pure CSS styling mapping a flat, minimalist design system.
