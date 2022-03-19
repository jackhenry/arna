import Geometry from './geometry';
import {
  Vertex, EdgeSubdivisionPoints, EdgeCompatabilityList, EdgeData, NodeData, TunableParameters,
} from './types';

type ForceVector = Vertex;

export default class Physics {
  static applySpringForce(edgeSubdivisionPoints: Vertex[], index: number, kP: number): ForceVector {
    const previous = edgeSubdivisionPoints[index - 1];
    const next = edgeSubdivisionPoints[index + 1];
    const current = edgeSubdivisionPoints[index];

    return {
      x: kP * (previous.x - current.x + next.x - current.x),
      y: kP * (previous.y - current.y + next.y - current.y),
    };
  }

  static applyElectrostaticForce(
    edgeSubdivisionPoints: EdgeSubdivisionPoints[],
    edgeCompatabilityList: EdgeCompatabilityList[],
    edgeIndex: number,
    index: number,
    tolerance: number,
  ) {
    return edgeCompatabilityList[edgeIndex].reduce<ForceVector>((previous, compatible) => {
      const force: ForceVector = {
        x: edgeSubdivisionPoints[compatible][index].x - edgeSubdivisionPoints[edgeIndex][index].x,
        y: edgeSubdivisionPoints[compatible][index].y - edgeSubdivisionPoints[edgeIndex][index].y,
      };

      if ((Math.abs(force.x) > tolerance) || Math.abs(force.y) > tolerance) {
        const tail = edgeSubdivisionPoints[compatible][index];
        const head = edgeSubdivisionPoints[edgeIndex][index];
        const difference = (1 / Geometry.edgeLength(tail, head, -Infinity));
        return {
          x: previous.x + force.x * difference,
          y: previous.y + force.y * difference,
        };
      }

      return {
        x: previous.x,
        y: previous.y,
      };
    }, { x: 0, y: 0 });
  }

  static applyForcesOnEdgeSubdivisionPoints(
    edgeData: EdgeData,
    nodeData: NodeData,
    edgeSubdivisionPoints: EdgeSubdivisionPoints[],
    edgeCompatabilityList: EdgeCompatabilityList[],
    edgeIndex: number,
    subdivisionRate: number,
    stepSize: number,
    parameters: TunableParameters,
  ): ForceVector[] {
    const edge = edgeData[edgeIndex];
    const kP = parameters.bundlingStiffness / (Geometry.edgeLength(
      nodeData[edge.tail],
      nodeData[edge.head],
      parameters.error,
    ) * (subdivisionRate + 1));

    const resultingForcesForEdgeSubdivisions: ForceVector[] = [{
      x: 0,
      y: 0,
    }];
    for (let i = 1; i < subdivisionRate + 1; i++) {
      const resultingForce: ForceVector = {
        x: 0,
        y: 0,
      };

      const springForce = Physics.applySpringForce(edgeSubdivisionPoints[edgeIndex], i, kP);
      const electroStaticForce = Physics.applyElectrostaticForce(
        edgeSubdivisionPoints,
        edgeCompatabilityList,
        edgeIndex,
        i,
        stepSize,
      );

      resultingForce.x = stepSize * (springForce.x + electroStaticForce.x);
      resultingForce.y = stepSize * (springForce.y + electroStaticForce.y);
      resultingForcesForEdgeSubdivisions.push(resultingForce);
    }

    resultingForcesForEdgeSubdivisions.push({
      x: 0,
      y: 0,
    });

    return resultingForcesForEdgeSubdivisions;
  }
}
