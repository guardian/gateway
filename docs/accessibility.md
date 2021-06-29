# Accessibility

## Overview

We want to ensure our site https://profile.theguardian.com is accessible to everyone including users with visual, motor, hearing and cognitive
impairments that may be permanent, temporary or situational.

You can find more advice and recommendations here: https://github.com/guardian/recommendations/blob/master/accessibility.md

As well as the design system guidelines here: https://theguardian.design/2a1e5182b/p/6691bb-accessibility

## Testing with tooling

The simplest way to improve accessibility throughout the site is to use the tools that we've included in this project.

### ESLint Plugin JSX A11y

Implement [eslint-plugin-jsx-a11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) into our linter (ESLint) so that a number of accessibility standards can be checked.

The rules that are checked are listed on the project link.

To test run `yarn lint` or using the ESLint VSCode plugin will highlight issues directly in the editor.

CI builds will fail unless all linting error are dealt with.

### Axe with Cypress

[Axe](https://github.com/dequelabs/axe-core) is an accessibility testing engine for websites and other HTML-based user interfaces.

[Cypress](https://www.cypress.io/) is the E2E and integration testing tool that we use in this project.

Combinding the two together results in [cypress-axe](https://github.com/component-driven/cypress-axe) which allows automated testing of accessibility tests using Axe directly as a test in Cypress.

This makes it easy to check for accessibility as part of the automated CI tests, some of which may not have been picked up by the linter.

To test the accessibility using this tool on a specific page in a cypress test is simple. In a given test file:

```js
// import the axe check
import { injectAndCheckAxe } from '../support/cypress-axe';

...

// go to a page and test the accessibility on a given page
it('Has no detectable a11y violations on change password page', () => {
  cy.mockNext(200);
  cy.mockNext(200, fakeSuccessResponse);
  page.goto(fakeToken);
  // this is the test
  injectAndCheckAxe();
});

```

When running cypress visually using `./cypress-open.sh` and running a test, a failed a11y test would appear like so:

![vcxsrv_6AJITLSUJD](https://user-images.githubusercontent.com/13315440/101000467-dbbcae00-3555-11eb-9ebb-28341f4c544b.png)

While running in CI a violation would look like:

![WindowsTerminal_05gOduN2MS](https://user-images.githubusercontent.com/13315440/101000507-e8d99d00-3555-11eb-8f8b-bb8c30e70c2d.png)

## Manual testing

Automated accessibility audits are not exhaustive, so it's important to incorporate manual testing into your
development practices. Google offers some excellent guidelines on how to conduct a manual accessibility review:
https://developers.google.com/web/fundamentals/accessibility/how-to-review (the video is 12 mins and worth watching).

Steps for completing a manual review can be summarised as follows:

- Run a Lighthouse test (https://github.com/GoogleChrome/lighthouse) on every page
  - You can use Lighthouse directly in Chrome developer tools Lighthouse checks for various issues such as whether a page is likely to work with a screen reader and if there is sufficient contrast between colours for those that are partially sighted.
- Make sure you can tab through the page:
  - there should be a clear focus ring around the selected elements as you tab
  - the tab order of the focused elements should match the page structure
  - you should be able to reach all interactive elements (including dynamic elements and pop-ups)
  - there should be no off-screen/hidden content that can be accidentally focused. Check display at various widths, for
    example: menus that are hidden for mobile view
- Navigate the page using a screen reader:
  - common screen readers include NVDA (Windows) and VoiceOver (Mac). Working with a screen reader may take
    a little getting used to, but it's worth taking the time to familiarise yourself with at least one of these
  - do images have alt text? If not, many screen readers will read the name of the image file by default
  - are buttons and interactive elements compatible with screen readers?
  - are screen readers notified of popup content? (eg, by directing the focus of the screen reader to the element)
- Check the page structure:
  - are header tags applied to logically structure the content of the page? (and not just to add style and size to the
    visual layout)
  - are landmark elements used? eg banner, navigation, search, main
    (https://www.w3.org/TR/wai-aria-practices/examples/landmarks/HTML5.html)
- Check the colour and contrast of elements:
  - low contrast elements can be difficult or impossible to distinguish for partially sighted users.
  - you can use a browser extension to check this, popular tools include axe - Web Accessibility Testing by deque and
    Lighthouse by Google, both available in Chrome

## The Future

Let's involve a more diverse range of people to complete manual accessibility audits for our site! We already do robust UX testing, so incorporating accessibility into this seems like an achievable aim and how better to know how our website is performing than to ask our users.

Let's train our developers to make accessibility checks a natural, habitual part of the development process. The first time using a screen reader can be frustrating and off-putting, so providing sufficient training and emphasising the importance of universal accessibility will make this a more central aspect of how we work.
