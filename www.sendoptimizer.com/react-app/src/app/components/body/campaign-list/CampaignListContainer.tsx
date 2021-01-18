import React, { useContext, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { ICampaign } from "../../_context/ac-data/types";
import { CampaignList } from "./list-components/CampaignList";
import { SelectedCampaignView } from "./SelectedCampaignView";
import { Searchbar } from "./list-components/searchbar/Searchbar";
import { CampaignListActionsRow } from "./list-components/CampaignListActionsRow";
import ACDataContext from "../../_context/ac-data/ACDataContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --------- INTERFACE ------- //
interface ICampaignListContainer {}
// --------- COMPONENT ------- //
export const CampaignListContainer: React.FC<ICampaignListContainer> = () => {
  const acdctx = useContext(ACDataContext);
  const { data, isLoadingData } = acdctx;
  const [selectedCampaign, setSelectedCampaign] = useState<null | ICampaign>(
    null
  );

  const csvData = useMemo(() => {
    if (!data) return [];
    // return [];
    const d: any = [
      [
        "Winner (unique clicks)",
        "Campaign",
        "Date",
        "Subject",
        "Unique Clicks",
        "Total Clicks",
        "Opens",
        "Unique Opens",
        "Hard Bounces",
        "Soft Bounces",
      ],
    ];
    data.campaigns.forEach((c: any) => {
      // const filteredLinks = data.links.filter(
      //   (l) => l.campaignid === c.id
      //   // (l) =>
      //   //   l.campaignid === c.id && !l.link.includes(acSettings!.accountName)
      // );
      const filteredMessages = data.campaignMessages.filter(
        (m: any) => m.campaignid === c.id
      );
      let winnerIdx = 0;
      let winnerUniqueClickCount = 0;
      filteredMessages.forEach((m: any, idx: number) => {
        const uniqueLinkClicks = Number.parseInt(m.uniquelinkclicks);
        if (uniqueLinkClicks > winnerUniqueClickCount) {
          winnerIdx = idx;
          winnerUniqueClickCount = uniqueLinkClicks;
        }
      });
      filteredMessages.forEach((m: any, idx: number) => {
        const row: any = [];
        row.push(
          idx === winnerIdx ? "WINNER" : "",
          c.name,
          c.sdate,
          m.subject,
          m.uniquelinkclicks,
          m.linkclicks,
          m.opens,
          m.uniqueopens,
          m.hardbounces,
          m.softbounces
        );
        // d.push({ ...row, ...m });
        d.push(row);
      });
      // Insert a row after each campaign group to make the sheet more readable
      d.push([""]);
    });
    // console.log(d);
    return d;
  }, [data]);

  const downloadXLSX = async () => {
    // - EXCEL INIT
    const wb = new ExcelJS.Workbook();
    wb.creator = "sendoptimizer.com";
    wb.lastModifiedBy = "sendoptimizer.com";
    wb.created = new Date();
    wb.modified = new Date();
    // - EXCEL DATA
    const sheet = wb.addWorksheet("sheet", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    sheet.addRows(csvData);
    // for(let i=0; i<csvData.length; i++){
    //   sheet.insertRow(1, {id: 1, name: 'John Doe', dob: new Date(1970,1,1)});
    // }
    sheet.columns[0].width = 30;
    sheet.columns[0].alignment = { horizontal: "center" };
    sheet.columns[1].width = 50;
    sheet.columns[2].width = 30;
    sheet.columns[3].width = 50;
    for (let i = 4; i < sheet.columns.length; i++) {
      sheet.columns[i].alignment = { horizontal: "center" };
      sheet.columns[i].width = 20;
    }
    // for (let i = 0; i < sheet.columnCount; i++) {
    //   sheet.getCell().alignment = { horizontal: "center" };
    // }
    // sheet.columns[3].width = 20;
    // sheet.columns[4].width = 20;
    // sheet.columns[5].width = 20;
    // sheet.columns[6].width = 20;
    // - EXCEL STYLES
    // sheet.getCell("A3").value = "testing...";
    // sheet.getCell("A5").value = {
    //   richText: [
    //     {
    //       font: {
    //         bold: true,
    //         size: 12,
    //         color: { theme: 1 },
    //         name: "Calibri",
    //         family: 2,
    //         scheme: "minor",
    //       },
    //       text: "testing...",
    //     },
    //   ],
    // };
    sheet.getRow(0).fill = {
      type: "pattern",
      pattern: "gray0625",
      fgColor: { argb: "FFFFFFFF" }, // <- unused
      bgColor: { argb: "ffaaaaaa" }, // <- fill
    };
    for (let i = 1; i < csvData.length; i++) {
      if (sheet.getCell("A" + i).value === "WINNER")
        sheet.getRow(i).fill = {
          type: "pattern",
          pattern: "lightTrellis",
          fgColor: { argb: "FFFFFFFF" }, // <- unused
          bgColor: { argb: "ffffc107" }, // <- fill
        };
    }
    // let prevCampaign = csvData[0][1];
    // - EXCEL DOWNLOAD
    const xlsxData = await wb.xlsx.writeBuffer({ useStyles: true });
    var xlsxBlob = new Blob([xlsxData], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fname =
      "sendoptimizer_split_results_" +
      new Date().toLocaleDateString().replace(/\//g, "_");
    saveAs(xlsxBlob, fname);
  };

  // --------- RENDER ------- //
  return (
    <>
      <Modal
        show={selectedCampaign !== null}
        onHide={() => setSelectedCampaign(null)}
        size="xl"
      >
        <Modal.Header>
          {selectedCampaign ? selectedCampaign.name : ""}
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign !== null && (
            <SelectedCampaignView
              campaign={selectedCampaign}
              clearSelectedCampaign={() => setSelectedCampaign(null)}
            />
          )}
        </Modal.Body>
      </Modal>

      <div className="split-test-results-outer-container">
        <h1>Split Test Results</h1>
        <hr />
        <div className="split-test-results-container">
          <div className="list-container">
            <Searchbar />
            {isLoadingData || (data && data.meta && data.meta.total > 0) ? (
              <>
                <CampaignListActionsRow downloadData={downloadXLSX} />
                <CampaignList
                  setSelectedCampaign={(c) => setSelectedCampaign(c)}
                />
              </>
            ) : (
              <div className="d-block w-100 text-center">
                <div className="pt-5">
                  <i>No results.</i>
                </div>
              </div>
            )}
            {isLoadingData ||
              (data && data.meta && data.meta.total > 0 && (
                <CampaignListActionsRow
                  downloadData={downloadXLSX}
                  isBottomActionsRow={true}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};
