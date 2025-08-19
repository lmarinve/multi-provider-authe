# Multi-Provider Authentication Platform

A secure authentication platform that enables users to authenticate with multiple identity providers (CILogon, ORCID, FABRIC) across test and production environments, with seamless token management and backend integration.

**Experience Qualities**:
1. **Trustworthy** - Users must feel confident their authentication data is secure and properly handled
2. **Efficient** - Authentication flows should be streamlined with clear progress indicators and minimal friction
3. **Professional** - Interface should project reliability and competence appropriate for research/academic environments

**Complexity Level**: Light Application (multiple features with basic state)
- Manages authentication state across multiple providers and environments
- Handles complex OAuth/device flows with real-time status updates
- Provides secure token storage and backend integration
- Simple enough to focus on core authentication functionality without overwhelming users

## Essential Features

### Environment Selection
- **Functionality**: Radio button selection between test and production environments
- **Purpose**: Allows users to target the appropriate backend system for their use case
- **Trigger**: User interaction on landing page
- **Progression**: User selects environment → state persists → backend URLs update accordingly
- **Success criteria**: Environment selection persists across sessions and correctly routes backend requests

### Provider Authentication (CILogon)
- **Functionality**: Device flow authentication with verification URL and user code
- **Purpose**: Enables academic/research identity authentication through institutional credentials
- **Trigger**: User clicks "Continue with CILogon" after selection
- **Progression**: Start device flow → display verification URL and user code → poll for completion → store token → redirect to token page
- **Success criteria**: Successfully completes device flow, stores valid token, and displays claims

### Provider Authentication (ORCID)
- **Functionality**: Standard OAuth 2.0 flow with PKCE for researcher identification
- **Purpose**: Authenticates users via their ORCID researcher identifier
- **Trigger**: User clicks "Continue with ORCID" after selection
- **Progression**: Generate PKCE challenge → redirect to ORCID → handle callback → exchange code for token → store token
- **Success criteria**: PKCE flow completes successfully, token is stored, and user is redirected with valid claims

### Provider Authentication (FABRIC)
- **Functionality**: Token creation using existing CILogon authentication
- **Purpose**: Creates FABRIC-specific tokens for infrastructure access
- **Trigger**: User clicks "Continue with FABRIC" after selection
- **Progression**: Check for valid CILogon token → create FABRIC token via API → store token → display success
- **Success criteria**: FABRIC token is created and stored, requires valid CILogon token as prerequisite

### Token Management
- **Functionality**: Display, validate, and manage authentication tokens
- **Purpose**: Allows users to view token details, check expiration, and manage multiple tokens
- **Trigger**: Successful authentication or navigation to token page
- **Progression**: Load stored tokens → validate expiration → display details → provide management actions
- **Success criteria**: Tokens are properly validated, expiration is clearly shown, and management actions work correctly

### Backend Integration
- **Functionality**: Send authentication token to backend API with proper headers and payload
- **Purpose**: Enables integration with downstream services that require the authentication token
- **Trigger**: User clicks "Send token to backend" button
- **Progression**: Validate selected token → construct payload with claims → POST to backend endpoint → display response
- **Success criteria**: Token is sent with correct headers and payload format, backend response is properly handled

## Edge Case Handling

- **Expired Tokens**: Clearly indicate expired tokens and prevent their use for backend requests
- **Network Failures**: Provide informative error messages for network connectivity issues during authentication
- **Invalid Callbacks**: Handle malformed or tampered OAuth callback parameters gracefully
- **Missing Prerequisites**: Guide users when FABRIC authentication requires CILogon token first
- **Browser Storage**: Gracefully handle cases where localStorage is disabled or full
- **Concurrent Sessions**: Handle multiple browser tabs/windows attempting authentication simultaneously

## Design Direction

