import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";

let reminders;

ReactDOM.render(
  <App ref={app => (reminders = app)} />,
  document.getElementById("root")
);

document.getElementById("open").onclick = () => {
  reminders.open();
};
