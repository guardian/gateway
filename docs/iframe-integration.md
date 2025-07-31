# Iframe Integration Guide for Guardian Gateway

This guide explains how to adapt the Guardian Gateway project to run web pages and endpoints in an iframe on other websites.

## Overview

The Guardian Gateway is a server-side rendered React application for authentication and user registration. To make it work within an iframe, several security and compatibility modifications are required.

## Key Modifications Made

### 1. Content Security Policy (CSP) Changes

**File**: `src/server/lib/middleware/helmet.ts`

The most critical change is modifying the `frameAncestors` directive in the CSP to allow embedding:

```typescript
// Before: frameAncestors: [HELMET_OPTIONS.NONE]
frameAncestors: getAllowedFrameAncestors(),
```

The `getAllowedFrameAncestors()` function reads from environment variables to determine which domains can embed the application.

Additional changes include:

- Added `connectSrc` directive includes `...getAllowedFrameAncestors()` to allow iframe origins to make API requests
- Added `HELMET_OPTIONS.SELF` to `connectSrc` for same-origin requests

### 2. Iframe Detection and Cookie Compatibility

**File**: `src/server/lib/middleware/iframe.ts` (new file)

Two new middleware functions handle iframe-specific requirements:

- `iframeCompatibilityMiddleware`: Detects iframe requests via headers (`sec-fetch-dest: iframe` or `x-iframe-request: true`) and sets `X-Frame-Options: SAMEORIGIN`
- `iframeCookieMiddleware`: Modifies cookie settings for cross-site compatibility by overriding the response.cookie method

## Required Environment Variables

Add these to your environment configuration:

```bash
# Comma-separated list of domains allowed to embed the gateway in iframes
ALLOWED_IFRAME_DOMAINS=https://example.com,https://trusted-partner.com,https://*.mydomain.com
```

## Key Challenges and Solutions

### 1. Cross-Site Cookie Issues

**Problem**: Browsers block third-party cookies by default, which breaks authentication in iframes.

**Solution**:

- Set `SameSite=None` and `Secure=true` for cookies when in iframe context
- The `iframeCookieMiddleware` automatically handles this

### 2. CSRF Protection

**Problem**: The existing CSRF middleware uses signed cookies with `SameSite=lax`, which doesn't work in iframes.

**Current Implementation**:

- Uses existing CSRF middleware with standard token validation
- Works with iframe cookie middleware to ensure cross-site cookie compatibility

**Potential Issues**:

- CSRF tokens might not work properly in cross-origin iframes
- Consider using alternative CSRF protection for iframe requests

### 3. Authentication State Management

**Problem**: The application relies heavily on cookies for state management:

- `idx` cookie for Okta sessions
- `GU_GATEWAY_STATE` encrypted state cookie
- Various IDAPI cookies (`SC_GU_U`, `SC_GU_LA`, etc.)

**Solution**:

- Modified cookie middleware ensures cross-site compatibility
- All cookies are automatically set with `SameSite=None; Secure` in iframe context
- Iframe detection happens via request headers rather than manual configuration

### 4. External Redirects

**Problem**: OAuth flows and external redirects (Okta, Google, Apple) won't work properly in iframes.

**Considerations**:

- OAuth providers may block iframe embedding
- Social sign-in buttons may need to open in popup windows
- Consider implementing postMessage communication with parent window

## Implementation Steps

### 1. Apply the Middleware

Add the iframe middleware to your middleware chain in `src/server/lib/middleware/index.ts`:

```typescript
import {
	iframeCompatibilityMiddleware,
	iframeCookieMiddleware,
} from './iframe';

// Apply early in the middleware chain
server.use(iframeCompatibilityMiddleware);
server.use(iframeCookieMiddleware);
```

### 2. Configure Environment

Set the `ALLOWED_IFRAME_DOMAINS` environment variable with trusted domains.

### 3. Test Cross-Site Functionality

Create test pages to verify:

- Authentication flows work in iframe
- Cookies are properly set and read
- CSRF protection functions correctly
- Form submissions work

### 4. Handle OAuth Flows

Consider implementing popup-based OAuth flows for iframe context:

```javascript
// Example: Detect iframe and use popup for OAuth
if (window !== window.top) {
	// We're in an iframe, use popup for OAuth
	window.open('/signin/google', 'oauth', 'width=500,height=600');
} else {
	// Normal redirect
	window.location.href = '/signin/google';
}
```

## Security Considerations

### 1. Clickjacking Protection

- Only allow trusted domains in `ALLOWED_IFRAME_DOMAINS`
- Consider implementing additional frame-busting techniques

### 2. Origin Validation

- Validate the `Origin` header for iframe requests
- Implement additional checks for sensitive operations

### 3. Cross-Site Request Forgery

- Current CSRF implementation may need iframe-specific handling
- Consider using origin-based CSRF protection for iframe requests

### 4. Session Security

- Monitor for session hijacking attempts
- Implement additional logging for iframe-based authentication

## Testing

### Local Development

1. Create a test HTML file or use the provided test page at `/static/iframe/iframe-test.html`:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Iframe Test</title>
	</head>
	<body>
		<h1>Parent Page</h1>
		<iframe
			src="http://localhost:8861/signin"
			width="100%"
			height="600"
			frameborder="0"
		>
		</iframe>
	</body>
</html>
```

2. Set environment variables:

```bash
ALLOWED_IFRAME_DOMAINS=http://localhost:*,https://localhost:*
```

3. Start the development server:

```bash
make dev
```

4. Visit the test page at `http://localhost:8861/static/iframe/iframe-test.html` and test authentication flows.

### Production Testing

- Test with actual partner domains
- Verify HTTPS requirements are met
- Monitor for any console errors or blocked requests

## Limitations and Known Issues

1. **Social Sign-in**: OAuth providers may block iframe embedding
2. **Browser Compatibility**: Some older browsers have stricter iframe policies
3. **Privacy Settings**: Users with strict privacy settings may block third-party cookies
4. **Mobile Safari**: Has additional restrictions on cross-site cookies

## Alternative Approaches

If iframe integration proves problematic, consider:

1. **Popup Windows**: Open authentication in popup windows
2. **Redirect Integration**: Use redirects with return URLs
3. **API-Only Integration**: Provide headless authentication APIs
4. **Subdomain Deployment**: Deploy on a subdomain of the parent site

## Monitoring and Debugging

Add logging to track iframe-specific behavior:

```typescript
// In your middleware
if (req.isIframeRequest) {
	logger.info('Iframe request detected', {
		origin: req.headers.origin,
		referer: req.headers.referer,
		userAgent: req.headers['user-agent'],
	});
}
```

Monitor for:

- Failed authentication attempts in iframe context
- Cookie-related errors
- CSRF token validation failures
- Cross-origin request blocks

## Testing Resources

The project includes several testing resources:

- **Test Page**: `src/client/static/iframe/iframe-test.html` - Interactive test page with dual iframe setup
- **Test Script**: `src/client/static/iframe/iframe-test-script.js` - JavaScript functions for testing iframe functionality
- **Cypress Tests**: `cypress/integration/iframe.cy.ts` - Automated tests for iframe integration

To access the test page during development, visit: `http://localhost:8861/static/iframe/iframe-test.html`