The design should feel professional and trustworthy, appropriate for academic and research environments where security and reliability are paramount. The interface should be clean and focused, avoiding unnecessary visual elements that might distract from the authentication process. A minimal interface better serves the core purpose by reducing cognitive load and emphasizing the security-critical nature of the authentication flow.

## Color Selection

Complementary (opposite colors) - Using a blue-purple primary palette with warm accent colors to create a professional yet approachable feel that conveys both trust and innovation.

- **Primary Color**: Deep blue (`oklch(0.45 0.15 220)`) - Communicates trust, security, and professionalism
- **Secondary Colors**: Light blue-gray (`oklch(0.95 0.01 240)`) for subtle backgrounds and muted content
- **Accent Color**: Warm orange (`oklch(0.65 0.25 25)`) for important actions and alerts
- **Foreground/Background Pairings**:
  - Background (`oklch(0.98 0.005 240)`): Dark blue text (`oklch(0.13 0.015 240)`) - Ratio 15.8:1 ✓
  - Primary (`oklch(0.45 0.15 220)`): Light text (`oklch(0.98 0.005 240)`) - Ratio 8.2:1 ✓
  - Secondary (`oklch(0.95 0.01 240)`): Dark blue text (`oklch(0.25 0.02 240)`) - Ratio 9.1:1 ✓
  - Accent (`oklch(0.65 0.25 25)`): Light text (`oklch(0.98 0.005 240)`) - Ratio 4.9:1 ✓

## Font Selection

Typography should convey clarity and professionalism while maintaining excellent readability across all authentication flows and technical information display.

- **Typographic Hierarchy**:
  - H1 (Page Titles): System font stack Bold/32px/tight letter spacing
  - H2 (Card Titles): System font stack Semibold/24px/normal letter spacing
  - H3 (Section Headers): System font stack Medium/18px/normal letter spacing
  - Body Text: System font stack Regular/16px/relaxed line height (1.6)
  - Code/Tokens: Monospace font/14px/tracking-wide for verification codes and technical details
  - Captions: System font stack Regular/14px for secondary information

## Animations

Subtle and purposeful animations that enhance usability without calling attention to themselves, appropriate for a professional authentication environment.

- **Purposeful Meaning**: Smooth transitions between authentication states build confidence in the process, while loading animations indicate system activity during network requests
- **Hierarchy of Movement**: 
  - Primary: Authentication flow progress indicators and state transitions
  - Secondary: Button hover states and form interactions
  - Tertiary: Subtle page transitions and card animations

## Component Selection

- **Components**: 
  - Cards for authentication provider selection and token display
  - Radio Groups for environment selection with clear visual hierarchy
  - Buttons with distinct primary/secondary styling for authentication actions
  - Alerts for status messages with appropriate severity levels
  - Progress bars for device flow timing and authentication progress
  - Badges for environment indicators and token status
  - Tooltips for provider descriptions and help text

- **Customizations**: 
  - Custom authentication flow components for device code display
  - Provider-specific icons and branding integration
  - Token validation and expiration indicators

- **States**: 
  - Buttons: Default, hover (subtle elevation), active (pressed), disabled (grayed out), loading (spinner)
  - Cards: Default, hover (subtle border highlight), selected (primary border)
  - Alerts: Info (blue), success (green), warning (orange), error (red)

- **Icon Selection**: 
  - Phosphor Icons for consistent visual language
  - Provider-specific icons (University for CILogon, Fingerprint for ORCID, Shield for FABRIC)
  - System icons for actions (ArrowLeft, Send, Trash, Clock, etc.)

- **Spacing**: 
  - Container padding: 6 units (96px) for page containers
  - Card spacing: 4-6 units between cards
  - Internal spacing: 3-4 units for card content
  - Button spacing: 2-3 units between related actions

- **Mobile**: 
  - Single column layout on mobile devices
  - Touch-friendly button sizes (minimum 44px)
  - Responsive card sizing and padding adjustment
  - Stacked authentication flow components for narrow screens