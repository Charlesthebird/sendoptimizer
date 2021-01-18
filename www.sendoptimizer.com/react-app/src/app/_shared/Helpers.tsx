import { Column } from "react-table";

export const makeColumn = (
  Header: string,
  accessor: string,
  columnProps?: Column
) => {
  return { Header, accessor, ...columnProps } as Column;
};
