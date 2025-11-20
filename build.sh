#!/bin/bash

# Vercel Build Script for Baggage Quiz App

echo "🚀 Starting Vercel build process..."

# Install client dependencies and build
echo "📦 Installing client dependencies..."
cd client
npm ci --only=production

echo "🔨 Building React app..."
npm run build

echo "✅ Build completed successfully!"

# Copy build files to root for Vercel
echo "📁 Preparing files for Vercel..."
cd ..
cp -r client/build ./build

echo "🎉 Vercel build process completed!"