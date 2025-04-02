#!/bin/bash

# Install all dependencies including dev dependencies
npm install

# Explicitly install TypeScript types with exact versions
npm install --save-dev @types/react@18.2.14 @types/node@20.3.1 @types/react-dom@18.2.6 typescript@5.1.6

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the Next.js application
npm run build
