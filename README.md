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

**Automatic Deployment with GitHub Actions**

The project uses GitHub Actions for automatic TypeScript compilation and deployment:

1. **GitHub Actions Workflow:**
   - Automatically compiles TypeScript on every push to `main`
   - Deploys compiled files to GitHub Pages
   - No manual deployment needed

2. **Set up GitHub Pages:**
   - Go to your repository Settings → Pages
   - Select "GitHub Actions" as the source
   - The workflow will handle deployment automatically

3. **Custom Domain:**
   - The `CNAME` file is configured for `oppgaver.ttonnesen.no`
   - Update your DNS settings to point to your GitHub Pages URL

### Running the Application

1. **Start local development server:**
   ```bash
   npm start
   ```

2. **Build TypeScript (for local testing):**
   ```bash
   npm run build
   ```

3. **Watch mode for development:**
   ```bash
   npm run dev
   ```

4. **Deploy to production:**
   - Simply push changes to `main` branch
   - GitHub Actions will automatically compile and deploy

5. **Access the application:**
   - Local: `http://localhost:3000`
   - Production: `https://oppgaver.ttonnesen.no`

## Project Structure

```
weekly-chores/
├── index.html              # Main application entry point
├── app.js                  # Compiled Vue.js application (auto-generated)
├── firestore-service.js    # Compiled Firebase service (auto-generated)
├── firebase-config.js      # Compiled Firebase config (auto-generated)
├── firebase-types.js       # Compiled type definitions (auto-generated)
├── styles.css             # Application styling
├── src/
│   ├── app.ts             # Main TypeScript source code
│   ├── firestore-service.ts # Firebase service TypeScript
│   ├── firebase-config.ts  # Firebase configuration TypeScript
│   └── firebase-types.ts   # TypeScript type definitions
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions deployment workflow
├── .env                   # Environment variables for web deployment
├── CNAME                  # Custom domain configuration (oppgaver.ttonnesen.no)
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Technology Stack

- **Frontend:** Vue.js 3, Vanilla CSS
- **Backend:** Firebase Firestore
- **Deployment:** GitHub Pages with GitHub Actions
- **Build:** TypeScript compilation (automated)
- **CI/CD:** GitHub Actions workflow

## Development

### TypeScript Development Workflow

1. **Edit TypeScript files** in the `src/` directory
2. **Test locally:**
   ```bash
   npm run dev    # Watch mode for development
   npm start      # Build and serve locally
   ```
3. **Deploy to production:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
   - GitHub Actions automatically compiles TypeScript and deploys

### Important Notes

- **Never edit `.js` files directly** - they are auto-generated from TypeScript
- **Only edit files in `src/`** - these are the source files
- **Compiled files are tracked in Git** - needed for GitHub Pages deployment