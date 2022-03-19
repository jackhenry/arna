/* eslint-disable max-classes-per-file */
import EdgeBundler, {
  EdgeData, NodeData, EdgeSubdivisionPoints, TunableParametersOptional,
} from '@arna/edge-bundler';
import {
  AdditionalEdgeOptions,
  AdditionalNodeOptions,
  Edge,
  Graph,
  Node,
  NodeMappings,
  OptionalGraphParameters,
} from './types';

export class ArnaNode implements Node {
  public identifier: string;

  public positionX: number;

  public positionY: number;

  public forceX: number;

  public forceY: number;

  public options: AdditionalNodeOptions;

  constructor(
    identifier: string,
    maxRepulsiveDistance: number,
    maxVertexDisplacement: number,
    options: AdditionalNodeOptions,
  ) {
    this.identifier = identifier;
    this.positionX = ArnaNode.getRandomFloatBounded(-1 * maxRepulsiveDistance, maxVertexDisplacement);
    this.positionY = ArnaNode.getRandomFloatBounded(-1 * maxRepulsiveDistance, maxVertexDisplacement);
    this.forceX = 0;
    this.forceY = 0;
    this.options = options;
  }

  static getRandomFloatBounded(min: number, max: number): number {
    return Math.random() * (min - max) + max;
  }
}

export class ArnaEdge implements Edge {
  public tail: Node;

  public head: Node;

  public attraction: number;

  public options: AdditionalEdgeOptions;

  constructor(tail: Node, head: Node, options: AdditionalEdgeOptions) {
    this.tail = tail;
    this.head = head;
    this.attraction = 1;
    this.options = options;
  }
}

export class ArnaGraph extends Graph {
  public xLayoutMin: number;

  public xLayoutMax: number;

  public yLayoutMin: number;

  public yLayoutMax: number;

  constructor(nodes: Node[], edges: Edge[], parameters: OptionalGraphParameters) {
    super(nodes, edges, parameters);
    this.xLayoutMin = Infinity;
    this.xLayoutMax = -Infinity;
    this.yLayoutMin = Infinity;
    this.yLayoutMax = -Infinity;
  }

  public setEdgeSubdivisions(edgeSubdivisions: EdgeSubdivisionPoints[]) {
    this.edgeSubdivisions = edgeSubdivisions;
  }

  private calculateRepulsion(): void {
    const processed: Node[] = [];
    this.nodes.forEach((first) => {
      processed.forEach((second) => {
        if (!first || !second) {
          return;
        }

        let deltaX = second.positionX - first.positionX;
        let deltaY = second.positionY - first.positionY;
        let euclideanSq = deltaX ** 2 + deltaY ** 2;
        if (euclideanSq < 0.01) {
          deltaX = 0.1 * Math.random() + 0.1;
          deltaY = 0.1 * Math.random() + 0.1;
          euclideanSq = deltaX ** 2 + deltaY ** 2;
        }
        const euclidean = Math.sqrt(euclideanSq);
        // Only update node forces if current euclidean distance of nodes doesn't exceed threshold
        if (euclidean < this.parameters.maxRepulsiveDistance) {
          // (K^2) / d
          const repulsiveForce = this.parameters.optimalDistance ** 2 / euclidean;
          second.forceX += (repulsiveForce * deltaX) / euclidean;
          second.forceY += (repulsiveForce * deltaY) / euclidean;
          first.forceX -= (repulsiveForce * deltaX) / euclidean;
          first.forceY -= (repulsiveForce * deltaY) / euclidean;
        }
      });
      // Add the first node to the processed list so it can be compared in future iterations
      processed.push(first);
    });
  }

