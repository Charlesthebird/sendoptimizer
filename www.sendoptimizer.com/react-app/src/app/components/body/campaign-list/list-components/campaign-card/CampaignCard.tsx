import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, OverlayTrigger, Popover } from "react-bootstrap";
import ReactTable, { Column } from "react-table";
import {
  ICampaign,
  ICampaignMessage,
} from "../../../../_context/ac-data/types";
import { makeColumn } from "../../../../../_shared/Helpers";
import { BsFillEyeFill } from "react-icons/bs";

// --------- INTERFACE -------- //
interface ICampaignCard {
  campaign: ICampaign;
  messages: ICampaignMessage[];
  // links: ILink[];
  onSelect(c: ICampaign): void;
}
// --------- COMPONENT -------- //
export const CampaignCard: React.FC<ICampaignCard> = ({
  campaign,
  messages,
  // links,
  onSelect,
}) => {
  // console.log({ campaign, messages, links });
  // const acdctx = useContext(ACDataContext);
  // const { curPage } = acdctx;

  const [winnerID, setWinnerID] = useState<string | null>(null);

  useEffect(() => {
    let maxULinkClicks = -1;
    let maxULinkClicksIdx = -1;
    let maxUOpens = -1;
    let maxUOpensIdx = -1;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const curULinkClicks = Number.parseInt(m.uniquelinkclicks);
      if (curULinkClicks > maxULinkClicks) {
        maxULinkClicks = curULinkClicks;
        maxULinkClicksIdx = i;
      }
      const curUOpens = Number.parseInt(m.uniqueopens);
      if (curUOpens > maxUOpens) {
        maxUOpens = curUOpens;
        maxUOpensIdx = i;
      }
    }
    if (maxULinkClicksIdx === -1 || maxUOpensIdx === -1) return;
    setWinnerID(messages[maxULinkClicksIdx].id);
    // (messages[maxULinkClicksIdx] as any).isWinner = true;
    // (messages[maxUOpensIdx] as any).isWinner = true;
    // }, [curPage, messages]);
  }, [messages]);

  const highlightWinnerCol = useMemo(() => {
    return {
      className: "bg-cell",
      Cell: (props: any) => {
        return (
          <div
            className={`bg-cell-inner ${
              props.original.id === winnerID ? "bg-warning" : ""
            }`}
          >
            {props.value}
          </div>
        );
      },
    };
  }, [winnerID]);
  const highlightWinCenteredCol = useMemo(() => {
    return {
      ...highlightWinnerCol,
      className: "bg-cell text-center",
      sortMethod: (a: any, b: any) => {
        const _a = Number.parseInt(a);
        const _b = Number.parseInt(b);
        if (isNaN(_a) || isNaN(_b)) {
          if (a < b) return -1;
          if (a > b) return 1;
          return 0;
        } else {
          if (_a < _b) return -1;
          if (_a > _b) return 1;
          return 0;
        }
      },
    } as Column<any>;
  }, [highlightWinnerCol]);
  const columns = useMemo(() => {
    return [
      makeColumn("Subject", "subject", { ...highlightWinnerCol, width: 300 }),
      makeColumn(
        "Unique Link Clicks",
        "uniquelinkclicks",
        highlightWinCenteredCol
      ),
      makeColumn("Link Clicks", "linkclicks", {
        ...highlightWinCenteredCol,
        width: 80,
      }),
      makeColumn("Unique Opens", "uniqueopens", highlightWinCenteredCol),
      makeColumn("Opens", "opens", { ...highlightWinCenteredCol, width: 60 }),
      makeColumn("Hard Bounces", "hardbounces", highlightWinCenteredCol),
      makeColumn("Soft Bounces", "softbounces", highlightWinCenteredCol),
      // makeColumn("Send Amount", "send_amt", highlightWinCenteredCol),
    ];
  }, [highlightWinnerCol, highlightWinCenteredCol]);

  // --------- RENDER -------- //
  return (
    <Card className="campaign-card">
      <Card.Header style={{ padding: ".5rem" }}>
        {/* <div className="d-inline-block align-middle">{campaign.name}</div> */}
        <b>{campaign.name}</b>&nbsp;&nbsp;(
        {/* {new Date(campaign.mdate).toLocaleString()}) */}
        {new Date(campaign.sdate).toLocaleDateString()})
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 0 }}
          // delay={{ show: 250, hide: 200 }}
          overlay={
            <Popover id="popover-basic" style={{ minWidth: "50%" }}>
              <Popover.Title as="h3">Preview</Popover.Title>
              <Popover.Content>{campaign.message_text}</Popover.Content>
            </Popover>
            // <Tooltip id="button-tooltip" {...props}>
            //   {campaign.message_text}
            // </Tooltip>
          }
        >
          <Button
            className="float-right"
            variant="outline-info"
            size="sm"
            onClick={() => onSelect(campaign)}
          >
            <BsFillEyeFill style={{ marginTop: "-2px" }} />
            &nbsp;View Email
          </Button>
        </OverlayTrigger>
      </Card.Header>

      <Card.Body style={{ fontSize: "80%" }}>
        <div className="hide-pagination">
          <ReactTable
            defaultPageSize={messages.length}
            columns={columns}
            data={messages}
            defaultSorted={[
              { id: "uniquelinkclicks", desc: true },
              { id: "uniqueopens", desc: true },
            ]}
          />
        </div>
        {/* <small>
          <ul>
            {messages.map((m, idx) => (
              <li key={idx}>
                {m.subject}... Opens: {m.opens}... Unique Opens: {m.uniqueopens}
              </li>
            ))}
          </ul>
        </small> */}
      </Card.Body>
    </Card>
  );
};
