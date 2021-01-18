import { createContext } from "react";
import { IAppSettingsContext } from "./types";

const AppSettingsContext = createContext({} as IAppSettingsContext);
export default AppSettingsContext;
