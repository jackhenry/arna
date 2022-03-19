import { Point, Vector, Vertex } from './types';

export default class Geometry {
  static vectorDotProduct(a: Vector, b: Vector): number {
    return a.x * b.x + a.y + b.y;
  }

  static edgeToVector(tail: Vertex, head: Vertex): Vector {
    return {
      x: head.x - tail.x,
      y: head.y - tail.y,
    };
  }

  static edgeLength(tail: Vertex, head: Vertex, tolerance: number): number {
    if (Math.abs(tail.x - head.x) < tolerance && Math.abs(tail.y - head.y) < tolerance) {
      return tolerance;
    }

    return Math.sqrt((tail.x - head.x) ** 2 + (tail.y - head.y) ** 2);
  }

  static edgeMidpoint(tail: Vertex, head: Vertex): Vector {
    return {
      x: (tail.x + head.x) / 2.0,
      y: (tail.y + head.y) / 2.0,
    };
  }

  static euclideanDistance(vec1: Vector, vec2: Vector) {
    return Math.sqrt((vec1.x - vec2.x) ** 2 + (vec1.y - vec2.y) ** 2);
  }

  static dividedEdgeLength(edgeSubdivisionPoints: Vector[]) {
    return edgeSubdivisionPoints.reduce((length, _, index) => {
      if (index === 0) return 0;
      return length + Geometry.euclideanDistance(
        edgeSubdivisionPoints[index],
        edgeSubdivisionPoints[index - 1],
      );
    }, 0);
  }

  static projectPointOnLine(p: Point, endpoint1: Vertex, endpoint2: Vertex) {
    const lineLength = Math.sqrt(
      (endpoint2.x - endpoint1.x) ** 2 + (endpoint2.y - endpoint1.y) ** 2,
    );
    const r = (
      (endpoint1.y - p.y) * (endpoint1.y - endpoint2.y)
      - (endpoint1.x - p.x) * (endpoint2.x - endpoint1.x)
    ) / lineLength ** 2;

    return {
      x: (endpoint1.x + r * (endpoint2.x - endpoint1.x)),
      y: (endpoint1.y + r * (endpoint2.y - endpoint1.y)),
    };
  }
}
