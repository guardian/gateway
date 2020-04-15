import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import { Main } from "./main";

ReactDOM.hydrate(
  <Router>
    <Main />
  </Router>,
  document.getElementById("app")
);
