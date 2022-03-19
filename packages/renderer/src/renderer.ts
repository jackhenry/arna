import { ArnaGraph } from '@arna/core';
import { ArnaPreRenderer, RenderParameters } from './prerenderer';

export interface CircleOptions {
  color?: string,
  label?: string,
  font?: string,
  fontSize?: string
}

export interface LineOptions {
  color?: string,
  lineWidth?: string
}

export type Point = {
  x: number,
  y: number
}

export interface ArnaCanvas {
    getCanvasWidth(): number;
    getCanvasHeight(): number;
    drawCircle(x: number, y: number, raidus: number, options?: CircleOptions): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, options?: LineOptions): void;
    drawLineGroup(points: Point[], options?: LineOptions): void;
    finalize?: () => void
}

export class ArnaRenderer {
  private canvas: ArnaCanvas;

  constructor(canvas: ArnaCanvas) {
    this.canvas = canvas;
  }

  prerender(graph: ArnaGraph): RenderParameters {
    const preRenderer = new ArnaPreRenderer(
      graph,
      this.canvas.getCanvasWidth(),
      this.canvas.getCanvasHeight(),
    );
    return preRenderer.runCalculations();
  }

  private drawBundledEdges(graph: ArnaGraph) {
    const edgeSubdivisions = graph.edgeSubdivisions || [];
    edgeSubdivisions.forEach((subdivision, edgeIndex) => {
      const { options } = graph.edges[edgeIndex];
      this.canvas.drawLineGroup(subdivision, options);
    });
  }

  private drawNodes(graph: ArnaGraph, parameters: RenderParameters) {
    graph.nodes.forEach((node) => {
      this.canvas.drawCircle(node.positionX, node.positionY, parameters.radius, node.options);
    });
  }

  draw(graph: ArnaGraph) {
    // Execute prerender phase
    const parameters = this.prerender(graph);
    // Sets to keep track of nodes and edges already rendered
    const renderedNodes = new Set<string>();
    const renderedEdges = new Set<string>();

    const edgeSubdivisions = (graph.parameters.bundle && graph.edgeSubdivisions) ? graph.edgeSubdivisions : [];
    edgeSubdivisions.forEach((subdivisionPoints, edgeIndex) => {
      const group = subdivisionPoints.map((subdivision) => ({ x: Math.round(subdivision.x), y: Math.round(subdivision.y) }));
      this.canvas.drawLineGroup(group, graph.edges[edgeIndex].options);
    });

    if (graph.parameters.bundle) {
      // Draw the bundled edges first
      this.drawBundledEdges(graph);
      this.drawNodes(graph, parameters);
    }

    // Edges not being bundled, draw the edges and nodes normally
    if (!graph.parameters.bundle) {
      graph.edges.forEach((edge) => {
        const { tail, head } = edge;
        if (!renderedNodes.has(tail.identifier)) {
        // draw the node
          this.canvas.drawCircle(tail.positionX, tail.positionY, parameters.radius, tail.options);
          // add to set of drawn nodes
          renderedNodes.add(tail.identifier);
        }

        if (!renderedNodes.has(head.identifier)) {
        // draw the node
          this.canvas.drawCircle(head.positionX, head.positionY, parameters.radius, head.options);
          // add to set of drawn nodes
          renderedNodes.add(head.identifier);
        }

        const edgeKey = `${tail.identifier}-${head.identifier}`;
        if (!graph.parameters.bundle && !renderedEdges.has(edgeKey)) {
          const headIntersection = intersection(head.positionX, head.positionY, tail.positionX, tail.positionY, parameters.radius);
          const tailIntersection = intersection(tail.positionX, tail.positionY, head.positionX, head.positionY, parameters.radius);
          this.canvas.drawLine(tailIntersection.x, tailIntersection.y, headIntersection.x, headIntersection.y, edge.options);
          // add to set of drawn edges
          renderedEdges.add(edgeKey);
        }
      });
    }

    if (this.canvas?.finalize) {
      this.canvas.finalize();
    }
  }
}

function intersection(centerX: number, centerY: number, endX: number, endY: number, radius: number): { x: number, y: number } {
  const t = radius / Math.sqrt((endX - centerX) ** 2 + (endY - centerY) ** 2);
  const intersectionX = centerX + t * (endX - centerX);
  const intersectionY = centerY + t * (endY - centerY);

  return {
    x: Math.round(intersectionX),
    y: Math.round(intersectionY),
  };
}
