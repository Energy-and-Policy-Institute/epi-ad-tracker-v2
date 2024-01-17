export type RegionDataCell = {
  upperbound: number;
  lowerbound: number;
  number_of_ads: number;
};

export type RegionDataHive = {
  AmericaCell: RegionDataCell;
  stateCells: Map<String, RegionDataCell>;
};
