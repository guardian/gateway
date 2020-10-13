# Development Guide

A list of small guides for common tasks which should help make working on Gateway easier.

## Server Side Rendering (SSR)

All core functionality of Gateway should work without JavaScript enabled. This allows sign in and registration to target most devices/browsers. To this end we render HTML markup on the server using React's `renderToString` method.

The [`renderer`](../src/server/lib/renderer.ts) method abstracts the rendering away from express. Requires a `url` parameter which determines which route that react and react router should render. The second parameter is an optional options object that can be passed in, which is used to manage the global state, pass in query params, and set the HTML page title. More about the Global State in the sections below.

```ts
// example of rendering a route
// normally an enum is used for the url and pageTitle to make it easier to manage in multiple places
// hardcoded for the example
const html: string = renderer('/reset/email-sent', {
  pageTitle: 'Check your inbox',
});

// do stuff with the html markup
// e.g. send to client in express
res.type('html').send(html);
```

When a browser makes a request to gateway, routes must render an output, this goes for all request methods (`GET`, `POST` etc.). This is so that redirects can be avoided since it makes it difficult to persist state, and there are some bugs with redirects on certain browsers and devices.

## Routing

Due to SSR, routing is a bit complicated than simply using client-side routing. We do routing through a combination of Express.js and React Router.

To make it easier to keep track of routes/paths, we define then in a `Routes` enum in the [shared/model/Routes.ts](../src/shared/model/Routes.ts) file. The enum is then consumed by both Express and React Router so we can share the paths between them.

Firstly, for rendering routes on the client, we use React Router's [`StaticRouter`](https://reacttraining.com/react-router/web/api/StaticRouter) in our [server renderer](../src/server/lib/renderer.ts) file, this sets up router which location does not change once rendered (no client-side routing). We add client side routes in the client [routes.tsx](../src/client/routes.tsx) file, which react router looks at to determine what to render for that particular path.

Here's an example of a route, with a component it will render inside that route:

```tsx
...
  <Route exact path={Routes.RESET_RESEND}>
    <ResendPasswordPage />
  </Route>
...
```

To be able to actually access the route that was defined in the client, express on the server also needs to know about the route. All the server routes should be defined in the [`routes`](../src/server/routes) folder.

Routes should be separated into files which share common functionality. For example, functionality relating to sending the reset password email, is in the [`reset.ts`](../src/server/routes/reset.ts) file. The file should export an Express router, which will be consumed by express to register the routes.

Here's an example of a `GET` route, which renders a page and returns it to the client.

```ts
...
const router = Router();
...
// tell express the method (GET)
router.get(
  // on what path/url/route, e.g. /reset
  Routes.GET_ROUTE,
  (_: Request, res: ResponseWithLocals) => {
    // some optional actions/logic here
    ...

    // server side render the html for this route
    const html = renderer(Routes.GET_ROUTE);
    // send html response
    return res.type('html').send(html);
  },
);
...
export default router;
```

Most routes perform some action, and then render something and return it to the user.

To register it with the running express server, import the created express router into the index file:

```ts
...
import { default as reset } from './reset';
...
```

Add to router in that file which will register it with the express server, with any middleware required:

```ts
...
router.use(noCache, queryParamsMiddleware, reset);
...
```

The route should now be accessible.

## State Management

### Global State

Sometimes data is needed by the client to render a specific component, e.g. an error. Using SSR with additional client side hydration we

