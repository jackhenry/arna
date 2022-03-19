import Konva from 'konva';
import chroma from 'chroma-js';
import type { ArnaGraph, OptionalGraphParameters } from '@arna/core';
import { ArnaPreRenderer } from '@arna/renderer';
import type { CircleOptions, LineOptions, Point } from '@arna/renderer';
import type { TunableParametersOptional } from '@arna/edge-bundler';
import config from '../../tailwind.config';

export default class CustomCanvas {
  private graph: ArnaGraph;

  public stage: Konva.Stage;

  private mainLayer: Konva.Layer;

  private staticGroup: Konva.Group;

  private labels: Map<string, Konva.Text>;

  private transformer: Konva.Transformer;

  private stageConfig: Konva.StageConfig;

  private stageParent: HTMLDivElement;

  private prerenderer: ArnaPreRenderer;

  private bundlerParameters: TunableParametersOptional;

  private graphLayoutParameters: OptionalGraphParameters;

  private renderParameters;

  private nodeMappings;

  private virtualWidth: number;

  constructor(
    graph: ArnaGraph,
    stageConfig: Konva.StageConfig,
    bundlerParameters: TunableParametersOptional,
    graphLayoutParameters: OptionalGraphParameters,
  ) {
    this.graph = graph;
    this.stageConfig = stageConfig;
    this.virtualWidth = stageConfig.width;
    this.stageParent = document.getElementById('stage-parent') as HTMLDivElement;
    /**
     * Konva specific groups/layers/etc.
     */
    this.stage = new Konva.Stage(this.stageConfig);
    this.mainLayer = new Konva.Layer();
    this.staticGroup = new Konva.Group();
    this.transformer = new Konva.Transformer();
    this.labels = new Map<string, Konva.Text>();

    this.graphLayoutParameters = graphLayoutParameters;
    /**
     * Create Arna pre-renderer and run calculations in order to compute transformations
     */
    this.bundlerParameters = bundlerParameters;
    this.prerenderer = new ArnaPreRenderer(
      this.graph,
      this.getCanvasWidth(),
      this.getCanvasHeight(),
    );
    this.renderParameters = this.prerenderer.runCalculations(this.bundlerParameters);
    this.nodeMappings = this.graph.nodeMappings();
  }

  getCanvasWidth(): number {
    return this.stage.width();
  }

  getCanvasHeight(): number {
    return this.stage.height();
  }

  getResponsiveFontSize(): number {
    if (this.stageParent.offsetWidth < 600) {
      return 40;
    }

    return 24;
  }

  private static circle(x: number, y: number, radius: number, options: CircleOptions): Konva.Group {
    const circleGroup = new Konva.Group();
    const fgCircle = new Konva.Circle({
      x,
      y,
      radius,
      fill: options?.color,
      hitStrokeWidth: radius + 10,
    });
    const bgCircle = new Konva.Circle({
      x,
      y,
      radius,
      fill: config.theme.extend.colors.override.bg,
      hitStrokeWidth: radius + 10,
    });

    circleGroup.add(bgCircle);
    circleGroup.add(fgCircle);
    return circleGroup;
  }

  private static lineGroup(points: Point[], options?: LineOptions): Konva.Group {
    const group: Konva.Group = new Konva.Group();
    for (let index = 0; index < points.length - 1; index++) {
      const point1 = points[index];
      const point2 = points[index + 1];
      const lineWidth = options?.lineWidth ? +options.lineWidth : 2;
      const line = new Konva.Line({
        points: [point1.x, point1.y, point2.x, point2.y],
        stroke: options?.color || config.theme.extend.colors.override.fg,
        strokeWidth: lineWidth,
      });
      group.add(line);
    }
    return group;
  }

  private positionLabel(x: number, y: number, text: Konva.Text) {
    text.fontSize(this.getResponsiveFontSize());
    const canvasScale = this.stage.scaleX();
    const textWidth = text.textWidth * this.stage.scaleX();
    let xPos = x * canvasScale;

    // Prevent label from going off the right side of the screen
    if (xPos + textWidth > this.stageParent.offsetWidth) {
      xPos -= textWidth + (22 * this.stage.scaleX());
    }

    text.x(xPos / canvasScale);
    text.y(y);
  }

  label(text: string, x: number, y: number): Konva.Text {
    const { radius } = this.renderParameters;
    const labelY = y - radius - 20;
    const labelElement = new Konva.Text({
      y: y - radius - 20,
      text,
      fontSize: this.getResponsiveFontSize(),
      fontStyle: 'bold',
      fontFamily: '\'Source Code Pro\', monospace',
      fill: config.theme.extend.colors.override.fg,
      align: 'center',
    });
    const { textWidth } = labelElement;
    let offsettedX = x - textWidth / 2;
    if (offsettedX + textWidth > this.getCanvasWidth()) {
      offsettedX -= (offsettedX + textWidth + 12) - this.getCanvasWidth();
    }
    if (offsettedX < 0) {
      offsettedX = 0;
    }
    // The y position of the label is above the node. Must checking less than 0 case.
    let offsettedY = labelY;
    if (labelY < 0) {
      offsettedY = y + radius + 20;
    }
    labelElement.x(offsettedX);
    labelElement.y(offsettedY);

    return labelElement;
  }

