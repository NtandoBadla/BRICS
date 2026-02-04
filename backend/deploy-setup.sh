#!/bin/bash

# BRICS Platform Deployment Script for Render
# This script should be run after deployment to set up initial data

echo "🚀 BRICS Platform Post-Deployment Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the backend directory."
    exit 1
fi

# Install dependencies (if not already done)
echo "📦 Installing dependencies..."
npm install

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed news articles
echo "🌱 Seeding news articles..."
node seed-news.js

# Test API connection
echo "🔍 Testing API connection..."
node validate-api-key.js

echo "✅ Deployment setup complete!"
echo ""
echo "🌐 Your BRICS platform should now be ready with:"
echo "   - Database migrations applied"
echo "   - News articles seeded"
echo "   - API key validated"
echo ""
echo "🔗 Access your platform at: https://brics-platform.onrender.com"