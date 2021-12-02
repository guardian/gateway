# Development Guide

A list of small guides for common tasks which should help make working on Gateway easier.

## Server Side Rendering (SSR)

All core functionality of Gateway should work without JavaScript enabled. This allows sign in and registration to target most devices/browsers. To this end we render HTML markup on the server using React's `renderToString` method.

The [`renderer`](../src/server/lib/renderer.ts) method abstracts the rendering away from express. Requires a `url` parameter which determines which route that react and react router should render. The second parameter is an optional options object that can be passed in, which is used to manage the client state, pass in query params, and set the HTML page title. More about the Client State in the sections below.

```ts
// example of rendering a route
// normally an enum is used for the url and pageTitle to make it easier to manage in multiple places
// hardcoded for the example
const html: string = renderer('/reset/email-sent', {
  pageTitle: 'Check your inbox',
  requestState: res.locals,
});

// do stuff with the html markup
// e.g. send to client in express
res.type('html').send(html);
```

When a browser makes a request to gateway, routes must render an output, this goes for all request methods (`GET`, `POST` etc.). This is so that redirects can be avoided since it makes it difficult to persist state, and there are some bugs with redirects on certain browsers and devices.

## Routing

Due to SSR, routing is a bit complicated than simply using client-side routing. We do routing through a combination of Express.js and React Router.

To make it easier to keep track of routes/paths, we define then in a `Routes` types in the [shared/model/Routes.ts](../src/shared/model/Routes.ts) file. The type is then consumed by both Express and React Router so we can share the paths between them.

Firstly, for rendering routes on the client, we use React Router's [`StaticRouter`](https://reacttraining.com/react-router/web/api/StaticRouter) in our [server renderer](../src/server/lib/renderer.tsx) file, this sets up router which location does not change once rendered (no client-side routing). We add client side routes in the client [routes.tsx](../src/client/routes.tsx) file, which react router looks at to determine what to render for that particular path.

We also use typed routes. This enforces type safety when added new routes. In the [server renderer](../src/server/lib/renderer.tsx) We have a helper component called `<TypedRoute>`. This component requires the `path` attribute to be of type [`RoutePaths`](../src/shared/model/Routes.ts) and therefore only accepts strings that are part of the `RoutePaths` type. To add a new route you need to add another entry in the [`RoutePaths`](../src/shared/model/Routes.ts) type.

Here's an example of a route, with a component it will render inside that route:

```tsx
...
  <TypedRoute exact path={'/reset'}>
    <ResendPasswordPage />
  </TypedRoute>
...
```

To be able to actually access the route that was defined in the client, express on the server also needs to know about the route. All the server routes should be defined in the [`routes`](../src/server/routes) folder.

Routes should be separated into files which share common functionality. For example, functionality relating to sending the reset password email, is in the [`reset.ts`](../src/server/routes/reset.ts) file. The file should export an Express router, which will be consumed by express to register the routes.

We also support typed routes here too, using the [`typedRoutes` component](../src/server/lib/typedRoutes.ts)

Here's an example of a `GET` route, which renders a page and returns it to the client.

```ts
...
import { typedRouter as router } from '@/server/lib/typedRoutes';
...
// tell express the method (GET)
router.get(
  // on what path/url/route, e.g. /reset
  '/reset', //note this is a typed route of type RoutePaths
  (_: Request, res: ResponseWithRequestState) => {
    // some optional actions/logic here
    ...

    // server side render the html for this route
    const html = renderer(Routes.GET_ROUTE);
    // send html response
    return res.type('html').send(html);
  },
);
...
export default router.router;
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

### Async routes error handling

When writing async routes, wrap the handler in the helper function `handleAsyncErrors`

E.g.

```ts
import { handleAsyncErrors } from '@/server/lib/expressWrappers';

