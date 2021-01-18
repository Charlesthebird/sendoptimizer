import React, { useContext, useEffect, useMemo } from "react";
import ACDataContext from "../../_context/ac-data/ACDataContext";
import {
  BsArrowLeft,
  BsArrowRight,
  BsBootstrapReboot,
  BsDownload,
} from "react-icons/bs";
import { Button, Dropdown } from "react-bootstrap";
import ExcelJS from "exceljs";

import { saveAs } from "file-saver";
import { ICampaign } from "../../_context/ac-data/types";

// --------- INTERFACE ------- //
interface ICampaignListOLD {
  setSelectedCampaign(c: ICampaign): void;
}
// ------- COMPONENT --------- //
export const CampaignListOLD: React.FC<ICampaignListOLD> = ({
  setSelectedCampaign,
}) => {
  return <>OLD CAMPAIGN LIST</>;
  /* 
  // ------- CONTEXT --------- //
  const acdctx = useContext(ACDataContext);
  const {
    data,
    loadData,
    clearAndReloadData,
    isLoadingData,
    curPage,
    lastPage,
  } = acdctx;

  // Load data when page loads.
  // eslint-disable-next-line
  useEffect(loadData, []);

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
    // wb.properties.date1904 = true;
    // wb.calcProperties.fullCalcOnLoad = true;
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
    // !---INSERT ROWS TO MAKE THE SHEET MORE READABLE
    // sheet.insertRow(10, {});
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

  // ------- RENDER --------- //
  const disableBtns = data === null || isLoadingData;
  const pageOptions = useMemo(() => {
    const p = [];
    for (let i = 0; i <= lastPage; i++) p.push(i);
    return p;
  }, [lastPage]);
  const actionRow = (
    <div className="d-inline-block">
      <Button
        variant="primary"
        className="mb-3"
        onClick={downloadXLSX}
        disabled={disableBtns}
      >
        <BsDownload />
        &nbsp;Download Results
      </Button>
      <Button
        variant="outline-info"
        className="mb-3 ml-3"
        onClick={() => loadData(curPage - 1)}
        disabled={disableBtns || curPage <= 0}
      >
        <BsArrowLeft />
        &nbsp;Previous Page
      </Button>
      <Button
        variant="outline-info"
        className="mb-3 ml-3"
        onClick={() => loadData(curPage + 1)}
        disabled={disableBtns || curPage >= lastPage}
      >
        Next Page&nbsp;
        <BsArrowRight />
      </Button>
      <Dropdown
        className="custom-dropdown"
        onSelect={(evtKey) => {
          if (!evtKey) return;
          const _k = Number.parseInt(evtKey);
          if (!isNaN(_k)) loadData(_k);
        }}
      >
        <Dropdown.Toggle disabled={isLoadingData}>
          Page {isLoadingData ? "..." : curPage + 1} /{" "}
          {isLoadingData ? "..." : lastPage + 1}
        </Dropdown.Toggle>
        <Dropdown.Menu className="custom-dropdown-menu">
          {pageOptions.map((p, idx) => (
            <Dropdown.Item key={idx} eventKey={p.toString()}>
              {p + 1}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <Button
        variant="outline-info"
        className="mb-3 ml-3"
        onClick={clearAndReloadData}
        disabled={isLoadingData}
      >
        <BsBootstrapReboot />
        &nbsp;Reload Data
      </Button>
    </div>
  );
  return (
    <div>
      {actionRow}
      <InnerCampaignList setSelectedCampaign={setSelectedCampaign} />
      {!isLoadingData && <div className="mt-3 mb-5">{actionRow}</div>}
    </div>
  );
      */
};
