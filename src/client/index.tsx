// Since we're doing full SSR, this file is currently not being used,
// as we don't hydrate the app
// we may switch back to using hydration, so keeping this file here

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import { Main } from './main';

ReactDOM.hydrate(
  <Router>
    <Main />
  </Router>,
  document.getElementById('app'),
);
