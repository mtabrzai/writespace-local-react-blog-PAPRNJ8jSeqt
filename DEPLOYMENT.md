# Writespace Deployment Guide

## Vercel Deployment

Writespace is configured for seamless deployment on Vercel. Follow these steps to deploy your application:

### Prerequisites

- A Vercel account ([sign up here](https://vercel.com/signup))
- The Writespace repository cloned to your local machine
- Node.js (v18 or later) installed locally
- npm (v9 or later) installed locally

### Initial Setup

1. **Connect your GitHub repository to Vercel**:
   - Log in to your Vercel account
   - Click "Add New" → "Project"
   - Select your Writespace GitHub repository
   - Click "Import"

2. **Configure project settings**:
   - **Project Name**: writespace (or your preferred name)
   - **Framework Preset**: Vite
   - **Root Directory**: Leave empty (project is in root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set environment variables**:
   In the Vercel project dashboard, navigate to "Settings" → "Environment Variables" and add the following:

   ```
   VITE_API_BASE_URL=https://your-api-endpoint.com
   ```

   > Note: Replace `https://your-api-endpoint.com` with your actual backend API URL. For local development, you can use `http://localhost:3000` or your local backend URL.

### Environment Variables

| Variable            | Description                                                                 | Required | Example Value                     |
|---------------------|-----------------------------------------------------------------------------|----------|-----------------------------------|
| VITE_API_BASE_URL   | Base URL for your backend API                                               | Yes      | `https://api.writespace.example`  |

### Continuous Deployment

Vercel automatically sets up continuous deployment for your project. Any push to the connected GitHub repository will trigger a new deployment.

- **Production**: Pushes to the `main` branch will deploy to production
- **Preview**: Pushes to other branches will create preview deployments

### Manual Deployment

To trigger a manual deployment:

1. Navigate to your project in the Vercel dashboard
2. Click "Deployments"
3. Click "Deploy" button in the top right corner

### Rollback

To rollback to a previous deployment:

1. Navigate to your project in the Vercel dashboard
2. Click "Deployments"
3. Find the deployment you want to rollback to
4. Click the "⋮" menu
5. Select "Promote to Production"

## Local Development Setup

Before deploying, ensure your local development environment is properly configured:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root of your project:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Build Configuration

The project uses Vite for building. The build configuration is defined in `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

The build output is optimized for production and placed in the `dist` directory.

## CI/CD Pipeline

Vercel provides built-in CI/CD. The pipeline consists of:

1. **Build**: Runs `npm install` and `npm run build`
2. **Deploy**: Deploys the contents of the `dist` directory to Vercel's edge network
3. **Preview**: Creates a preview URL for non-production branches
4. **Production**: Deploys to production when merging to the main branch

## Troubleshooting

### Common Issues

1. **Build fails with "Module not found"**:
   - Ensure all dependencies are listed in `package.json`
   - Run `npm install` locally and commit `package-lock.json`
   - Verify all imports in your code match the exact package names

2. **Environment variables not available**:
   - Ensure variables are prefixed with `VITE_` in `.env` files
   - Verify variables are set in the Vercel dashboard
   - Check that variables are accessed via `import.meta.env.VITE_VAR_NAME`

3. **Routing issues**:
   - Ensure `vercel.json` is properly configured for SPA routing
   - Verify all routes are handled by the React Router configuration

4. **Tailwind CSS not working**:
   - Ensure `tailwind.config.js` includes all necessary content paths
   - Verify `@tailwind` directives are present in `index.css`
   - Check that PostCSS configuration is correct

### Logs

To view deployment logs:

1. Navigate to your project in the Vercel dashboard
2. Click "Deployments"
3. Select the deployment you want to inspect
4. Click "View Logs"

## Production Checklist

Before deploying to production:

- [ ] All environment variables are set in Vercel
- [ ] API base URL is configured correctly
- [ ] All dependencies are listed in `package.json`
- [ ] `package-lock.json` is committed to the repository
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview deployment works as expected
- [ ] Custom domain is configured (if applicable)