# Automatic Token Refresh System

This document describes the automatic token refresh functionality implemented in the AtlanticWave-SDX multi-provider authentication system.

## Overview

The token refresh system automatically monitors and refreshes authentication tokens before they expire, ensuring seamless user experience without service interruptions.

## Key Features

### 🔄 Background Monitoring
- Checks token expiry status every minute
- Monitors all active tokens (CILogon, ORCID, FABRIC API)
- Tracks refresh token availability and provider capabilities

### ⚡ Automatic Refresh
- Attempts refresh 5 minutes before token expiry
- Uses provider-specific refresh mechanisms
- Maintains existing tokens if refresh tokens are unavailable

### 📱 Visual Feedback
- Real-time token status display with countdown timers
- Refresh progress indicators
- Color-coded status badges (valid, warning, expired)
- Dismissible expiry notifications

### 🛡️ Error Handling
- Graceful fallback when refresh tokens are unavailable
- User notifications for both successful and failed refreshes
- Manual refresh buttons as backup

## Provider Support

### CILogon
- ✅ **Refresh Token Support**: Yes (when provided by CILogon)
- 🔄 **Auto-Refresh**: Supported when refresh_token is available
- ⏰ **Typical Token Lifetime**: Variable (often 300000000 seconds ≈ 9.5 years)

### ORCID
- ✅ **Refresh Token Support**: Yes (OAuth2 standard)
- 🔄 **Auto-Refresh**: Supported when refresh_token is available
- ⏰ **Typical Token Lifetime**: 3600 seconds (1 hour)

### FABRIC API
- ✅ **Refresh Token Support**: Yes (native API support)
- 🔄 **Auto-Refresh**: Always supported
- ⏰ **Typical Token Lifetime**: 3600 seconds (1 hour)

## Implementation Details

### useTokenRefresh Hook

```typescript
const { refreshStatus, manualRefresh, isTokenNearExpiry } = useTokenRefresh({
  refreshBeforeExpiryMinutes: 5,    // Start refresh 5 minutes before expiry
  checkIntervalMinutes: 1,          // Check every minute
  showNotifications: true           // Show success/error notifications
});
```

### Token Storage Enhancements

New utility functions added to `TokenStorage`:

```typescript
// Check time until token expiry (in seconds)
TokenStorage.getTimeUntilExpiry(token)

// Check if token expires within warning period
TokenStorage.isTokenNearExpiry(token, warningMinutes)

// Check if token can be refreshed
TokenStorage.canRefreshToken(token)

// Format remaining time for display
TokenStorage.formatTimeUntilExpiry(token)
```

### Components

#### TokenStatus Component
- Comprehensive token status dashboard
- Manual refresh buttons
- Real-time countdown timers
- Provider-specific status indicators

#### TokenExpiryNotification Component
- Non-intrusive expiry warnings
- Dismissible notifications
- Quick refresh actions
- Positioned notifications

## Configuration

### Refresh Timing
- **Warning Period**: 15 minutes (yellow warning state)
- **Refresh Trigger**: 5 minutes before expiry
- **Check Interval**: Every 60 seconds
- **Notification Timeout**: 10 minutes

### Visual States
- **🟢 Valid**: Token has more than 15 minutes remaining
- **🟡 Warning**: Token expires within 15 minutes
- **🔄 Refreshing**: Auto-refresh in progress
- **🔴 Expired**: Token has expired
- **❌ Missing**: No token available

## User Experience

### Happy Path
1. User authenticates and obtains tokens
2. System monitors token expiry in background
3. 5 minutes before expiry, system automatically refreshes
4. User sees brief success notification
5. Token status updates with new expiry time

### Refresh Not Available
1. System detects token expiring soon
2. No refresh token available for provider
3. User sees warning notification with manual re-auth prompt
4. Token status shows "manual auth required"

### Refresh Failed
1. System attempts automatic refresh
2. Refresh fails (network, server error, etc.)
3. User sees error notification with manual refresh option
4. Token status shows error state with retry button

## Security Considerations

- Refresh tokens stored in localStorage (same as access tokens)
- No refresh tokens exposed in URLs or logs
- Failed refresh attempts logged for debugging
- Automatic cleanup of expired refresh tokens
- HTTPS required for all refresh operations

## Monitoring and Debugging

### Console Logging
The system provides detailed logging for debugging:

```typescript
console.log(`Token for ${provider} expires in ${minutes} minutes, attempting refresh...`);
console.log(`Successfully refreshed ${provider} token`);
console.error(`Failed to refresh ${provider} token:`, error);
```

### Status Tracking
Refresh status is persisted in KV store:

```typescript
{
  isRefreshing: boolean,
  lastRefresh: { cilogon: timestamp, orcid: timestamp, fabric: timestamp },
  refreshErrors: { cilogon: error_message, orcid: error_message, fabric: error_message }
}
```

## Future Enhancements

- [ ] Configurable refresh timing per provider
- [ ] Retry logic with exponential backoff
- [ ] Refresh token rotation support
- [ ] Advanced refresh scheduling (off-hours, usage patterns)
- [ ] Refresh success metrics and analytics
- [ ] Background refresh worker for inactive tabs

## Testing

### Manual Testing Scenarios

1. **Normal Refresh Flow**
   - Authenticate with any provider
   - Manually adjust token expiry to trigger refresh
   - Verify automatic refresh occurs
   - Check UI updates and notifications

2. **No Refresh Token**
   - Create token without refresh_token
   - Wait for expiry warning
   - Verify warning notification appears
   - Test manual re-authentication flow

3. **Refresh Failure**
   - Mock refresh endpoint to return error
   - Trigger automatic refresh
   - Verify error handling and user notification
   - Test manual refresh button

4. **Multiple Providers**
   - Authenticate with all three providers
   - Verify independent refresh handling
   - Test concurrent refresh scenarios

## Troubleshooting

### Common Issues

1. **Tokens not refreshing automatically**
   - Check browser console for errors
   - Verify refresh_token exists in localStorage
   - Confirm provider supports refresh tokens

2. **Notifications not showing**
   - Check `showNotifications` configuration
   - Verify toast system is working
   - Check notification permissions

3. **Manual refresh fails**
   - Check network connectivity
   - Verify provider refresh endpoints
   - Check refresh token validity

### Debug Information

Enable detailed logging by checking browser DevTools console for:
- Token expiry calculations
- Refresh attempt logs
- Provider-specific error messages
- Status updates and state changes