import ReactDOM from "react-dom";

// import "bootstrap/scss/bootstrap.scss";
import "react-table/react-table.css";
import "./app/scss/main.scss";

import App from "./app/components/App";

let _api_base_url = "https://sendoptimizer.com/api/";
// let _api_base_url = "https://send-optimizer.ue.r.appspot.com/api/";
if (process.env.NODE_ENV === "development")
  _api_base_url = "http://localhost:3000/api/";
export const api_base_url = _api_base_url;

ReactDOM.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
  document.getElementById("root")
);
