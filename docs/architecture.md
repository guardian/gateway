# Architecture

## Overview

Gateway is the new frontend to login and registration at the Guardian through [profile.theguardian.com](https://profile.theguardian.com).

## Motivation

Currently this functionality (referred to as identity-frontend) is split between [guardian/identity-frontend](https://github.com/guardian/identity-frontend/) and [guardian/frontend/identity](https://github.com/guardian/frontend/tree/master/identity).

The split over two projects is a cause of confusion and has happened as part of an incomplete migration. The state of identity-frontend is considered poor from a health point of view, with work on it taking longer than should be needed.

Furthermore, it is the case that new features cannot be developed on it due to the poor state of the applications, notably any modifications to the sign up flow.

Many other client side applications at the Guardian now are React app based, which allows for easier code reuse and knowledge sharing.

## Technology

Gateway is primarily a [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/), and [Express.js](https://expressjs.com/) application, utilising [the Guardian Source Design System](https://theguardian.design/) components, and [Emotion](https://emotion.sh) CSS-in-JS library for UI/design. We use [Jest](https://jestjs.io/) for unit testing, and [Cypress](https://www.cypress.io/) for integration tests and E2E tests.

We also heavily integrate with [Okta Customer Identity Solution](https://okta.com), who is our Identity backend and provider, and their APIs. For documentation on how we interact with Okta, see the [Okta Documentation](./okta) folder, and specific documentation on the new(er) [Okta IDX API](./okta/idx/README.md).

## Browser Support

**Our core line in the sand is that core functionality and features must NOT require any client-side JavaScript.** To this end Gateway is set up as a completely SSR (Server-side Rendered) React application.

This has the added benefit that since we're only serving HTML, we can target a wider range of browsers compared to doing client side hydration, pretty much any browser thats supports [TLS 1.2](https://caniuse.com/#feat=tls1-2) will get functional support. As far as styling/css go, we target the recommended browsers from [guardian/dotcom-rendering](https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/docs/principles/browser-support.md#browser-support-principles).

However there will be some JavaScript code that needs to run client side, such as for analytics, consent etc. And hydration can be used to enhance functionality for the user.

The no JavaScript principle has been violated since including reCAPTCHA on many of the forms to prevent bot attacks. However we still stick to this principle regardless for the reasons above, and in case we find a different solution to using reCAPTCHA in the future.

Development principles can be found in [development.md](development.md).

## Structure

```
gateway
├── docs                - Documentation folder
├── cypress             - Cypress Tests
└── src                 - Main Application Folder
    └── client          - Client side React application
        └── components  - Reusable React components
        └── lib         - services/helper code
        └── models      - ts interfaces/enums
        └── pages       - React page components/markup
        └── styles      - Specific shared css styles
        └── static      - Client side bundled code (e.g. analytics)
    └── server          - Server Express App
        └── lib         - Business logic/services
        └── models      - ts interfaces/enums
        └── routes      - Express.js routes/route logic
    └── shared          - Shared code
        └── lib         - services/helper code shared between server and client
        └── models      - ts interfaces/enums shared between server and client
    └── email           - Transactional email service and email templates
        └── components  - Reusable email components using mjml-react
        └── lib         - Business logic/services related to emails
        └── templates   - Email templates in mjml-react and plain text forms
```
