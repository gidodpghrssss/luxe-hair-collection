#!/bin/bash

# Install all dependencies including dev dependencies
npm install

# Explicitly install TypeScript and types with exact versions
npm install --save typescript@5.1.6
npm install --save-dev @types/react@18.2.14 @types/node@20.3.1 @types/react-dom@18.2.6

# Create a temporary .npmrc file to ensure types are installed
echo "legacy-peer-deps=true" > .npmrc

# Force install all dependencies again with legacy peer deps
npm install --force

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the Next.js application
npm run build
