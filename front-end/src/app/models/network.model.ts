export interface Node {
  id: number;
  label: string;
}

export interface Edge {
  from: number;
  to: number;
  label: string;
  labelSide: "from" | "to";
  number: boolean;
}
