# AtlanticWave-SDX Multi Provider Authentication - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: Provide a secure, user-friendly authentication gateway that enables researchers to access SDX services using their preferred identity provider (CILogon or ORCID) across test and production environments.

**Success Indicators**: 
- Successful token acquisition and backend handoff for both identity providers
- Zero token leakage or security vulnerabilities
- Clear user experience with minimal confusion during provider selection
- Seamless integration with existing SDX backend infrastructure

**Experience Qualities**: Professional, Trustworthy, Efficient

## Project Classification & Approach

**Complexity Level**: Light Application (multiple features with basic state management)

**Primary User Activity**: Acting - Users authenticate to obtain tokens for backend services

## Essential Features

### Environment Selection
- **Functionality**: Radio button selection between test and production environments
- **Purpose**: Ensures tokens are directed to the appropriate backend infrastructure
- **Success Criteria**: Selected environment persists across sessions and correctly targets backend URLs

### Identity Provider Selection
- **Functionality**: Two distinct authentication pathways with provider-specific flows
- **Purpose**: Accommodates different institutional and research identity preferences
- **Success Criteria**: Each provider successfully returns valid JWT tokens

### Token Management
- **Functionality**: Secure storage, display of token information, automatic refresh, and backend handoff
- **Purpose**: Provides users with token details, maintains valid tokens, and enables backend integration
- **Success Criteria**: Tokens stored securely with automatic refresh before expiry and clear status information

### Automatic Token Refresh
- **Functionality**: Background monitoring and automatic refresh of tokens before expiry
- **Purpose**: Maintains seamless user experience by preventing token expiration interruptions
- **Success Criteria**: Tokens refreshed automatically 5 minutes before expiry with user notifications

### Identity Provider Support
- **CILogon**: Academic and research identity federation using device flow
- **ORCID**: Persistent researcher identifiers with PKCE OAuth flow

### Connection Services (Post-Authentication)
- **FABRIC API**: Research infrastructure connection services that use CILogon tokens
- **MEICAN**: Inter-domain circuit activation services that use identity provider tokens

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence with research institution credibility
- **Design Personality**: Clean, modern, trustworthy - reflecting enterprise-grade security
- **Visual Metaphors**: Digital identity, secure connections, research networks
- **Simplicity Spectrum**: Minimal interface that prioritizes clarity over decoration

### Color Strategy
- **Color Scheme Type**: Complementary with blue primary and neutral supporting colors
- **Primary Color**: Professional blue (oklch(0.45 0.15 220)) - conveys trust and technology
- **Secondary Colors**: Light grays and whites for clean backgrounds
- **Accent Color**: Subtle blue variations for interactive elements
- **Color Psychology**: Blues establish trust and professionalism, grays provide calm neutrality
- **Foreground/Background Pairings**: 
  - Primary blue on white: AA compliant for buttons
  - Dark gray on light backgrounds: AA+ compliant for body text
  - White on blue backgrounds: AA compliant for button text

### Typography System
- **Font Pairing Strategy**: Single family (Inter) with varied weights for hierarchy
- **Typographic Hierarchy**: Bold headings, medium sub-headings, regular body text
- **Font Personality**: Inter - modern, highly legible, professional
- **Which fonts**: Inter (Google Fonts) - chosen for excellent screen readability
- **Legibility Check**: Inter maintains excellent legibility at all sizes with clear character distinction

### Visual Hierarchy & Layout
- **Attention Direction**: Logo and title → environment selection → provider cards → action button
- **White Space Philosophy**: Generous spacing around key elements to reduce cognitive load
- **Grid System**: Single column layout with consistent card-based components
- **Content Density**: Minimal density to focus attention on critical decisions

### UI Elements & Component Selection
- **Component Usage**: 
  - Cards for major sections (environment, providers)
  - Radio buttons for exclusive selections
  - Large buttons for provider selection with descriptive content
  - Badges for environment indicators
  - Progress indicators for authentication flows

### Brand Integration
- **SDX Logo**: Circular gradient design prominently displayed with application title
- **Provider Branding**: Consistent iconography (University, Fingerprint, Shield) with color coding
- **Visual Consistency**: Unified card-based layout with consistent spacing and typography

## Provider Information

### CILogon
- **Description**: Academic and research identity federation
- **Flow**: Device code authentication with polling
- **Icon**: University building (representing academic institutions)

### ORCID  
- **Description**: Persistent identifiers for researchers, enabling transparent connections between researchers, their contributions, and affiliations
- **Details**: Provides unique, persistent identifier free of charge to researchers with APIs for interoperability between ORCID records and member organizations
- **Flow**: PKCE OAuth with browser redirect
- **Icon**: Fingerprint (representing unique identity)

### FABRIC API
- **Description**: Adaptive programmable research infrastructure for networking, cybersecurity, distributed computing, and science applications  
- **Details**: International infrastructure enabling cutting-edge experimentation and research at-scale across 29 sites with distributed compute, storage, and high-speed optical connections
- **Flow**: Token creation requiring prior CILogon authentication
- **Icon**: Shield (representing infrastructure security)

## Implementation Considerations

**Scalability Needs**: Designed to easily add new identity providers through consistent adapter pattern

**Security Focus**: 
- No client secrets in browser code
- Tokens stored only in localStorage with automatic refresh capability
- Secure token handoff with proper HTTP headers
- Clear token lifecycle management with expiry monitoring
- Automatic refresh tokens prevent service interruption

**Token Refresh System**:
- Background monitoring checks token expiry every minute
- Automatic refresh attempts 5 minutes before expiry
- Visual indicators show refresh status and token health
- Graceful handling of refresh failures with user notifications
- Support for provider-specific refresh mechanisms

**Critical Questions**: 
- Token refresh strategies for long-running sessions
- Error handling for network interruptions during authentication flows
- Graceful degradation when providers are unavailable

## Edge Cases & Problem Scenarios

**Provider Unavailability**: Clear error messages with suggested alternatives
**Token Expiry**: Automatic detection and re-authentication prompts  
**Network Issues**: Retry mechanisms with exponential backoff
**Invalid Configurations**: Environment variable validation with helpful error messages

## Reflection

This solution uniquely addresses the multi-institutional nature of research computing by supporting the three primary identity ecosystems researchers use. The clean, professional interface builds trust while the technical implementation ensures enterprise-grade security standards.