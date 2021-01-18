import React from "react";
import { ICampaign } from "../../../_context/ac-data/types";
import { InnerCampaignList } from "./InnerCampaignList";

// --------- INTERFACE ------- //
interface ICampaignList {
  setSelectedCampaign(c: ICampaign): void;
}
// ------- COMPONENT --------- //
export const CampaignList: React.FC<ICampaignList> = ({
  setSelectedCampaign,
}) => {
  // ------- CONTEXT --------- //
  return (
    <div>
      <InnerCampaignList setSelectedCampaign={setSelectedCampaign} />
    </div>
  );
};
