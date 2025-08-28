// Popup-based OAuth authentication utilities
export interface PopupAuthOptions {
  url: string;
  width?: number;
  height?: number;
  windowFeatures?: string;
}

export interface PopupAuthResult {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

/**
 * Creates a message-based authentication flow for better reliability
 * This listens for postMessage events from the popup window
 */
export function authenticateWithPopup(options: PopupAuthOptions): Promise<PopupAuthResult> {
  const {
    url,
    width = 600,
    height = 700,
    windowFeatures = 'scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
  } = options;

  return new Promise((resolve, reject) => {
    const left = Math.max(0, (window.screen.width - width) / 2 + (window.screenLeft || window.screenX || 0));
    const top = Math.max(0, (window.screen.height - height) / 2 + (window.screenTop || window.screenY || 0));

    const features = `${windowFeatures},width=${width},height=${height},left=${left},top=${top}`;
    
    // Open popup window
    const popup = window.open(url, 'oauth_popup', features);
    
    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site and try again.'));
      return;
    }

    popup.focus();

    let resolved = false;

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        console.warn('Received message from untrusted origin:', event.origin);
        return;
      }

      if (event.data && event.data.type === 'OAUTH_RESULT') {
        console.log('Received OAuth result:', event.data.result);
        resolved = true;
        window.removeEventListener('message', messageListener);
        if (!popup.closed) {
          popup.close();
        }
        resolve(event.data.result);
      }
    };

    window.addEventListener('message', messageListener);

    // Also check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed && !resolved) {
        resolved = true;
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('Authentication cancelled by user'));
      }
    }, 1000);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (!popup.closed) popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('Authentication timeout - please try again'));
      }
    }, 300000);
  });
}

/**
 * Legacy method - opens OAuth flow in a popup window and handles the callback by monitoring URL changes
 * Kept for backwards compatibility but message-based approach is preferred
 */
export function authenticateWithPopupLegacy(options: PopupAuthOptions): Promise<PopupAuthResult> {
  const {
    url,
    width = 600,
    height = 700,
    windowFeatures = 'scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
  } = options;

  return new Promise((resolve, reject) => {
    // Calculate popup position (center of screen)
    const left = Math.max(0, (window.screen.width - width) / 2 + (window.screenLeft || window.screenX || 0));
    const top = Math.max(0, (window.screen.height - height) / 2 + (window.screenTop || window.screenY || 0));

    const features = `${windowFeatures},width=${width},height=${height},left=${left},top=${top}`;
    
    // Open popup window
    const popup = window.open(url, 'oauth_popup', features);
    
    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site and try again.'));
      return;
    }

    // Focus the popup
    popup.focus();

    // Poll for popup closure or URL changes
    const checkClosed = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled by user'));
          return;
        }

        // Try to read the URL - this will throw if we can't access it due to same-origin policy
        const popupUrl = popup.location.href;
        
        // Check if we've been redirected to our callback URL
        if (popupUrl.includes(window.location.origin)) {
          const url = new URL(popupUrl);
          const params = new URLSearchParams(url.search);
          
          const result: PopupAuthResult = {};
          
          // Extract OAuth parameters
          if (params.has('code')) result.code = params.get('code')!;
          if (params.has('state')) result.state = params.get('state')!;
          if (params.has('error')) result.error = params.get('error')!;
          if (params.has('error_description')) result.error_description = params.get('error_description')!;
          
          popup.close();
          clearInterval(checkClosed);
          resolve(result);
        }
      } catch (e) {
        // Cross-origin error - popup is still on the OAuth provider's domain
        // Continue polling
      }
    }, 1000);

    // Set a timeout to prevent infinite polling
    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
      }
      clearInterval(checkClosed);
      reject(new Error('Authentication timeout - please try again'));
    }, 300000); // 5 minute timeout
  });
}