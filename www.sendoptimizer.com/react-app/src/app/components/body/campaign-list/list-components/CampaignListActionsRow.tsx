import React, { useContext, useMemo } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { BsDownload, BsArrowLeft, BsArrowRight } from "react-icons/bs";
import ACDataContext from "../../../_context/ac-data/ACDataContext";

// ---------- INTERFACE ---------- //
interface ICampaignListActionsRow {
  downloadData: () => Promise<void>;
  isBottomActionsRow?: boolean;
}
// ---------- COMPONENT ---------- //
export const CampaignListActionsRow: React.FC<ICampaignListActionsRow> = ({
  isBottomActionsRow,
  downloadData,
}) => {
  const adctx = useContext(ACDataContext);
  const { isLoadingData, search, data, lastSearchParams } = adctx;

  // ------- PAGINATION ------- //
  const [curPage, lastPage] = useMemo(() => {
    if (!lastSearchParams || !data || !data.meta || !data.meta.total)
      return [0, -1];
    const { limit: numPerPage, offset } = lastSearchParams;
    const { total } = data.meta;
    return [
      Math.floor(offset / numPerPage),
      Math.floor((total - 1) / numPerPage),
    ];
  }, [lastSearchParams, data]);
  const loadPageData = (pageNum: number) => {
    if (lastPage === -1 || !lastSearchParams || pageNum === curPage) return;
    const { limit: numPerPage } = lastSearchParams;
    const newSearchParams = {
      ...lastSearchParams,
      offset: pageNum * numPerPage,
    };
    search(newSearchParams);
  };
  const pageOptions = useMemo(() => {
    const p = [];
    for (let i = 0; i <= lastPage; i++) p.push(i);
    return p;
  }, [lastPage]);

  const disableBtns = data === null || isLoadingData;

  // -------- RENDER --------- //
  const isNoData = data && data.meta && data.meta.length === 0;
  if (isNoData) return <></>;
  if (isBottomActionsRow && (isLoadingData || curPage === lastPage))
    return <></>;
  return (
    <div className="d-block text-center">
      {/* <div className="mt-4 mb-2 text-right"> */}
      <div className="mt-4 mb-2">
        <Button
          size="sm"
          variant="outline-primary"
          className="mb-3"
          onClick={downloadData}
          disabled={disableBtns}
        >
          <BsDownload />
          &nbsp;Download This Page
        </Button>
        <Button
          size="sm"
          variant="outline-info"
          className="mb-3 ml-3"
          onClick={() => loadPageData(curPage - 1)}
          disabled={disableBtns || curPage <= 0}
        >
          <BsArrowLeft />
          &nbsp;Previous Page
        </Button>
        <Button
          size="sm"
          variant="outline-info"
          className="mb-3 ml-3"
          onClick={() => loadPageData(curPage + 1)}
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
            if (!isNaN(_k)) loadPageData(_k);
          }}
        >
          <Dropdown.Toggle
            size="sm"
            variant="outline-info"
            disabled={isLoadingData}
          >
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

        {!isBottomActionsRow && data && data.meta && (
          <div className="d-inline-block pl-3 align-top pt-1">
            {data.meta.total} Results
          </div>
        )}

        {/* <Button
        variant="outline-info"
        className="mb-3 ml-3"
        onClick={clearAndReloadData}
        disabled={isLoadingData}
      >
        <BsBootstrapReboot />
        &nbsp;Reload Data
      </Button> */}
      </div>
    </div>
  );
};
