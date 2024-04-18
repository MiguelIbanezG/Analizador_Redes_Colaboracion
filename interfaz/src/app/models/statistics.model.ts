export interface Author {
    ipNames: string[];
    numPublications: number;
    researcher: string;
    year: string;
}
  
export interface DecadeStats {
    label: string;
    startYear: number;
    endYear: number;
    authors: Author[];
}