router.get(
  '/route',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    ...
  }),
);
```

`handleAsyncErrors` calls `next()` when the router async handler function fails. This invokes the default error handler, logging the error and returning an error page.

#### Why?

In Express 4, async handlers which fail to call next() (or specific functions on the response) leave the TCP connection open (indicating a leak) and don't return any data.

## Developing Components/Pages using Storybook

[Storybook](https://storybook.js.org/) is a tool for building UI components and pages in isolation. This means you don't have to run the server, and set up any route or state to develop components/pages/emails in Gateway.

You can run Storybook by

```sh
$ yarn storybook
```

Which will compile the project and start storybook. Any changes you make will be automatically reloaded in Storybook too.

To make a new story, simply make a new `*.stories.tsx` file in the same folder as your component. For example:

```tsx
// ErrorSummary.stories.tsx

import React from 'react';
import { Meta } from '@storybook/react';

// import the react component
import { ErrorSummary } from './ErrorSummary';

// export metadata about the component
export default {
  title: 'Components/ErrorSummary',
  component: ErrorSummary,
} as Meta;

// export a story
export const Default = () => <ErrorSummary error="There has been an error" />;
Default.storyName = 'default';

// export another story
export const WithContext = () => (
  <ErrorSummary
    error="There has been an error"
    context="Here's some more information about this error"
  />
);
WithContext.storyName = 'withContext';
```

Each story has to export a default metadata object with information on the title and component which is visible in storybook:

```tsx
export default {
  title: 'Components/ErrorSummary',
  component: ErrorSummary,
} as Meta;

/**
 * Title Format:
 * Component        -> 'Components/ComponentName'
 * Page             -> 'Pages/PageName
 * Email Component  -> 'Email/Components/',
 * Email Template   -> 'Email/Templates/TemplateName'
 **/
```

You also have to return at least one "story" from the file too, which is a function that returns the react component/page, as well as a "storyName" for that story:

```tsx
export const Default = () => <ErrorSummary error="There has been an error" />;
Default.storyName = 'default';
```

You can export multiple stories from each file, for example to show how the component/page changes depending on different props/state.

## State Management

### Request State Locals and Client State

Sometimes data is needed by the client to render a specific component, e.g. an error. Using SSR with additional client side hydration we

- build a state on the server using Express' [`res.locals`](https://expressjs.com/en/api.html#res.locals) property using the [`RequestState`](../src/server/models/Express.ts) interface.
- pass this into the [`renderer`](../src/server/lib/renderer.ts) method, the renderer will then build the `ClientState` to be passed to the client using `clientStateFromRequestStateLocals`
  - The [`ClientState`](../src/shared/model/ClientState.ts) interface is used to type what is sent to the client.
- This is passed to the [`Main` app component](../src/client/main.tsx) in React as a prop.
- The `Main` component utilises a [`ClientStateProvider`](../src/client/components/ClientState.tsx) which wraps the app with a [Context Provider](https://reactjs.org/docs/context.html)
  making it possible to access data further down a component tree without having to manually pass props down at each level.
- Pass the same data as JSON on the document, and use this for react hydration on the browser. Hydration is executed from the static bundle's entrypoint.

It's then possible to access the state through the [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) hook in a descendent component.

Here's an example of adding some test data to the client state.

Firstly define it in the [`RequestState`](../src/server/models/Express.ts) interface. It can be optional or required property. It's also helpful to set a sensible default value in `getDefaultRequestState` method if it needs to be defined.

```ts
...
export interface RequestState {
  // other data in the state
  ...
  test: string;
}

export const getDefaultRequestState = (): RequestState => ({
  // other data in the default state
  ...
  test: 'value'
});
```

This is added to `res.locals` **ONLY** in `requestStateMiddleware`.

Make sure the state addition does not in anyway remember state between requests, for example **DO NOT USE** the singleton pattern/export raw object literals.

Object mutation will be disabled via linting in the near future.

Next make it available in the [`ClientState`](../src/shared/model/ClientState.ts) interface, if you want it accessible on the client. It should be optional property, as the client can never be sure that the property will exist.

```ts
...
export interface ClientState {
  // other data in the state
  ...
  test?: string;
}
```

In the `renderer` method, if you want the value accessible on the client, add it to `clientStateFromRequestStateLocals` method:

```ts
const clientStateFromRequestStateLocals = ({
  ...
  test, // destructuring test from locals
} = defaultLocals): ClientState => {
  const client: ClientState = {
    ...
    test, // add it to the client state
  };
  ...
  return client;
};
```

It's then possible to access it somewhere in the React app using the [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) hook:

```tsx
import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';