  private calculateAttraction(): void {
    this.edges.forEach((edge) => {
      const first = edge.tail;
      const second = edge.head;

      let deltaX = second.positionX - first.positionX;
      let deltaY = second.positionY - first.positionY;
      let euclidean_squared = deltaX ** 2 + deltaY ** 2;
      if (euclidean_squared < 0.01) {
        deltaX = 0.1 * Math.random() + 0.1;
        deltaY = 0.1 * Math.random() + 0.1;
        euclidean_squared = deltaX ** 2 + deltaY ** 2;
      }
      let euclidean = Math.sqrt(euclidean_squared);
      if (euclidean > this.parameters.maxRepulsiveDistance) {
        euclidean = this.parameters.maxRepulsiveDistance;
        euclidean_squared = euclidean ** 2;
      }
      // (d^2 - k^2)/k
      let attractiveForce = (euclidean_squared - this.parameters.optimalDistance ** 2)
        / this.parameters.optimalDistance;
      if (!edge.attraction) edge.attraction = 1;
      attractiveForce *= Math.log(edge.attraction) * 0.5 + 1;

      second.forceX -= (attractiveForce * deltaX) / euclidean;
      second.forceY -= (attractiveForce * deltaY) / euclidean;
      first.forceX += (attractiveForce * deltaX) / euclidean;
      first.forceY += (attractiveForce * deltaY) / euclidean;
    });
  }

  public bundleEdges(parameters: TunableParametersOptional) {
    const nodeData: NodeData = {};
    this.nodes.forEach((node) => {
      nodeData[node.identifier] = {
        x: node.positionX,
        y: node.positionY,
      };
    });
    const edgeData: EdgeData = this.edges.map((edge) => ({
      tail: edge.tail.identifier,
      head: edge.head.identifier,
    }));

    const bundler = new EdgeBundler(nodeData, edgeData, parameters);
    const edgeSubdivisions = bundler.bundle();
    this.setEdgeSubdivisions(edgeSubdivisions);
  }

  public nodeMappings(): NodeMappings {
    const nodeMappings: NodeMappings = {};
    this.edges.forEach((edge, edgeIndex) => {
      const { tail, head } = edge;
      const subdivisionPoints = (this.edgeSubdivisions && this.parameters.bundle) ? this.edgeSubdivisions[edgeIndex] : [];
      if (subdivisionPoints.length < 0) {
        subdivisionPoints.push(
          { x: tail.positionX, y: tail.positionY },
          { x: head.positionX, y: head.positionY },
        );
      }
      const group = {
        tail: edge.tail,
        head: edge.head,
        edge: subdivisionPoints,
        edgeOptions: edge.options,
      };

      if (tail.identifier in nodeMappings) {
        nodeMappings[tail.identifier].push(group);
      } else {
        nodeMappings[tail.identifier] = [group];
      }
      if (head.identifier in nodeMappings) {
        nodeMappings[head.identifier].push({
          tail: edge.head,
          head: edge.tail,
          edge: subdivisionPoints,
          edgeOptions: edge.options,
        });
      } else {
        nodeMappings[head.identifier] = [{
          tail: edge.head,
          head: edge.tail,
          edge: subdivisionPoints,
          edgeOptions: edge.options,
        }];
      }
    });
    return nodeMappings;
  }

  private commitChanges() {
    const C = this.parameters.c;
    const { maxVertexDisplacement } = this.parameters;
    this.nodes.forEach((node) => {
      let displacementX = C * node.forceX;
      let displacementY = C * node.forceY;

      if (displacementX > maxVertexDisplacement) displacementX = maxVertexDisplacement;
      if (displacementX < -1 * maxVertexDisplacement) displacementX = -1 * maxVertexDisplacement;
      if (displacementY > maxVertexDisplacement) displacementY = maxVertexDisplacement;
      if (displacementY < -1 * maxVertexDisplacement) displacementY = -1 * maxVertexDisplacement;

      node.positionX += displacementX;
      node.positionY += displacementY;
      // Update node position minimums and maximums
      this.xLayoutMin = node.positionX < this.xLayoutMin ? node.positionX : this.xLayoutMin;
      this.xLayoutMax = node.positionX > this.xLayoutMax ? node.positionX : this.xLayoutMax;
      this.yLayoutMin = node.positionY < this.yLayoutMin ? node.positionY : this.yLayoutMin;
      this.yLayoutMax = node.positionY > this.yLayoutMax ? node.positionY : this.yLayoutMax;
      // Reset force back to 0
      node.forceX = 0;
      node.forceY = 0;
    });
  }

  public tick(): void {
    this.calculateRepulsion();
    this.calculateAttraction();
    this.commitChanges();
  }

  public computeLayout(): void {
    for (let iteration = 0; iteration < this.parameters.maxTicks; iteration++) {
      this.tick();
    }
  }
}
