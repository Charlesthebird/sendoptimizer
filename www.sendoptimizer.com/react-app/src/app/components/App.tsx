import React from "react";
import { BodyContainer } from "./body/BodyContainer";
import { CustomNavbar } from "./layout/CustomNavbar";
import AppSettingsProvider from "./_context/app-settings/AppSettingsProvider";
import ACDataProvider from "./_context/ac-data/ACDataProvider";

// --------- COMPONENT ---------- //
function App() {
  // --------- RENDER ---------- //
  return (
    <div className="App">
      <AppSettingsProvider>
        <CustomNavbar />
        <ACDataProvider>
          <BodyContainer />
        </ACDataProvider>
      </AppSettingsProvider>
    </div>
  );
}

export default App;
