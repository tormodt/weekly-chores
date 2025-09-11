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

This project uses Firebase for data storage. Environment variables are configured directly in the `.env` file for web server deployment.

### GitHub Pages Deployment

1. **Set up GitHub Pages:**
   - Go to your repository Settings → Pages
   - Select "Deploy from a branch" → "main" branch
   - Choose "/ (root)" as the source

2. **Custom Domain (Optional):**
   - The `CNAME` file is already configured for `oppgaver.ttonnesen.no`
   - Update your DNS settings to point to your GitHub Pages URL

### Running the Application

1. **Start local web server:**
   ```bash
   npm start
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

4. **Access the application:**
   - Local: `http://localhost:3000`
   - Production: Visit your GitHub Pages URL or custom domain

## Project Structure

```
├── index.html          # Main application entry point
├── app.js             # Vue.js application logic
├── styles.css         # Application styling
├── src/
│   └── app.ts         # TypeScript source code
├── .env               # Environment variables for web deployment
├── CNAME              # Custom domain configuration
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Technology Stack

- **Frontend:** Vue.js 3, Vanilla CSS
- **Backend:** Firebase Firestore
- **Deployment:** GitHub Pages
- **Build:** TypeScript compilation

## Security

- Environment variables are configured in `.env` file for web deployment
- Firebase credentials are embedded in the deployed application
- All data is stored securely in Firebase Firestore

## Development

### TypeScript Support
The project includes TypeScript definitions in `src/app.ts`. To compile:
```bash
npm run build
```

### Web Server Deployment
- **GitHub Pages:** Production deployment with embedded environment variables
- **Custom Domain:** Configured for `oppgaver.ttonnesen.no`