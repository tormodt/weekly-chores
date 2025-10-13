#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read .env file if it exists
function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        
        return envVars;
    }
    return {};
}

// Load environment variables
const envVars = loadEnvFile();

// Validate required environment variables
const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID'
];

const missingVars = requiredVars.filter(varName => !envVars[varName] || envVars[varName].trim() === '');
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please ensure all Firebase configuration variables are set in your .env file or GitHub Secrets');
    process.exit(1);
}

// Generate config.ts content
const configContent = `// Environment configuration
// This file is auto-generated from .env file during build
export const config = {
    FIREBASE_API_KEY: '${envVars.FIREBASE_API_KEY}',
    FIREBASE_AUTH_DOMAIN: '${envVars.FIREBASE_AUTH_DOMAIN}',
    FIREBASE_PROJECT_ID: '${envVars.FIREBASE_PROJECT_ID}',
    FIREBASE_STORAGE_BUCKET: '${envVars.FIREBASE_STORAGE_BUCKET}',
    FIREBASE_MESSAGING_SENDER_ID: '${envVars.FIREBASE_MESSAGING_SENDER_ID}',
    FIREBASE_APP_ID: '${envVars.FIREBASE_APP_ID}',
    FIREBASE_MEASUREMENT_ID: '${envVars.FIREBASE_MEASUREMENT_ID}'
};
`;

// Write config.ts to src directory
const configPath = path.join(__dirname, '..', 'src', 'config.ts');
fs.writeFileSync(configPath, configContent);

console.log('✅ Config file generated successfully');
