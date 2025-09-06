# Simon & Noah's Oppgavejakt! 🏆

A gamified weekly chores app for kids, built with Vue.js and Firebase. Features a point system, task approval workflow, and real-time synchronization.

## Features

- **📅 Weekly Calendar** - Tasks organized by day of the week
- **🏆 Point System** - Kids earn points for completed tasks (1-5 stars)
- **✅ Approval Workflow** - Parents approve tasks before points are awarded
- **🎉 Celebrations** - Visual feedback when tasks are approved
- **📱 Touch Optimized** - Designed for tablets and mobile devices
- **☁️ Real-time Sync** - Firebase integration for data persistence

## Setup

### Environment Variables

This project uses Firebase for data storage. You need to set up environment variables for the Firebase configuration.

#### Local Development

1. Create `.env.local` file with your Firebase configuration:
   ```bash
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

#### GitHub Pages Deployment

1. **Set up GitHub Pages:**
   - Go to your repository Settings → Pages
   - Select "Deploy from a branch" → "main" branch
   - Choose "/ (root)" as the source

2. **Set environment variables:**
   - Go to Settings → Secrets and variables → Actions
   - Add the following repository secrets:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_MEASUREMENT_ID`

3. **Custom Domain (Optional):**
   - The `CNAME` file is already configured for `oppgaver.ttonnesen.no`
   - Update your DNS settings to point to your GitHub Pages URL

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start a local server:
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```

3. Open `http://localhost:3000` (or the port shown in terminal) in your browser

## Project Structure

```
├── index.html          # Main application entry point
├── app.js             # Vue.js application logic
├── styles.css         # Application styling
├── src/
│   └── app.ts         # TypeScript version (for development)
├── dist/              # Compiled TypeScript output
├── .env.local         # Environment variables (local development)
├── CNAME              # Custom domain configuration
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Technology Stack

- **Frontend:** Vue.js 3, Vanilla CSS
- **Backend:** Firebase Firestore
- **Deployment:** GitHub Pages
- **Development:** TypeScript support available

## Security

- Environment variables are loaded from `.env.local` for local development
- `.env.local` is gitignored to prevent committing secrets
- Production secrets are set in GitHub repository settings
- Never commit actual Firebase credentials to the repository

## Development

### TypeScript Support
The project includes TypeScript definitions in `src/app.ts`. To compile:
```bash
npx tsc
```

### Development vs Production
- **Local Development:** Use `npm start` for development with environment variables
- **GitHub Pages:** Production deployment with environment variables from repository settings