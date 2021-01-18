export interface ISearchParams {
  searchText: string;
  offset: number;
  limit: number;
  order: string;
}
export type IACDataContext = {
  search: (params?: ISearchParams | undefined) => Promise<void>;
  data: any;
  isLoadingData: boolean;
  lastSearchParams: null | ISearchParams;
};
export type IACData = any;
export type ICampaign = any;
export type ICampaignMessage = any;
export type ILink = any;