// export some react component
export const TestComponent = () => {
  // get the client state from the context
  const clientState: ClientState = useContext(ClientStateContext);
  // extract the data we need from the state
  const { test } = clientState;

  // use the test state
  return <h1>{test}</h1>;
  // renders <h1>This is some test string!</h1>
};
```

In most cases you want to `useContext` outside a presentation component, and pass in the values you need as a prop to the component. This allows us to independently render this component in tests/storybook without relying on the rest of the app and state.

Here's a contrived example:

```tsx
// container component
import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';

// export some react component
export const TestContainer = () => {
  // get the client state from the context
  const clientState: ClientState = useContext(ClientStateContext);
  // extract the data we need from the state
  const { test } = clientState;

  // use the test state
  return <TestComponent foo={test} />;
};

// presentation component
import React from 'react';

interface Props {
  foo: string;
}

export const TestComponent = ({ foo }: Props) => {
  return <h1>{foo}</h1>;
};
```

### Query Params

In some cases, some state may need to persist from request to request, or passed through the request chain, for example the `returnUrl`. Rather than just persist the querystring as is through the flow, a middleware is used to parse the querystring for expected values and use them, this gives control over exactly what query parameters are available and usable.

The [`QueryParams`](../src/shared/model/QueryParams.ts) interface is used to determine which parameters are available. However this is created as a union of the `PersistableQueryParams` interface and extra properties that do not need to persist between requests which are defined directly on `QueryParams`.

`PersistableQueryParams` should include parameters that are fine to persist between requests, for example any query parameters that need to pass from page to page in a flow, e.g. `returnUrl`.

Properties defined directly on `QueryParams` should only include parameters that should only be available for a single request, for example to show an error on a page, or make a state available after a redirect e.g. `emailVerified`.

```ts
// src/shared/model/QueryParams.ts
export interface PersistableQueryParams extends StringifiableRecord {
  returnUrl: string;
  ...
}

export interface QueryParams
  extends PersistableQueryParams,
    StringifiableRecord {
  emailVerified?: boolean;
  error?: string;
  ...
}
```

Be sure to also update the `getPersistableQueryParams` method in [src/shared/lib/queryParams.ts](../src/shared/lib/queryParams.ts) with any new persistable parameters you add, as this method is used to filter out any keys that should not persist from a combined query parameters object.

```ts
// src/shared/lib/queryParams.ts
...
export const getPersistableQueryParams = (params: QueryParams): PersistableQueryParams => ({
  returnUrl: params.returnUrl,
  clientId: params.clientId,
  ref: params.ref,
  refViewId: params.refViewId,
});
...
```

This file also exposes an `addQueryParamsToPath` method which can be used to append query parameters to a given path/string with the correct divider (`?`|`&`). By default it filters out parameters that do not persist from the `QueryParams` object and then turns it into a query string. If you want to include an parameter that doesn't persist, you can manually opt into providing a value as the 3rd argument to the method.

#### Server

To make sure the query params are parsed on the server, make sure to add the param to the [`parseExpressQueryParams`](../src/server/lib/queryParams.ts) and the [`unit tests`](../src/server/lib/__tests__/queryParams.test.ts) too.

```ts
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

You can access this server side on the `ResponseWithRequestState` object as `res.locals.queryParams`. For example you could get the `returnUrl` using:

```ts
router.get(Routes.A_URL, (req: Request, res: ResponseWithRequestState) => {
  ...
  const { returnUrl } = res.locals.queryParams;
  ...
})
```

If you want to persist the query parameters when doing a redirect, use the `addQueryParamsToPath` method to automatically append query parameters as a string to the redirect.

