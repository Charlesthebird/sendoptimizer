import React, { useState } from "react";
import ACDataContext from "./ACDataContext";
import { IACData, ISearchParams } from "./types";
import { api_base_url } from "../../../../index";

// ------- INTERFACE ---------- //
const ACDataProvider: React.FC = (props) => {
  // ------ STATE ----- //
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [data, setData] = useState<null | IACData>(null);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);

  // ------- LOADS THE CAMPAIGN DATA (WITH PAGINATION) -------- //
  const search = async (params?: ISearchParams) => {
    if (isLoadingData) return;
    if (params) params.searchText = params.searchText.trim();
    if (params && lastSearchParams) {
      if (JSON.stringify(lastSearchParams) === JSON.stringify(params)) return;
      if (
        params.searchText === lastSearchParams.searchText &&
        data &&
        data.meta &&
        data.meta.total === 0
      )
        return;
    }
    if (!params) {
      if (!lastSearchParams)
        throw new Error("Cannot search - no params provided.");
      else params = lastSearchParams;
    }
    console.log("SEARCHING---", params);
    setIsLoadingData(true);
    // set up the request with authentication
    const { searchText, order, limit, offset } = params!;
    if (!/^\[([a-z]|[A-Z]|_)+\]=(DESC)|(ASC)/.test(order)) {
      console.error("INVALID ORDER");
      return;
    }
    let uri =
      api_base_url +
      "search?searchText=" +
      encodeURIComponent(searchText) +
      "&order" +
      order +
      "&limit=" +
      limit +
      "&offset=" +
      offset;
    if (
      lastSearchParams &&
      lastSearchParams.searchText === searchText &&
      data.meta
    )
      uri += "&prevTotal=" + data.meta.total;
    const h = new Headers();
    h.append("Accept", "application/json");
    const req = new Request(uri, {
      method: "GET",
      headers: h,
      credentials: "same-origin",
    });
    try {
      const res = await fetch(req);
      const newData = await res.json();
      console.log("loaded data from server", newData);
      setLastSearchParams(params);
      setData(newData);
      setIsLoadingData(false);
    } catch (err) {
      console.error(err);
      setIsLoadingData(false);
    }
  };

  // const clearAndReloadData = useCallback(
  //   () => {
  //     // Not using any cached page data.
  //     if (lastSearchParams) search({ ...lastSearchParams, offset: 0 });
  //   },
  //   // eslint-disable-next-line
  //   [setData, setIsLoadingData]
  // );

  /* 
  const updateLastActivityTime = useCallback(() => {
    const curTime = new Date().getTime();
    // ------------------- //
    // timeDiffAllowed is the time before the cached data is cleared and re-loaded
    // By default, we can update it every 8 hours.
    const timeDiffAllowed = 8 * 60 * 60 * 1000;
    const lastActivityTimeStr = localStorage.getItem("last_activity_time");
    let lastActivityTime = -timeDiffAllowed - 1;
    if (
      lastActivityTimeStr !== null &&
      !isNaN(Number.parseInt(lastActivityTimeStr))
    )
      lastActivityTime = Number.parseInt(lastActivityTimeStr);
    else lastActivityTime = curTime;
    localStorage.setItem("last_activity_time", curTime.toString());
    // clear and reload the data if the activity time is outside the refresh time.
    // if (curTime - lastActivityTime > timeDiffAllowed) clearAndReloadData();
    // }, [clearAndReloadData]);
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", updateLastActivityTime);
    return () => {
      window.removeEventListener("mousemove", updateLastActivityTime);
    };
  }, [updateLastActivityTime]);
  */

  // ------- RENDER ---------- //
  return (
    <ACDataContext.Provider
      value={{
        data,
        search,
        lastSearchParams,
        isLoadingData,
      }}
    >
      {props.children}
    </ACDataContext.Provider>
  );
};

export default ACDataProvider;
