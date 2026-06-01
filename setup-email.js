#!/usr/bin/env node

/**
 * Email Setup Script for RevoQuest Enrollment Form
 * 
 * This script helps you set up email notifications for the enrollment form.
 * Run this script to configure Firebase Functions with your email settings.
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEmail() {
  console.log('🚀 RevoQuest Email Setup');
  console.log('========================\n');
  
  console.log('This script will configure email notifications for your enrollment form.');
  console.log('When students enroll, details will be sent to: admin@revoquest.co.za\n');
  
  try {
    // Get email credentials
    const emailUser = await question('Enter your email address (e.g., your-email@gmail.com): ');
    const emailPass = await question('Enter your email app password: ');
    
    console.log('\n📧 Setting up Firebase Functions configuration...');
    
    // Set Firebase Functions config
    execSync(`firebase functions:config:set email.user="${emailUser}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set email.pass="${emailPass}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set admin.email="admin@revoquest.co.za"`, { stdio: 'inherit' });
    
    console.log('\n✅ Email configuration set successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy Firebase Functions: firebase deploy --only functions');
    console.log('2. Test the enrollment form on your website');
    console.log('3. Check admin@revoquest.co.za for enrollment notifications');
    
    console.log('\n📧 Email will be sent to: admin@revoquest.co.za');
    console.log('📧 From: ' + emailUser);
    
  } catch (error) {
    console.error('❌ Error setting up email:', error.message);
    console.log('\n🔧 Manual setup:');
    console.log('firebase functions:config:set email.user="your-email@gmail.com"');
    console.log('firebase functions:config:set email.pass="your-app-password"');
    console.log('firebase functions:config:set admin.email="admin@revoquest.co.za"');
  } finally {
    rl.close();
  }
}

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  setupEmail();
} catch (error) {
  console.log('❌ Firebase CLI not found. Please install it first:');
  console.log('npm install -g firebase-tools');
  console.log('Then run: firebase login');
  process.exit(1);
}
