# OAuth Configuration Guide

## Overview

This application uses OAuth 2.0 with PKCE for authentication with CILogon, ORCID, and FABRIC API. Each provider requires proper configuration of redirect URIs in your OAuth application settings.

## Current Issues and Solutions

### Issue: Redirect URI Mismatch

The error you're seeing:

```
Failed to initialize OIDC flow. The given redirect_uri is not valid for this client.
```

This occurs because the redirect URI in your OAuth application configuration doesn't match the current deployment URL.

### Solution: Update Redirect URIs

You need to update the redirect URIs in each OAuth provider's configuration:

#### 1. CILogon Configuration

**Current registered URI:** `https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon`

**Required URI for current deployment:** 
- For Spark development: The URI will be automatically determined based on your current deployment URL
- Format: `{DEPLOYMENT_URL}/auth/callback/cilogon.html`

**Steps to update:**
1. Go to your CILogon client configuration
2. Update the redirect URI to match your current deployment URL
3. Ensure the client ID matches: `cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0`
4. Confirm scopes are set to: `openid` (only openid, as your client has Strict Scopes = true)

#### 2. ORCID Configuration

**Current registered URI:** `https://lmarinve.github.io/multi-provider-authe/auth/callback/orcid`

**Required URI for current deployment:**
- Format: `{DEPLOYMENT_URL}/auth/callback/orcid.html`

**Steps to update:**
1. Go to your ORCID application configuration
2. Update the redirect URI to match your current deployment URL
3. Ensure the client ID matches: `APP-S3BU1LVHOTHITEU2`
4. Confirm scopes are set to: `/authenticate`

## Getting Your Current Deployment URL

To find your current deployment URL:

1. **In Spark Development Environment:**
   - The URL will be provided when you run the development server
   - It typically looks like: `https://[unique-id].app.github.dev`

2. **In Production:**
   - Use your actual production domain

## Callback Pages

The application includes callback pages at:
- `/auth/callback/cilogon.html` - Handles CILogon OAuth callbacks
- `/auth/callback/orcid.html` - Handles ORCID OAuth callbacks

These pages:
- Process the OAuth response
- Extract the authorization code and state
- Send the data back to the main application
- Handle error cases gracefully

## Testing the Configuration

After updating your redirect URIs:

1. Try the CILogon authentication flow
2. Check that the popup opens successfully
3. Complete authentication in the popup
4. Verify the token is received and stored

## Common Issues

### 1. Content Blocking
If you see "This content is blocked" or "refused to connect":
- This usually means the OAuth provider is blocking the request
- Ensure your redirect URIs are exactly correct (including the `.html` extension)
- Try testing in an incognito window

### 2. Popup Blocked
- Ensure popups are allowed for your domain
- Try disabling popup blockers temporarily for testing

### 3. CORS Issues
- OAuth flows with popup windows can have CORS restrictions
- The callback pages are designed to work around common CORS issues

## Provider-Specific Notes

### CILogon
- Uses PKCE with S256 method (required)
- Only supports `openid` scope due to Strict Scopes setting
- Requires exact redirect URI match (case-sensitive)

### ORCID
- Uses PKCE with S256 method
- Supports `/authenticate` scope
- May have additional CORS restrictions

### FABRIC API
- Requires a valid CILogon token first
- Uses token exchange rather than direct OAuth

## Next Steps

1. **Update your OAuth applications** with the correct redirect URIs for your current deployment
2. **Test each authentication flow** to ensure they work properly
3. **Monitor the browser console** for any remaining error messages

The authentication should work properly once the redirect URIs are correctly configured in your OAuth applications.