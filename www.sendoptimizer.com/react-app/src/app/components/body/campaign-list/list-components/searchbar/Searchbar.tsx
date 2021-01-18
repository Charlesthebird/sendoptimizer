import React, { useContext, useEffect, useState } from "react";
import { Button, Dropdown, DropdownButton, Form } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import ACDataContext from "../../../../_context/ac-data/ACDataContext";
import { orderOptions } from "./SearchbarHelpers";

// ---------- COMPONENT ------------ //
export const Searchbar = () => {
  const adctx = useContext(ACDataContext);
  const { search, isLoadingData, lastSearchParams } = adctx;
  const [searchText, setSearchText] = useState("");
  const pageOptions = [5, 10, 20, 50, 100, 1000000];
  const [numPerPage, setNumPerPage] = useState({
    title: "10 Per Page",
    value: 10,
  });
  const [order, setOrder] = useState(orderOptions[0][0]);

  const onSubmit = (e?: any) => {
    if (e) e.preventDefault();
    if (isLoadingData) return;
    search({
      searchText,
      order: order.value,
      offset: 0,
      limit: numPerPage.value,
    });
  };
  // eslint-disable-next-line
  useEffect(() => onSubmit(), [numPerPage, order]);
  // useEffect(() => onSubmit(), []);

  // --------- RENDER ----------- //
  return (
    <div className="w-100 mt-4">
      <Form onSubmit={onSubmit} className="w-100">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <input
            id="search-text-input"
            className="h-100 p-2"
            style={{ flexGrow: 5 }}
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <DropdownButton
            title={"Sort: " + order.title}
            disabled={isLoadingData}
            variant="outline-info"
            onSelect={(value) => value && setOrder(JSON.parse(value))}
          >
            {orderOptions.map((oArr, idx0) => {
              return (
                <React.Fragment key={idx0}>
                  {/* <Dropdown.Header>Test</Dropdown.Header> */}
                  {oArr.map((o, idx) => (
                    <Dropdown.Item key={idx} eventKey={JSON.stringify(o)}>
                      {o.title}
                    </Dropdown.Item>
                  ))}
                  {idx0 < orderOptions.length - 1 && <Dropdown.Divider />}
                </React.Fragment>
              );
            })}
          </DropdownButton>

          <DropdownButton
            title={numPerPage.title}
            variant="outline-info"
            disabled={isLoadingData}
            onSelect={(value) => {
              if (!value || !lastSearchParams) return;
              const _value = Number.parseInt(value);
              setNumPerPage({
                title: value + " Per Page",
                value: _value,
              });
            }}
          >
            {pageOptions.map((n, idx) => (
              <Dropdown.Item key={idx} eventKey={n.toString()}>
                {n}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <Button type="submit" disabled={isLoadingData} variant="primary">
            <BsSearch style={{ paddingBottom: "2px" }} />
            &nbsp;&nbsp;Search
          </Button>
        </div>
      </Form>
    </div>
  );
};
