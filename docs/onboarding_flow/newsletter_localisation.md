# Newsletter Localisation and Updates

Newsletter localisation and general updates is managed in this file:
`src/shared/lib/newsletterConsentsPageLocalisation.ts`

If we do not have CMP permission then we can only localise editorial content (eg. the edition of the main headlines newsletter)

If we have CMP permission then we localise the entire newsletter selection. Non-permissioned users see the UK editorial content plus any selected "consent" sign up, eg. Events emails (`ConsentsOnNewslettersPageMap`)

SSR localisation relies on country code being sent from the client in the `x-gu-geolcation` header (`src/server/lib/getGeolocationRegion.ts`)

---

## Updates

- Newsletter model: `src/shared/model/Newsletter.ts`
- Assets are saved here: `src/client/assets/newsletters/index.ts`
- Clientside rendering is managed here: `src/client/models/Newsletter.ts`

When updating newsletters, id number can be sourced from this tool: https://newsletters-tool.gutools.co.uk/launched/

- Preferred image format: jpg or png
- Preferred image resolution: 800x480 or 800x590
- Image size: ideally under 100kb but webpack image loader will optimize larger images.

_Notes_:

- Always verify the correct image to use, as images on the tool are not always up to date.
- Newsletter data in CODE is not always available or up to dat.

## Testing localisation and updates

Localisation can be tested locally by updating the geolocation header set in the Nginx server configuration, eg. add `proxy_set_header "X-GU-GeoLocation" "US";` to Identity Frontends>server>location / config section and restart nginx. _Note_: this works for localhost but will cause Cypress tests to fail locally.

**Potentially impacted Cypress tests:**

- `cypress/integration/mocked/onboarding_flow.1.cy.ts`
- `cypress/integration/ete-okta/onboarding_flow.5.cy.ts`

- Testing data may need to be updated here:
  - `cypress/support/idapi/newsletter.ts`
  - `cypress/support/pages/onboarding/newsletters_page.ts`

Always check the Review page is also working as expected after localisation or updates.
