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

To make it easier to keep track of routes/paths, we define then in a `Routes` enum in the [shared/mdel/Routes.ts](../src/shared/model/Routes.ts) file. The enum is then consumed by both Express and React Router so we can share the paths between them.

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

Sometimes data is needed by the client to render a specific component, e.g. an error. However due to SSR without client side hydration it's not possible to simply pass some JSON to the client and expect it to utilise the data.

Instead it's possible to pass a state (properties in the [`GlobalState`](../src/shared/model/GlobalState.ts) interface) to the renderer method. This is passed to the [`Main` app component](../src/client/main.tsx) in React as a prop. The `Main` component utilises a [`GlobalStateProvider`](../src/client/components/GlobalState.tsx) which wraps the app with a [Context Provider](https://reactjs.org/docs/context.html) making it possible to access data further down a component tree without having to manually pass props down at each level.

It's then possible to access the state through the [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) hook in a descendent component.

On the server side, it's possible to populate the state by creating a `GlobalState` object, adding values to it, and passing it to the renderer (example below).

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

- whats it used for
- example

## Styling

- guardian design system
- emotion.sh
- close to component as possible
- shared styles

## Environment Variables

- .env file
- .env.example
- docker-compose
- github actions
- configuration + test
- possibly cypress too

## Client Side Scripts

- client/static folder
- analytics/cmp etc.
- code not directly related to core functionality
- compiled separately
- dynamic imports

## CSP (Content Secure Policy)

- updating csp
- csp errors
