# Summary: Guardian Gateway Iframe Integration

## Overview

This document summarizes the changes required to adapt the Guardian Gateway project to run web pages and endpoints in iframes on other websites.

## Files Modified

### 1. `/src/server/lib/middleware/helmet.ts`

- **Change**: Modified `frameAncestors` CSP directive from `[HELMET_OPTIONS.NONE]` to `getAllowedFrameAncestors()`
- **Change**: Added `connectSrc` directive includes `HELMET_OPTIONS.SELF` and `...getAllowedFrameAncestors()`
- **Purpose**: Allow specific domains to embed the application in iframes and make API requests
- **Function Added**: `getAllowedFrameAncestors()` reads from `ALLOWED_IFRAME_DOMAINS` environment variable

### 2. `/src/server/lib/middleware/iframe.ts` (New File)

- **Purpose**: Handle iframe detection and cookie compatibility
- **Middleware Functions**:
  - `iframeCompatibilityMiddleware`: Detects iframe requests via headers
  - `iframeCookieMiddleware`: Modifies cookie settings for cross-site compatibility
- **Key Features**:
  - Sets `SameSite=None` and `Secure=true` for cookies in iframe context
  - Adds iframe request tracking to request object

### 3. `/src/server/lib/middleware/index.ts`

- **Change**: Added iframe middleware to the middleware chain
- **Order**:
  1. `iframeCompatibilityMiddleware` (early detection)
  2. `iframeCookieMiddleware` (after cookie parser)

### 4. `/docs/iframe-integration.md` (New File)

- **Purpose**: Comprehensive guide for iframe integration
- **Contents**: Implementation steps, security considerations, testing instructions

### 5. `/src/client/static/iframe/iframe-test.html` (New File)

- **Purpose**: Test page for validating iframe functionality
- **Features**: Dual iframe setup (signin/register), automated testing buttons, debugging instructions
- **Location**: Served at `/static/iframe/iframe-test.html`
- **Note**: No CSP meta tag - relies on server-side helmet middleware CSP configuration

## Environment Configuration Required

Add to your environment variables:

```bash
ALLOWED_IFRAME_DOMAINS=https://example.com,https://trusted-partner.com,https://*.mydomain.com
```

For development:

```bash
ALLOWED_IFRAME_DOMAINS=http://localhost:*,https://localhost:*
```

## Key Technical Changes

### Security Headers

- **CSP frameAncestors**: Now configurable via environment variables
- **CSP connectSrc**: Includes `'self'` and allowed frame ancestors for API requests
- **Cookie Settings**: Automatic `SameSite=None; Secure` for iframe contexts
- **Origin Validation**: Built into iframe detection middleware
- **X-Frame-Options**: Set to `SAMEORIGIN` for iframe requests

### Cookie Compatibility

- **Cross-Site Cookies**: Enabled for iframe requests via `SameSite=None; Secure`
- **CSRF Protection**: Maintained with existing CSRF middleware approach
- **Session Management**: Compatible with cross-origin scenarios via iframe cookie middleware

## Testing Instructions

1. **Set Environment Variables**:

   ```bash
   export ALLOWED_IFRAME_DOMAINS="http://localhost:*,https://localhost:*"
   ```

2. **Start the Server**:

   ```bash
   make dev
   ```

3. **Open Test Page**:
   Visit `http://localhost:8861/static/iframe/iframe-test.html`

4. **Verify Functionality**:
   - Check browser console for CSP violations
   - Test form submissions within iframes
   - Verify authentication flows work
   - Confirm cookies are set correctly

## Security Considerations

### Implemented Protections

- **Domain Allowlisting**: Only specified domains can embed iframes
- **CSRF Protection**: Maintained via signed cookies and HMAC validation
- **Secure Cookies**: Automatic HTTPS requirement for cross-site cookies

### Recommended Additional Measures

- **Origin Header Validation**: Verify request origin matches expected domains
- **Rate Limiting**: Monitor for unusual iframe-based request patterns
- **Audit Logging**: Track iframe authentication attempts
- **Session Monitoring**: Watch for potential session hijacking

## Known Limitations

### OAuth/Social Sign-in

- **Issue**: OAuth providers may block iframe embedding
- **Solution**: Consider popup-based authentication flows
- **Alternative**: Redirect-based integration with return URLs

### Browser Compatibility

- **Third-Party Cookies**: Some browsers block by default
- **Privacy Settings**: Users may disable cross-site cookies
- **Mobile Safari**: Additional restrictions on cross-site cookies

### HTTPS Requirements

- **SameSite=None**: Requires secure connections
- **Development**: May need local HTTPS setup for full testing
- **Production**: Must be deployed with valid SSL certificates

## Alternative Integration Approaches

If iframe integration proves problematic:

1. **Popup Windows**: Open authentication in popup windows
2. **Redirect Integration**: Use redirects with return URLs
3. **API-Only**: Provide headless authentication APIs
4. **Subdomain Deployment**: Deploy on subdomain of parent site
5. **Postmessage Communication**: Use cross-frame messaging

## Monitoring and Debugging

### Logging

Monitor for:

- Iframe request patterns
- Cookie-related errors
- CSRF validation failures
- Cross-origin blocks

### Browser DevTools

Check for:

- CSP violations in console
- Network request headers
- Cookie attributes and values
- Security warnings

## Production Deployment Checklist

- [ ] Set `ALLOWED_IFRAME_DOMAINS` environment variable
- [ ] Test with actual partner domains
- [ ] Verify HTTPS requirements are met
- [ ] Monitor authentication success rates
- [ ] Set up alerting for iframe-related errors
- [ ] Document integration requirements for partners
- [ ] Test with various browsers and privacy settings
- [ ] Verify social sign-in flows (may need popup handling)

## Support for Partner Integration

### For Partner Developers

Provide documentation on:

- Required iframe attributes (`sandbox`, `allow` directives)
- Postmessage API for cross-frame communication
- Error handling and fallback mechanisms
- Testing procedures and requirements

### Example Integration Code

```html
<iframe
	src="https://profile.theguardian.com/signin"
	sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
	allow="camera; microphone"
	width="100%"
	height="600"
>
</iframe>
```

This implementation provides a secure and flexible foundation for iframe integration while maintaining the security and functionality of the Guardian Gateway authentication system.