- pass a state (properties in the [`GlobalState`](../src/shared/model/GlobalState.ts) interface) to the renderer method.
This is passed to the [`Main` app component](../src/client/main.tsx) in React as a prop. 
The `Main` component utilises a [`GlobalStateProvider`](../src/client/components/GlobalState.tsx) which wraps the app with a [Context Provider](https://reactjs.org/docs/context.html)
making it possible to access data further down a component tree without having to manually pass props down at each level. 
- Pass the same data as JSON on the document, and use this for react hydration on the browser. Hydration is executed from the static bundle's entrypoint.


It's then possible to access the state through the [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) hook in a descendent component.

It's possible to populate the state by creating a `GlobalState` object, adding values to it, and passing it to the renderer (example below).

Here's an example of adding some test data to the global state.

Firstly define it in the [`GlobalState`](../src/shared/model/GlobalState.ts) interface. It should be optional property.

```ts
...
export interface GlobalState {
  // other data in the state
  ...
  test?: string;
}
```

On the server, add it to the state somewhere in an express handler, and passing it to the renderer:

```ts
...
// define the state object
const state: GlobalState = {};
...
// add stuff to the test property
state.test = 'This is some test string!';
// or from an variable
state.test = testString;
...
// render and respond with the html and state
const html = renderer('/path', {
  globalState: state,
});
return res.type('html').send(html);
...
```

It's then possible to access it somewhere in the React app using the [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) hook:

```tsx
import React, { useContext } from 'react';
import { GlobalStateContext } from '@/client/components/GlobalState';

// export some react component
export const TestComponent = () => {
  // get the global state from the context
  const globalState: GlobalState = useContext(GlobalStateContext);
  // extract the data we need from the state
  const { test } = globalState;

  // use the test state
  return <h1>{test}</h1>;
  // renders <h1>This is some test string!</h1>
};
```

### Query Params

In some cases, some state may need to persist from request to request, or passed through the request chain, for example the `returnUrl`. Rather than just persist the querystring as is through the flow, a middleware is used to parse the querystring for expected values and use them, this gives control over exactly what query parameters are available and usable.

The [`QueryParams`](../src/shared/model/QueryParams.ts) interface is used to determine which parameters are available. To make sure the query params are parsed, make sure to add the param to the [`parseExpressQueryParams`](../src/server/lib/queryParams.ts) and the [`unit tests`](../src/server/lib/__tests__/queryParams.test.ts) too.

```ts
// src/shared/model/QueryParams.ts
export interface QueryParams {
  returnUrl: string;
  clientId?: string;
  testParam?: string;
}

// src/server/lib/queryParams.ts#
export const parseExpressQueryParams = ({
  returnUrl,
  clientId,
  testParam,
}: {
  returnUrl?: string;
  clientId?: string;
  testParam?: string;
}): QueryParams => {
  return {
    returnUrl: validateReturnUrl(returnUrl),
    clientId: validateClientId(clientId),
    testParam: validateTestParam(testParams), // method to check if the parameter is valid, defined elsewhere
  };
};
```

Then simply include the [`queryParamsMiddleware`](../src/server/lib/middleware/queryParams.ts) on any routes that should parse the querystring.

```ts
// example on all reset password routes
router.use(noCache, queryParamsMiddleware, reset);
```

## Styling

Styling is done in JS (or TSX in our case) using the [Emotion](https://emotion.sh) CSS-in-JS library, which allows for the definitions of styles at the component level, which means once rendered, the html sent to the client only contains the CSS required for that page.

It's also used as [The Guardian Source Design System](https://theguardian.design/) components are built using Emotion too, allowing the use for those components in our project.

Example of styling and adding it to a `p` tag using Emotion and Source:

```tsx
import * as React from 'react';
import { css } from '@emotion/core';
import { textSans } from '@guardian/src-foundations/typography';
import { palette } from '@guardian/src-foundations';

// style the tag using the css string literal
const p = css`
  color: ${palette.neutral[100]};
  margin: 0;
  ${textSans.small()};
`;

// example component with the css attribute to add the styling
export const Text = () => <p css={p}>Some styled text!</p>;
```

Try to keep the styling as close to the component as possible to the component being styled as possible to avoid conflict, and making it easier to change styles on that component in the future.

Shared styles used by multiple components can be added to and imported from the [src/client/styles/Shared.ts](../src/client/styles/Shared.ts) file.

## Environment Variables

As mentioned in the setup guide, some environment variables are required to start the application. However this section focuses on adding or removing an environment variable.

Environment variables appear in a lot of places, so it's likely you'll need to update all these places.

1. `.env` file
   - Determines all the environment variables available on local development
   - Should **not** be committed, gitignored by default.
   - e.g. `ENV_KEY=ENV_VALUE`
2. `.env.example`
   - Example file for `.env` without populated values
   - Should be committed, but make sure not to include any values that should be secret.
   - e.g. `ENV_KEY=`
3. `docker-compose.yml`
   - Since docker can also be used for development, the environment variables must also be defined in this file
   - By default it picks up values from the `.env` file, but they need to be registered under `environment` first.
   - Use the `${...}` syntax to populate the value from the name.
   ```yml
   environment:
     - ENV_KEY=${ENV_KEY}
   ```
4. Configuration and Tests

   - Environment Variables should only be accessible on the server, as not to possibly leak them.
   - To register them with the server, first add it to the [`Configuration`](../src/server/models/Configuration.ts) interface.
   - Next make sure it's exported in the config object in the [`getConfiguration`](../src/server/lib/configuration.ts) method. The `getOrThrow` method makes sure that it's in the environment variables, otherwise the server will not start.
   - Finally fix the [configuration unit tests](../src/server/lib/__tests__/configuration.test.ts).
   - You can then use the `getConfiguration` method to access the environment variable when you need it e.g.

   ```ts
   const { envKey } = getConfiguration();

   // use the envKey
   thisMethodNeedsTheKey(envKey);
   ```

5. Github Actions (`.github/workflows/ci.yaml`)
   - For GitHub Actions CI
   - Add development values to allow tests to pass
   - For secret values, use a fake value
   ```yml
   env:
     ENV_KEY: ENV_VALUE
   ```
6. S3 Config
   - If an environment variable has been changed/added/deleted, it might be useful to update the default S3 private DEV config for the project to help other developers
   - AWS `identity` account, in the `s3://identity-private-config/DEV/identity-gateway/` folder.

## Client Side Scripts

The app itself is server side rendered for browsers not running JavaScript.  We also hydrate the components with react, necessary for interactive components.
Also, there may need to be some scripts that fire on the client side, for example for analytics, or the consents management platform.

To facilitate this, a client bundle is created at build time to the `build/static` folder. This corresponds to the script imported in the [`src/client/static/index.tsx`](../src/client/static/index.tsx) file, with a script tag pointing to the bundle delivered along with the rendered html.

To keep the initial bundle size as small as possible it is beneficial to dynamically import certain scripts depending on conditionals. For example:

```ts
...
// shouldShow returns a boolean to check if we should import the module
if (shouldShow()) {
  // if evaluated to true, import the larger bundle
  // this happens asynchronously, since the import method uses promises
  // in this case since we just need to load the bundle, we don't
  // need to worry about handling the promise
  import('./cmp');
}
...

// it's possible to provide a callback to the import method to run some code
// after it's imported
import('./cmp', (cmp) => {
  // cmp contains exported methods

  // do stuff here e.g.
  cmp.doStuff()
})

// or use the then catch promise methods
import('./cmp')
  .then((cmp) => {
    // cmp contains exported methods

    // do stuff here e.g.
    cmp.doStuff()
  })
  .catch((error) => {
    // error importing module
    console.error(error)
  })

// or even async await syntax
try {
  const cmp = await import('./cmp');
  // cmp contains exported methods
  // do stuff here e.g.
  cmp.doStuff()
} catch (error) {
  // error importing module
  console.error(error)
}
```

## CSP (Content Secure Policy)

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement to distribution of malware.

We use [helmet](https://helmetjs.github.io/docs/csp/) to add the `Content-Security-Policy` header. You can see the middleware configuration in the [`src/server/lib/middleware/helmet.ts`](../src/server/lib/middleware/helmet.ts) file.

Essentially you need to add directives for all the content you're loading on the page. The helmet docs and the [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) docs are super handy for more info.

CSP Violations show up in the browser console, so it's easy to tell if theres a violation of the policy. Here's an example screenshot.

_ADD CSP VIOLATION SCREENSHOT_
