import React, { useContext } from "react";
import ACDataContext from "../../../_context/ac-data/ACDataContext";
import { ICampaign } from "../../../_context/ac-data/types";
import { CampaignCard } from "./campaign-card/CampaignCard";

// -------- INTERFACE -------- //
interface IInnerCampaignList {
  setSelectedCampaign(c: ICampaign): void;
}
// -------- COMPONENT -------- //
export const InnerCampaignList: React.FC<IInnerCampaignList> = ({
  setSelectedCampaign,
}) => {
  // -------- CONTEXT -------- //
  // const appSettingsCtx = useContext(AppSettingsContext);
  // const { settings } = appSettingsCtx;
  const acdctx = useContext(ACDataContext);
  const { data, isLoadingData } = acdctx;

  // -------- RENDER -------- //
  if (isLoadingData)
    return (
      <div className="d-block text-center p-3">
        <i>Loading...</i>
      </div>
    );
  if (data === null) return <></>;
  return (
    <>
      {data.campaigns.map((c: any, idx: number) => {
        // const filteredLinks = data.links.filter(
        //   // (l) => l.campaignid === c.id
        //   (l: any) =>
        //     l.campaignid === c.id && !l.link.includes(settings!.accountName)
        // );
        const filteredMessages = data.campaignMessages.filter(
          (m: any) => m.campaignid === c.id
        );
        return (
          <div key={idx}>
            <CampaignCard
              campaign={c}
              // links={filteredLinks}
              messages={filteredMessages}
              onSelect={setSelectedCampaign}
            />
          </div>
        );
      })}
    </>
  );
};
