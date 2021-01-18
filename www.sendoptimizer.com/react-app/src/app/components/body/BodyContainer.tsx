import React, { useContext } from "react";
import AppSettingsContext from "../_context/app-settings/AppSettingsContext";
import { CampaignListContainer } from "./campaign-list/CampaignListContainer";

// --------- COMPONENT ---------- //
export const BodyContainer = () => {
  const acCtx = useContext(AppSettingsContext);
  const { isLoggingOut } = acCtx;

  // --------- RENDER ---------- //
  if (isLoggingOut) return <></>;
  return (
    <div className="container mt-4">
      <CampaignListContainer />
      {/* {settings === null ? <AppSettingsContainer /> : <CampaignListContainer />} */}
    </div>
  );
};
