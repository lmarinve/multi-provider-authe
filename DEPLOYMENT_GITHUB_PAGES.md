# GitHub Pages Deployment Guide

This application is configured to work with GitHub Pages deployment for the CILogon authentication flow.

## Key Configuration

The application is configured for the following setup:
- **GitHub Pages URL**: `https://lmarinve.github.io/multi-provider-authe/`
- **CILogon Callback**: `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`
- **Client ID**: `cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0`

## Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   - Go to your GitHub repository settings
   - Navigate to Pages section
   - Set Source to "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save

3. **Verify deployment**:
   - Visit `https://lmarinve.github.io/multi-provider-authe/`
   - Check that the callback URL works: `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`

## Important Files for GitHub Pages

- `vite.config.ts`: Configured with `base: '/multi-provider-authe/'`
- `public/404.html`: Will be auto-generated for SPA routing
- `public/auth/callback/cilogon/index.html`: Handles OAuth callbacks

## Troubleshooting

If CILogon shows "redirect_uri not valid":
1. Verify the callback URL is exactly: `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`
2. Check that the file exists at `public/auth/callback/cilogon/index.html`
3. Ensure GitHub Pages is serving files correctly

## Debug Information

The application logs debug information to the browser console:
- Current domain and configuration
- PKCE parameters generation
- Authentication flow status

Check the browser console for detailed debugging information during authentication.