import Geometry from './geometry';
import Physics from './physics';
import {
  TunableParameters,
  NodeData,
  EdgeData,
  EdgeSubdivisionPoints,
  EdgeCompatabilityList,
  TunableParametersOptional,
  Edge,
} from './types';

const defaultParameters: TunableParameters = {
  bundlingStiffness: 0.1,
  initialStepSize: 0.1,
  initialSubdivision: 1,
  subdivisionRate: 2,
  cycleCount: 6,
  initialIterationCount: 90,
  iterationDecreaseRate: (2.0 / 3.0),
  compatabilityThreshold: 0.6,
  error: 1e-6,
};

export default class EdgeBundler {
  private nodeData: NodeData;

  private edgeData: EdgeData;

  public parameters: TunableParameters;

  private edgeSubdivisionPoints: EdgeSubdivisionPoints[] = [];

  private edgeCompatabilityList: EdgeCompatabilityList[] = [];

  constructor(nodeData: NodeData, edgeData: EdgeData, parameters?: TunableParametersOptional) {
    this.nodeData = nodeData;
    this.edgeData = edgeData;
    this.parameters = defaultParameters;
    if (parameters !== undefined) {
      this.parameters = {
        ...defaultParameters,
        ...parameters,
      };
    }
    this.filterInvalidEdges();
  }

  private initEdgeSubdivisionPoints(): void {
    this.edgeData.forEach((edge, index) => {
      if (this.parameters.initialSubdivision === 1) {
        this.edgeSubdivisionPoints[index] = [];
      } else {
        this.edgeSubdivisionPoints[index] = [];
        this.edgeSubdivisionPoints[index].push(this.nodeData[edge.tail]);
        this.edgeSubdivisionPoints[index].push(this.nodeData[edge.head]);
      }
    });
  }

  private initEdgeCompatabilityList() {
    this.edgeData.forEach((edge, index) => {
      this.edgeCompatabilityList[index] = [];
    });
  }

  private filterInvalidEdges(): EdgeData {
    // Filter out edges that connect two nodes which occupy the same space (within tolerance)
    return this.edgeData.filter((edge) => (
      this.nodeData[edge.tail].x !== this.nodeData[edge.head].x
        || this.nodeData[edge.tail].y !== this.nodeData[edge.head].y
    ));
  }

  private updateEdgeSubdivisions(subdivisionCount: number) {
    this.edgeData.forEach((edge, edgeIndex) => {
      if (subdivisionCount === 1) {
        this.edgeSubdivisionPoints[edgeIndex].push(this.nodeData[edge.tail]);
        this.edgeSubdivisionPoints[edgeIndex].push(
          Geometry.edgeMidpoint(this.nodeData[edge.tail], this.nodeData[edge.head]),
        );
        this.edgeSubdivisionPoints[edgeIndex].push(this.nodeData[edge.head]);
      } else {
        const dividedEdgeLength = Geometry.dividedEdgeLength(this.edgeSubdivisionPoints[edgeIndex]);
        const segmentLength = dividedEdgeLength / (subdivisionCount + 1);
        const newEdgeSubdivisions: EdgeSubdivisionPoints = [this.nodeData[edge.tail]];

        let currentSegmentLength = segmentLength;
        const subdivisions = this.edgeSubdivisionPoints[edgeIndex];
        for (let subdivisionIndex = 1; subdivisionIndex < subdivisions.length; subdivisionIndex++) {
        // this.edgeSubdivisionPoints[edgeIndex].forEach((subdivision, subdivisionIndex) => {
          const subdivision = subdivisions[subdivisionIndex];
          let oldSegmentLength = Geometry.euclideanDistance(
            subdivision,
            this.edgeSubdivisionPoints[edgeIndex][subdivisionIndex - 1],
          );

          while (oldSegmentLength > currentSegmentLength) {
            const percentPosition = currentSegmentLength / oldSegmentLength;
            const previousSubdivision = this.edgeSubdivisionPoints[edgeIndex][subdivisionIndex - 1];
            const newSubdivision = {
              x: previousSubdivision.x + (percentPosition * (subdivision.x - previousSubdivision.x)),
              y: previousSubdivision.y + (percentPosition * (subdivision.y - previousSubdivision.y)),
            };
            newEdgeSubdivisions.push(newSubdivision);

            oldSegmentLength -= currentSegmentLength;
            currentSegmentLength = segmentLength;
          }
          currentSegmentLength -= oldSegmentLength;
        }
        newEdgeSubdivisions.push(this.nodeData[this.edgeData[edgeIndex].head]);
        this.edgeSubdivisionPoints[edgeIndex] = newEdgeSubdivisions;
      }
    });
  }

  angleCompatibility(P: Edge, Q: Edge) {
    const pTail = this.nodeData[P.tail];
    const pHead = this.nodeData[P.head];
    const qTail = this.nodeData[Q.tail];
    const qHead = this.nodeData[Q.head];
    const { error } = this.parameters;
    const edgeLengthProduct = (
      Geometry.edgeLength(pTail, pHead, error) * Geometry.edgeLength(qTail, qHead, error)
    );
    const dotProduct = Geometry.vectorDotProduct(
      Geometry.edgeToVector(pTail, pHead),
      Geometry.edgeToVector(qTail, qHead),
    );

    return Math.abs(dotProduct / edgeLengthProduct);
  }

