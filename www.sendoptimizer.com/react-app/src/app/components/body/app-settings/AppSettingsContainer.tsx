import React, { useContext, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { InfoAlert } from "../../../_shared/InfoAlert";
import AppSettingsContext from "../../_context/app-settings/AppSettingsContext";

// -------- INTERFACE --------- //
interface IAppCSettingsContainer {}
// -------- COMPONENT --------- //
export const AppSettingsContainer: React.FC<IAppCSettingsContainer> = () => {
  const asCtx = useContext(AppSettingsContext);
  const { saveSettings } = asCtx;

  // -------- STATE --------- //
  const [dbHost, setDBHost] = useState("");
  const [dbUser, setDBUser] = useState("");
  const [dbPass, setDBPass] = useState("");

  const canSubmit = () => {
    return (
      /^\d+\.\d+\.\d+\.\d+$/.test(dbHost) &&
      dbUser.trim().length > 0 &&
      dbPass.trim().length > 0
    );
  };
  const onSubmit = (e: any) => {
    e.preventDefault();
    // console.log("Saving account name and api key!", e);
    const newSettings = { dbHost, dbUser, dbPass };
    console.log("Saving Settings!", newSettings);
    saveSettings(newSettings);
  };

  // -------- RENDER --------- //
  return (
    <div>
      <Card>
        <Card.Header>
          <h3>Settings</h3>
        </Card.Header>
        <Card.Body>
          <InfoAlert
            body={
              <div style={{ fontSize: ".9rem" }}>
                The following information is needed to connect to Send
                Optimizer.
              </div>
            }
          />
          <Form onSubmit={onSubmit}>
            <div className="pb-1 pt-2">
              <div className="mb-3">
                Host:&nbsp;&nbsp;
                <input
                  id="db-host-input"
                  className="d-inline"
                  type="text"
                  placeholder="Host"
                  value={dbHost}
                  onChange={(e) =>
                    setDBHost(
                      e.target.value
                        .split("")
                        .filter((c) => /[.|\d]/.test(c))
                        .join("")
                    )
                  }
                />
              </div>
              <div className="mb-3">
                Username:&nbsp;&nbsp;
                <input
                  id="username-input"
                  className="d-inline"
                  type="text"
                  placeholder="Username"
                  value={dbUser}
                  onChange={(e) => setDBUser(e.target.value.replace(/ /g, ""))}
                />
              </div>
              <div className="mb-3">
                Password:&nbsp;&nbsp;
                <input
                  id="password-input"
                  className="d-inline"
                  type="password"
                  placeholder="1234abc..."
                  value={dbPass}
                  onChange={(e) => setDBPass(e.target.value)}
                />
              </div>
            </div>
            <Button
              id="app-settings-submit"
              disabled={!canSubmit()}
              variant="success"
              type="submit"
            >
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
