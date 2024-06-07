export interface ProcessedData {
  [venue: string]: {
    newComers: { [year: string]: number };
    previusComers: { [year: string]: number };
    allResearchers: Set<string>;
    cumulativeNewComers: Set<string>;
  };
}