import React from "react";
import Button from "react-bootstrap/esm/Button";
import { ICampaign } from "../../_context/ac-data/types";

// -------------- INTERFACE -------------- //
interface ISelectedCampaignView {
  clearSelectedCampaign(): void;
  campaign: ICampaign;
}
// -------------- COMPONENT -------------- //
export const SelectedCampaignView: React.FC<ISelectedCampaignView> = ({
  clearSelectedCampaign,
  campaign,
}) => {
  // -------------- RENDER -------------- //
  return (
    <>
      <div style={{ height: "70vh" }}>
        <iframe
          title="campaign-message-preview"
          width="100%"
          height="100%"
          src={campaign.screenshot.replace(/^\/\//, "https://")}
        />
      </div>
      <div className="d-block mt-2 text-left">
        <Button variant="secondary" onClick={clearSelectedCampaign}>
          Close
        </Button>
      </div>
    </>
  );
};
