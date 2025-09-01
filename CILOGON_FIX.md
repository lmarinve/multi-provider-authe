# CILogon OAuth Configuration Fix

## Problem Summary
The application was showing `redirect_uri not valid for this client` error because:
1. The registered callback with CILogon is: `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`
2. The app was sometimes generating URLs with different domains (e.g., GitHub Codespaces URLs)

## Solution Applied

### 1. Fixed Base URL Configuration
- Updated `src/lib/config.ts` to always use the registered GitHub Pages URL
- Removed dynamic URL detection to prevent domain mismatches
- Base URL is now hardcoded: `https://lmarinve.github.io/multi-provider-authe`

### 2. Vite Configuration for GitHub Pages
- Set `base: "/multi-provider-authe/"` in `vite.config.ts`
- Added GitHub Pages SPA plugin to create proper `404.html` 
- Fixed asset paths to work with GitHub Pages routing

### 3. Callback Page Structure
The callback system is now properly configured:
```
public/auth/callback/cilogon/index.html - CILogon callback page
public/auth/callback/orcid/index.html - ORCID callback page
```

### 4. OAuth Flow Fix
- CILogon provider always uses registered redirect URI
- PKCE implementation generates proper base64url without padding
- State parameter validation ensures security
- Proper localStorage handling for cross-origin compatibility

### 5. Token Data Structure
Updated `TokenData` interface to support both `id_token` and `access_token`:
```typescript
export interface TokenData {
  id_token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in: number;
  issued_at: number;
  provider: "cilogon" | "orcid" | "fabric";
}
```

## Key Configuration Values

### CILogon
- **Client ID**: `cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0`
- **Registered Callback**: `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`
- **Auth URL**: `https://cilogon.org/authorize`
- **Token URL**: `https://cilogon.org/oauth2/token`
- **Scope**: `openid` (only scope allowed with Strict Scopes)
- **PKCE**: Required with S256 method

### Required Files for GitHub Pages
1. `public/auth/callback/cilogon/index.html` - Must exist at this exact path
2. `public/404.html` - For SPA routing on GitHub Pages
3. `vite.config.ts` - With correct base path configuration

## Testing the Fix

### 1. Local Development
Run the app locally with the dev server to test authentication flows.

### 2. GitHub Pages Deployment
1. Build the project with Vite
2. Deploy to GitHub Pages
3. Access the app at: `https://lmarinve.github.io/multi-provider-authe/`
4. Test CILogon authentication by:
   - Selecting CILogon provider
   - Clicking "Login with CILogon"
   - Verifying popup opens to CILogon
   - Completing authentication on CILogon
   - Verifying redirect back to callback page
   - Confirming token is received and stored

### 3. Debug Steps if Issues Persist
1. Verify the callback page loads at: `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`
2. Check browser console for CORS errors
3. Verify generated auth URL matches expected format:
   ```
   https://cilogon.org/authorize?response_type=code&client_id=cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0&redirect_uri=https%3A%2F%2Flmarinve.github.io%2Fmulti-provider-authe%2Fauth%2Fcallback%2Fcilogon&scope=openid&state=...&code_challenge=...&code_challenge_method=S256
   ```
4. Ensure popup is not blocked by browser
5. Verify localStorage persistence of PKCE values

## Expected OAuth Flow
1. User clicks "Login with CILogon"
2. App generates PKCE values and state
3. App opens popup with CILogon auth URL
4. User authenticates with institution via CILogon
5. CILogon redirects to callback page with `?code=...&state=...`
6. Callback page sends success message to parent window
7. Parent window exchanges code for tokens using PKCE
8. Tokens are stored in localStorage
9. User is redirected to token page

All configuration is now aligned with the registered CILogon client settings.