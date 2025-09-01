# AtlanticWave-SDX Multi Provider Authentication

A Spark-powered authentication application supporting multiple identity providers.

## 🚀 Quick Start

### GitHub Pages Deployment (Required for CILogon)

Since CILogon is registered to redirect to `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`, you **must** deploy this to GitHub Pages:

1. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or your main branch)
   - Folder: `/ (root)`
   - Click Save

2. **Wait for deployment:**
   - GitHub will build and deploy your site
   - Look for the green "Your site is published at..." message
   - URL should be: `https://lmarinve.github.io/multi-provider-authe/`

3. **Verify deployment:**
   - Visit: `https://lmarinve.github.io/multi-provider-authe/test-deployment.html`
   - This will show your deployment status and test callback access

### Development

```bash
npm install
npm run dev
```

**Important:** Even in development, CILogon authentication will redirect to the GitHub Pages URL because that's where the client is registered.

## 🔐 Authentication Providers

### CILogon
- **Client ID:** `cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0`
- **Redirect URI:** `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`
- **Flow:** OAuth 2.0 with PKCE (S256)
- **Scope:** `openid` (strict scopes enabled)

### ORCID
- **Client ID:** `APP-S3BU1LVHOTHITEU2`
- **Flow:** OAuth 2.0 with PKCE
- **Scope:** `/authenticate`

### FABRIC API
- **Base URL:** `https://cm.fabric-testbed.net`
- **Project:** AtlanticWave-SDX
- **Dependencies:** Requires valid CILogon token

## 🛠 Project Structure

```
src/
├── components/
│   ├── pages/           # Main page components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── providers/       # Auth provider implementations
│   ├── config.ts        # App configuration
│   └── token-storage.ts # Token management
└── assets/
    └── images/          # Logo and other images

public/
├── auth/
│   └── callback/        # OAuth callback pages
│       ├── cilogon/
│       │   └── index.html
│       ├── orcid.html
│       └── cilogon.html
└── test-deployment.html # Deployment verification
```

## 🔧 Configuration

Main configuration is in `src/lib/config.ts`. All environment-specific settings are handled there.

## 🐛 Troubleshooting

### "There isn't a GitHub Pages site here"
- Make sure GitHub Pages is enabled in your repository settings
- Verify the site is published and accessible
- Check that the callback URL matches exactly: `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`

### "PKCE code challenge failed"
- This happens when the `code_verifier` doesn't match the `code_challenge`
- The app uses state-based storage to handle this correctly
- Check browser console for detailed PKCE debug information

### Cross-origin issues
- The callback page handles cross-origin scenarios by storing verifiers in both sessionStorage and localStorage
- Authentication can be started from development but will redirect to GitHub Pages for the callback

## 📄 License

MIT License - Copyright GitHub, Inc.