  scaleCompatability(P: Edge, Q: Edge) {
    const pTail = this.nodeData[P.tail];
    const pHead = this.nodeData[P.head];
    const qTail = this.nodeData[Q.tail];
    const qHead = this.nodeData[Q.head];
    const { error } = this.parameters;
    const pLength = Geometry.edgeLength(pTail, pHead, error);
    const qLength = Geometry.edgeLength(qTail, qHead, error);
    const averageEdgeLength = (pLength + qLength) / 2.0;

    return 2.0 / (
      (averageEdgeLength / Math.min(pLength, qLength))
      + (Math.max(pLength, qLength) / averageEdgeLength)
    );
  }

  positionCompatibility(P: Edge, Q: Edge) {
    const pTail = this.nodeData[P.tail];
    const pHead = this.nodeData[P.head];
    const qTail = this.nodeData[Q.tail];
    const qHead = this.nodeData[Q.head];
    const { error } = this.parameters;
    const pLength = Geometry.edgeLength(pTail, pHead, error);
    const qLength = Geometry.edgeLength(qTail, qHead, error);
    const averageEdgeLength = (pLength + qLength) / 2.0;
    const pMidpoint = Geometry.edgeMidpoint(pTail, pHead);
    const qMidpoint = Geometry.edgeMidpoint(qTail, qHead);
    const midpointDistance = Geometry.euclideanDistance(pMidpoint, qMidpoint);
    return averageEdgeLength / (averageEdgeLength + midpointDistance);
  }

  edgeVisibility(P: Edge, Q: Edge) {
    const pTail = this.nodeData[P.tail];
    const pHead = this.nodeData[P.head];
    const qTail = this.nodeData[Q.tail];
    const qHead = this.nodeData[Q.head];
    const tailProjection = Geometry.projectPointOnLine(qTail, pTail, pHead);
    const headProjection = Geometry.projectPointOnLine(qHead, pTail, pHead);
    const projectionMidpoint = Geometry.edgeMidpoint(tailProjection, headProjection);
    const pMidpoint = Geometry.edgeMidpoint(pTail, pHead);
    const midpointsDistance = Geometry.euclideanDistance(pMidpoint, projectionMidpoint);
    const projectionDistance = Geometry.euclideanDistance(tailProjection, headProjection);
    return Math.max(0, 1 - ((2 * midpointsDistance) / projectionDistance));
  }

  visibilityCompatibility(P: Edge, Q: Edge) {
    return Math.min(this.edgeVisibility(P, Q), this.edgeVisibility(Q, P));
  }

  compatibilityScore(P: Edge, Q: Edge) {
    return this.angleCompatibility(P, Q)
      * this.scaleCompatability(P, Q)
      * this.positionCompatibility(P, Q)
      * this.visibilityCompatibility(P, Q);
  }

  isCompatible(P: Edge, Q: Edge) {
    return this.compatibilityScore(P, Q) >= this.parameters.compatabilityThreshold;
  }

  updateCompatibilityList() {
    for (let eIdx = 0; eIdx < this.edgeData.length - 1; eIdx++) {
      for (let otherIdx = eIdx + 1; otherIdx < this.edgeData.length; otherIdx++) {
        if (this.isCompatible(this.edgeData[eIdx], this.edgeData[otherIdx])) {
          this.edgeCompatabilityList[eIdx].push(otherIdx);
          this.edgeCompatabilityList[otherIdx].push(eIdx);
        }
      }
    }
  }

  bundle(): EdgeSubdivisionPoints[] {
    let stepSize = this.parameters.initialStepSize; // S
    let iterations = this.parameters.initialIterationCount; // I
    let subdivisionCount = this.parameters.initialSubdivision; // P

    this.initEdgeSubdivisionPoints();
    this.initEdgeCompatabilityList();
    this.updateEdgeSubdivisions(subdivisionCount);
    this.updateCompatibilityList();

    [...Array(this.parameters.cycleCount)].forEach(() => {
      [...Array(Math.round(iterations))].forEach(() => {
        const forces = this.edgeData.map(
          (edge, edgeIndex) => Physics.applyForcesOnEdgeSubdivisionPoints(
            this.edgeData,
            this.nodeData,
            this.edgeSubdivisionPoints,
            this.edgeCompatabilityList,
            edgeIndex,
            subdivisionCount,
            stepSize,
            this.parameters,
          ),
        );

        this.edgeData.forEach((edge, edgeIndex) => {
          [...Array(subdivisionCount + 1)].forEach((_subdivision, subdivisionIndex) => {
            const xForce = forces[edgeIndex][subdivisionIndex].x;
            const yForce = forces[edgeIndex][subdivisionIndex].y;
            this.edgeSubdivisionPoints[edgeIndex][subdivisionIndex].x += xForce;
            this.edgeSubdivisionPoints[edgeIndex][subdivisionIndex].y += yForce;
          });
        });
      });
      stepSize /= 2;
      subdivisionCount *= this.parameters.subdivisionRate;
      iterations *= this.parameters.iterationDecreaseRate;
      this.updateEdgeSubdivisions(subdivisionCount);
    });
    return this.edgeSubdivisionPoints;
  }
}
