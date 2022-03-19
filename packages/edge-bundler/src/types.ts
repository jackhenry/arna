export type Point = {
  x: number,
  y: number,
};
export type Vector = Point;
/**
 * Graph types
 */
export type Vertex = Point;
export type NodeData = {
  [identifier: string]: Vertex
};
export type Edge = {
  tail: keyof NodeData;
  head: keyof NodeData;
};
export type EdgeData = Edge[];
export type EdgeSubdivisionPoints = Vertex[];
export type EdgeCompatabilityList = number[];

export type TunableParametersOptional = {
  bundlingStiffness?: number, // K
  initialStepSize?: number, // S_initial
  initialSubdivision?: number, // P_initial
  subdivisionRate?: number, // P_rate
  cycleCount?: number, // C
  initialIterationCount?: number, // I_initial
  iterationDecreaseRate?: number, // I_rate
  compatabilityThreshold?: number,
  error?: number,
};

export type TunableParameters = {
  bundlingStiffness: number, // K
  initialStepSize: number, // S_initial
  initialSubdivision: number, // P_initial
  subdivisionRate: number, // P_rate
  cycleCount: number, // C
  initialIterationCount: number, // I_initial
  iterationDecreaseRate: number, // I_rate
  compatabilityThreshold: number,
  error: number,
};