```ts
res.redirect(
  303,
  addQueryParamsToPath(
    Routes.URL_TO_REDIRECT_TO,
    res.locals.queryParams,
  ),
),
```

You can also use `addReturnUrlToPath` if all you need to add is the `returnUrl`, for example when calling certain IDAPI routes/external services.

#### Client

To access the query parameters on the client, you can use the [`ClientState`](../src/shared/model/ClientState.ts) to do so, as a `queryParams` object is available as a property on the `ClientState`. Again you can use the `addQueryParamsToPath` to convert the query parameters to a string, which can be appended on the client to a link/form action. Some contrived examples below:

```tsx
import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

// export some react component
export const TestContainer = () => {
  // get the client state from the context
  const clientState: ClientState = useContext(ClientStateContext);
  // extract the queryParams we need from the state
  const { queryParams } = clientState;
  // extract the values we need from the queryParam
  const { clientId, error } = queryParams;

  // turn all the query params into a query string (only PersistableQueryParams by default)
  const queryString = addQueryParamsToPath('', queryParams);

  // pass these to our presentation components
  return (
    <TestComponent
      queryString={queryString}
      clientId={clientId}
      error={error}
    />
  );
};
```

```tsx
...
const TestComponent = ({ queryString, clientId, error }: Props) => {
  return (
    <>
      {error && <ErrorSummary message={error}>}
      <p>The client id is {clientId}.</p>
      <form action={`${Routes.POST_ACTION_URL}${queryString}`}>
        ...
      </form>
    </>
  )
}
...

```

## Styling

Styling is done in JS (or TSX in our case) using the [Emotion](https://emotion.sh) CSS-in-JS library, which allows for the definitions of styles at the component level, which means once rendered, the html sent to the client only contains the CSS required for that page.

It's also used as [the Guardian Source Design System](https://theguardian.design/) components are built using Emotion too, allowing the use for those components in our project.

Example of styling and adding it to a `p` tag using Emotion and Source:

```tsx
import * as React from 'react';
import { css } from '@emotion/react';
import { textSans, neutral } from '@guardian/source-foundations';

// style the tag using the css string literal
const p = css`
  color: ${neutral[100]};
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

The app itself is server side rendered for browsers not running JavaScript. We also hydrate the components with react, necessary for interactive components.
Also, there may need to be some scripts that fire on the client side, for example for analytics, or the consents management platform.

To facilitate this, a client bundle is created at build time to the `build/static` folder. This corresponds to the script imported in the [`src/client/static/index.tsx`](../src/client/static/index.tsx) file, with a script tag pointing to the bundle delivered along with the rendered html.

We provide two bundles to the client; a `modern` bundle for browsers who support `<script type="module">`, and a `legacy` bundle for browsers who do not. The modern bundle means we can provide a smaller javascript payload to the browser as we don't have to provide polyfills/shims for features like `fetch`, `Promise`, `async await`, etc. The legacy bundle targets ES5 and IE11, and thus is of larger size to provide compatibility with modern features.

When developing be sure to pay attention to the outputted bundle sizes. For `modern` browsers, an asset cannot be over `384kb`, and the total entrypoint cannot be over `512kb`. For legacy it's `512kb` for an asset, and `768kb` for the total entrypoint. While we don't throw an error if these limits are exceeded, a warning does appear in the console.

## CSP (Content Secure Policy)

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement to distribution of malware.

We use [helmet](https://helmetjs.github.io/docs/csp/) to add the `Content-Security-Policy` header. You can see the middleware configuration in the [`src/server/lib/middleware/helmet.ts`](../src/server/lib/middleware/helmet.ts) file.

Essentially you need to add directives for all the content you're loading on the page. The helmet docs and the [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) docs are super handy for more info.

CSP Violations show up in the browser console, so it's easy to tell if theres a violation of the policy.

## AB Testing

See the [AB Testing](ab-testing.md) documentation!

## Emails

See the [Email README](../src/email/README.md)!
