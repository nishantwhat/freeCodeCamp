const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Set default values for environment variables if not present
const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'production',
  MEMORY_LIMIT: process.env.MEMORY_LIMIT || '600M', // Default memory limit
  INSTANCE_COUNT: process.env.INSTANCE_COUNT || 'max' // Default instance count
};

// Log a warning if the .env file could not be loaded
if (!fs.existsSync(path.resolve(__dirname, '..', '.env'))) {
  console.warn("Warning: .env file not found. Falling back to shell environment variables.");
}

// Handle module resolution issue for LoopBack (if needed)
const loopbackModuleResolutionHack = path.resolve(__dirname, '../node_modules/.pnpm/node_modules');
if (!fs.existsSync(loopbackModuleResolutionHack)) {
  console.error("Error: LoopBack module resolution path not found. Ensure your dependencies are correctly installed.");
}

// PM2 configuration
module.exports = {
  apps: [
    {
      script: './lib/production-start.js',  // Entry point script
      cwd: __dirname,                       // Current working directory
      env: { 
        ...process.env,                     // Merging system environment variables
        NODE_PATH: loopbackModuleResolutionHack 
      },
      max_memory_restart: env.MEMORY_LIMIT,  // Memory limit for auto-restart
      instances: env.INSTANCE_COUNT,         // Set to max or custom number of instances
      exec_mode: 'cluster',                  // Cluster mode for scaling
      name: env.DEPLOYMENT_ENV === 'staging' ? 'dev' : 'org', // App name based on environment
      watch: false                           // Add watch option if you want automatic restarts on file changes
    }
  ]
};
