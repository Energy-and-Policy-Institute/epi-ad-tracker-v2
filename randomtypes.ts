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

export type regiondelivery = {
  id: Number;
  generation: number;
  pythonid: BigInt;
  percentage: number;
  region: String;
};

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
  impressions_lower_bound: number;
  impressions_upper_bound: number;
  spend_lower_bound: number;
  spend_upper_bound: number;
  ad_start_month: number;
  ad_start_year: number;
};
