export type RegionDataCell = {
  upperbound: number;
  lowerbound: number;
  number_of_ads: number;
};

export type RegionDataHive = {
  AmericaCell: RegionDataCell;
  stateCells: Map<String, RegionDataCell>;
};
export interface CellData {
  upperbound: number;
  lowerbound: number;
  number_of_ads: number;
}

export interface StateData {
  [key: string]: CellData;
}

export interface RegionData {
  AmericaCell: CellData;
  stateCells: {
    [key: string]: StateData;
  };
  // You can add more properties if needed
}

export type InputPythonRow = {
  id: Number;
  // pythonid?: Number;
  ad_delivery_start_time: String;
  ad_delivery_stop_time: String;
  ad_snapshot_url: String;
  bylines: String;
  delivery_by_region: String;
  demographic_distribution: String;
  publisher_platforms: String;
  ad_creative_bodies: String;
  ad_creative_link_captions: String;
  ad_creative_link_descriptions: String;
  ad_creative_link_titles: String;
  page_name: String;
  page_id: String;
  impressions_lower_bound: BigInt;
  impressions_upper_bound: BigInt;
  spend_lower_bound: BigInt;
  spend_upper_bound: BigInt;
  ad_start_month: Number;
  ad_start_year: Number;
};