  registerHighlightEvent(
    tailId: string,
    tailNodeElement: Konva.Group,
    connections: Konva.Group[],
  ): void {
    const tailLabel = this.labels.get(tailId);
    const tailCircle = tailNodeElement.children[1] as Konva.Circle;

    tailNodeElement.addEventListener('mouseenter touchstart', () => {
      // Make label visible
      const mousePos = this.staticGroup.getRelativePointerPosition();
      const text = tailLabel;
      this.positionLabel(mousePos.x, mousePos.y, text);
      tailLabel.visible(true);

      tailCircle.setAttr('previousFill', tailCircle.fill());
      tailCircle.fill(chroma(tailCircle.fill()).alpha(1).hex('rgba'));

      connections.forEach((connection) => {
        connection.children.forEach((child) => {
          if (child instanceof Konva.Line) {
            const currentStroke = child.stroke();
            child.setAttr('previousStroke', currentStroke);
            child.stroke(chroma(currentStroke).alpha(1).hex('rgba'));
          }

          if (child instanceof Konva.Circle) {
            const currentFill = child.fill();
            child.setAttr('previousFill', currentFill);
            child.fill(chroma(currentFill).alpha(1).hex('rgba'));
          }
        });
      });
    });

    // Point moves off of node
    tailNodeElement.addEventListener('mouseleave touchend', () => {
      // Hide label
      tailLabel.visible(false);

      tailCircle.fill(tailCircle.getAttr('previousFill'));
      connections.forEach((connection) => {
        connection.children.forEach((child) => {
          if (child instanceof Konva.Line) {
            const previousStroke = child.getAttr('previousStroke');
            child.stroke(previousStroke);
          }

          if (child instanceof Konva.Circle) {
            const previousFill = child.getAttr('previousFill');
            child.fill(previousFill);
          }
        });
      });
    });
  }

  registerScalingHandler() {
    const fitToParent = () => {
      const container = this.stageParent;

      const containerWidth = container.offsetWidth;
      const scale = containerWidth / this.virtualWidth;

      this.stage.width(this.virtualWidth * scale);
      this.stage.height(this.virtualWidth * scale);
      this.stage.scale({ x: scale, y: scale });
      let fontSize = 24;
      if (containerWidth < 600) {
        fontSize = 40;
      }
      if (containerWidth < 400) {
        fontSize = 52;
      }
      [...Array.from(this.labels.values())].forEach((text) => {
        text.fontSize(fontSize);
      });
    };

    new ResizeObserver(fitToParent).observe(this.stageParent);
  }

  draw() {
    const edgeMap = new Map<string, Konva.Group>();
    const nodeMap = new Map<string, Konva.Group>();
    Object.keys(this.nodeMappings).forEach((key) => {
      const mappings = this.nodeMappings[key];
      const { tail } = mappings[0];
      let tailElement: Konva.Group;
      if (nodeMap.has(tail.identifier)) {
        tailElement = nodeMap.get(tail.identifier);
      } else {
        tailElement = CustomCanvas.circle(
          tail.positionX,
          tail.positionY,
          this.renderParameters.radius,
          tail.options,
        );
        nodeMap.set(tail.identifier, tailElement);
      }

      // Create the label for the tail element
      const label = this.label(tail.options?.label || '', tail.positionX, tail.positionY);
      label.visible(false);
      label.listening(false);
      this.labels.set(tail.identifier, label);

      let highlightedElements: Konva.Group[] = [];
      mappings.forEach((mapping: any) => {
        const { head } = mapping;
        const tailHeadId = `${tail.identifier}--${head.identifier}`;
        const headTailId = `${head.identifier}--${tail.identifier}`;
        let lineGroup: Konva.Group;
        if (edgeMap.has(tailHeadId)) {
          lineGroup = edgeMap.get(tailHeadId);
        } else if (edgeMap.has(headTailId)) {
          lineGroup = edgeMap.get(headTailId);
        } else {
          lineGroup = CustomCanvas.lineGroup(mapping.edge, mapping.edgeOptions);
          edgeMap.set(tailHeadId, lineGroup);
          edgeMap.set(headTailId, lineGroup);
        }

        let headElement: Konva.Group;
        if (nodeMap.has(head.identifier)) {
          headElement = nodeMap.get(head.identifier);
        } else {
          headElement = CustomCanvas.circle(
            head.positionX,
            head.positionY,
            this.renderParameters.radius,
            head.options,
          );
          nodeMap.set(head.identifier, headElement);
        }

        highlightedElements = [headElement, ...highlightedElements];
        highlightedElements = [...highlightedElements, lineGroup];
      });
      this.registerHighlightEvent(tail.identifier, tailElement, highlightedElements);
    });

    this.staticGroup.add(...Array.from(edgeMap.values()));
    this.staticGroup.add(...Array.from(nodeMap.values()));
    this.staticGroup.add(...Array.from(this.labels.values()));
    this.mainLayer.add(this.transformer);
    this.transformer.add(this.staticGroup);
    this.mainLayer.add(this.staticGroup);
    this.stage.add(this.mainLayer);

    this.registerScalingHandler();
  }
}
