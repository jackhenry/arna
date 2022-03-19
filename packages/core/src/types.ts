import { EdgeSubdivisionPoints } from '@arna/edge-bundler';
import { CstNode } from 'chevrotain';

interface AdditionalAttributes {
  color?: string;
  label?: string;
}
export type AdditionalNodeOptions = AdditionalAttributes;
export type AdditionalEdgeOptions = AdditionalAttributes;

export interface Node {
  identifier: string;
  positionX: number;
  positionY: number;
  forceX: number;
  forceY: number;
  options: AdditionalNodeOptions
}

export interface Edge {
  tail: Node;
  head: Node;
  attraction: number;
  options: AdditionalEdgeOptions
}

const MAX_TICKS = 500;
const MAX_REPULSIVE_DISTANCE = 6;
const OPTIMAL_DISTANCE_K = 2;
const C = 0.01;
const MAX_VERTEX_DISPLACEMENT = 0.5;

export type OptionalGraphParameters = {
  bundle?: boolean,
  maxTicks?: number,
  maxRepulsiveDistance?: number,
  optimalDistance?: number,
  c?: number,
  maxVertexDisplacement?: number
};

export type GraphParameters = {
  bundle: boolean,
  maxTicks: number,
  maxRepulsiveDistance: number,
  optimalDistance: number,
  c: number,
  maxVertexDisplacement: number
}

const defaultGraphParameters = {
  bundle: false,
  maxTicks: MAX_TICKS,
  maxRepulsiveDistance: MAX_REPULSIVE_DISTANCE,
  optimalDistance: OPTIMAL_DISTANCE_K,
  c: C,
  maxVertexDisplacement: MAX_VERTEX_DISPLACEMENT,
};

export abstract class Graph {
  constructor(nodes: Node[], edges: Edge[], parameters: OptionalGraphParameters) {
    this.nodes = nodes;
    this.edges = edges;
    this.parameters = defaultGraphParameters;
    if (parameters !== undefined) {
      this.parameters = Graph.buildParameters(parameters);
    }
  }

  public static buildParameters(optional: OptionalGraphParameters): GraphParameters {
    return {
      ...defaultGraphParameters,
      ...optional,
    };
  }

  public nodes: Node[];

  public edges: Edge[];

  // Edge subdivision points used for edge bundling
  public edgeSubdivisions?: EdgeSubdivisionPoints[];

  public parameters: GraphParameters;

  public abstract tick(): void;

  public abstract computeLayout(xMax: number, yMax: number): void;
}

export abstract class ConcreteSyntaxTree {
  constructor(rootNode: CstNode) {
    this.rootNode = rootNode;
  }

  protected rootNode: CstNode;

  public abstract buildGraph(): Graph;
}

export type NodeMappings = {
  [identifier: string]: [{
    tail: Node,
    head: Node,
    edge: EdgeSubdivisionPoints,
    edgeOptions: AdditionalAttributes
  }];
};
