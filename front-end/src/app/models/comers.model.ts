export interface ProcessedData {
  [venue: string]: {
    newComers: { [year: string]: number };
    LCC: { [year: string]: number };
    allResearchers: Set<string>;
    cumulativeNewComers: Set<string>;
  };
}