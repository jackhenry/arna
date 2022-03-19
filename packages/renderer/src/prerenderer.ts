import { ArnaGraph } from '@arna/core';
import { TunableParametersOptional } from '@arna/edge-bundler';

export type RenderParameters = {
    radius: number,
};

export class ArnaPreRenderer {
  private RADIUS = 12;

  private graph: ArnaGraph;

  private width: number;

  private height: number;

  private xScale: number;

  private yScale: number;

  constructor(graph: ArnaGraph, width: number, height: number) {
    this.graph = graph;
    this.width = width;
    this.height = height;
    this.xScale = (this.width - 2 * this.RADIUS) / (this.graph.xLayoutMax - this.graph.xLayoutMin);
    this.yScale = (this.height - 2 * this.RADIUS) / (this.graph.yLayoutMax - this.graph.yLayoutMin);
  }

  translate(xPosition: number, yPosition: number): { x: number, y: number } {
    return {
      x: Math.round((xPosition - this.graph.xLayoutMin) * this.xScale + this.RADIUS),
      y: Math.round((yPosition - this.graph.yLayoutMin) * this.yScale + this.RADIUS),
    };
  }

  /**
   * Uses the layout min/max values to center the graph in the canvas.
   */
  centerGraph(): void {
    let newXLayoutMin = Infinity;
    let newXLayoutMax = -Infinity;
    let newYLayoutMin = Infinity;
    let newYLayoutMax = -Infinity;
    const xOffset = Math.round(this.width / 2) - Math.round((this.graph.xLayoutMin + this.graph.xLayoutMax) / 2);
    const yOffset = Math.round(this.height / 2) - Math.round((this.graph.yLayoutMin + this.graph.yLayoutMax) / 2);
    this.graph.nodes.forEach((node) => {
      node.positionX += xOffset;
      node.positionY += yOffset;
      newXLayoutMin = node.positionX < newXLayoutMin ? node.positionX : newXLayoutMin;
      newXLayoutMax = node.positionX > newXLayoutMax ? node.positionX : newXLayoutMax;
      newYLayoutMin = node.positionY < newYLayoutMin ? node.positionY : newYLayoutMin;
      newYLayoutMax = node.positionY > newYLayoutMax ? node.positionY : newYLayoutMax;
    });
    this.graph.xLayoutMin = newXLayoutMin;
    this.graph.xLayoutMax = newXLayoutMax;
    this.graph.yLayoutMin = newYLayoutMin;
    this.graph.yLayoutMax = newYLayoutMax;
  }

  translateNodePositions(): void {
    // Placeholders for new layout min/max values
    let newXLayoutMin = Infinity;
    let newXLayoutMax = -Infinity;
    let newYLayoutMin = Infinity;
    let newYLayoutMax = -Infinity;
    this.graph.nodes.forEach((node) => {
      const translatedPositions = this.translate(node.positionX, node.positionY);
      // Update node positions
      node.positionX = translatedPositions.x;
      node.positionY = translatedPositions.y;
      // Update node position minimums and maximums
      newXLayoutMin = node.positionX < newXLayoutMin ? node.positionX : newXLayoutMin;
      newXLayoutMax = node.positionX > newXLayoutMax ? node.positionX : newXLayoutMax;
      newYLayoutMin = node.positionY < newYLayoutMin ? node.positionY : newYLayoutMin;
      newYLayoutMax = node.positionY > newYLayoutMax ? node.positionY : newYLayoutMax;
    });
    this.graph.xLayoutMin = newXLayoutMin;
    this.graph.xLayoutMax = newXLayoutMax;
    this.graph.yLayoutMin = newYLayoutMin;
    this.graph.yLayoutMax = newYLayoutMax;
  }

  /*
   * Initiates the necessary calculations to translate the
   * points of each node to match the canvas dimensions
   */
  runCalculations(parameters?: TunableParametersOptional): RenderParameters {
    this.translateNodePositions();
    this.centerGraph();
    // Check if the graph edges need to be bundled
    if (this.graph.parameters.bundle) {
      this.graph.bundleEdges(parameters || {});
    }
    // TODO: Figure out a good way to calculate radius
    return {
      radius: this.RADIUS,
    };
  }
}
