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

  private infoGroup: Konva.Group;

  private infoText: Konva.Text;

  private infoToggle: Konva.Group;

  private labels: Map<string, Konva.Group>;

  private transformer: Konva.Transformer;

  private stageConfig: Konva.StageConfig;

  private bgColor: string;

  private prerenderer: ArnaPreRenderer;

  private bundlerParameters: TunableParametersOptional;

  private graphLayoutParameters: OptionalGraphParameters;

  private renderParameters;

  private nodeMappings;

  constructor(
    graph: ArnaGraph,
    stageConfig: Konva.StageConfig,
    bundlerParameters: TunableParametersOptional,
    graphLayoutParameters: OptionalGraphParameters,
  ) {
    this.graph = graph;
    this.stageConfig = stageConfig;
    /**
     * Konva specific groups/layers/etc.
     */
    this.stage = new Konva.Stage(this.stageConfig);
    this.mainLayer = new Konva.Layer();
    this.staticGroup = new Konva.Group();
    this.transformer = new Konva.Transformer();
    this.labels = new Map<string, Konva.Group>();
    /**
     * Styling variables
     */
    // this.bgColor = tailwindConfig.theme.extend.colors.override.bg;
    this.bgColor = config.theme.extend.colors.override.bg;

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

    // Init the info text label
    this.infoToggle = new Konva.Group();
    this.infoGroup = new Konva.Group();
    this.infoText = new Konva.Text();
    this.initInfoText();
  }

  getCanvasWidth(): number {
    return this.stage.width();
  }

  getCanvasHeight(): number {
    return this.stage.height();
  }

  initInfoText() {
    const edgeCount = this.graph.edges.length;
    const nodeCount = this.graph.nodes.length;
    let labels = [
      `Node Count: ${nodeCount}`,
      `Edge Count: ${edgeCount}`,
      `Layout Iterations: ${this.graphLayoutParameters.maxTicks}`,
      `Force Coefficient (C): ${this.graphLayoutParameters.c}`,
      `Max Repulsive Force Distance: ${this.graphLayoutParameters.maxRepulsiveDistance}`,
      `Optimal Node Distance: ${this.graphLayoutParameters.optimalDistance}`,
    ];

    if (this.graphLayoutParameters.bundle) {
      labels = labels.concat(labels, [
        `Compatability Threshold: ${this.bundlerParameters.compatabilityThreshold}`,
        `Initial Step Size: ${this.bundlerParameters.initialStepSize}`,
        `Bundling Stiffness: ${this.bundlerParameters.bundlingStiffness}`,
        `Initial Subdivision Rate: ${this.bundlerParameters.subdivisionRate}`,
        `Initial Bundling Iterations: ${this.bundlerParameters.initialIterationCount}`,
        `Bundling Iteration Depreciation: ${this.bundlerParameters.iterationDecreaseRate}`,
      ]);
    }
    const width = (this.stageConfig.container as HTMLDivElement).offsetWidth;

    const labelElements = labels.map((label) => new Konva.Text({
      text: label,
      fontSize: 12,
      fontFamily: config.theme.fontFamily.mono,
      fill: config.theme.extend.colors.override.fg,
    }));

    let maxWidth = -Infinity;
    labelElements.forEach((element) => {
      const elementWidth = element.textWidth;
      maxWidth = elementWidth > maxWidth ? elementWidth : maxWidth;
    });

    labelElements.forEach((element, index) => {
      element.x(width - maxWidth);
      element.y(20 * (2 + index));
    });

    const toggle = new Konva.Text({
      x: width - maxWidth,
      y: 20,
      text: 'Click to show parameters ⯈',
      fontSize: 12,
      fontFamily: config.theme.fontFamily.mono,
      fill: config.theme.extend.colors.override.blue,
    });

    toggle.on('click', () => {
      this.infoGroup.visible(!this.infoGroup.visible());
      const newText = this.infoGroup.visible() ? 'Click to hide parameters ⯆' : 'Click to show parameters ⯈';
      toggle.text(newText);
    });

    this.infoToggle.add(toggle);
    this.infoGroup.add(...labelElements);
    this.infoGroup.visible(false);
    this.infoGroup.listening(false);
  }

  circle(x: number, y: number, radius: number, options: CircleOptions): Konva.Group {
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
      fill: this.bgColor,
      hitStrokeWidth: radius + 10,
    });

    circleGroup.add(bgCircle);
    circleGroup.add(fgCircle);
    return circleGroup;
  }

  lineGroup(points: Point[], options?: LineOptions): Konva.Group {
    const group: Konva.Group = new Konva.Group();
    for (let index = 0; index < points.length - 1; index++) {
      const point1 = points[index];
      const point2 = points[index + 1];
      let lineWidth = 2;
      try {
        lineWidth = options?.lineWidth ? +options.lineWidth : 2;
      } catch (conversionError) {
        //
      }
      const line = new Konva.Line({
        points: [point1.x, point1.y, point2.x, point2.y],
        stroke: options?.color || '#eeeeee',
        strokeWidth: lineWidth,
      });
      group.add(line);
    }
    return group;
  }

  positionLabel(x: number, y: number, text: Konva.Text, backdrop: Konva.Rect) {
    const textHeight = text.height();
    const textWidth = text.width();

    const xPos = x;
    const yPos = y;

    backdrop.width(textWidth + 20);
    backdrop.height(textHeight + 10);
    backdrop.x(xPos);
    backdrop.y(yPos);

    text.x(xPos + 10);
    text.y(yPos + 5);
  }

  label(text: string, x: number, y: number): Konva.Group {
    const { radius } = this.renderParameters;
    const labelY = y - radius - 20;
    const labelElement = new Konva.Text({
      y: y - radius - 20,
      text,
      fontSize: 12,
      fontStyle: 'bold',
      fontFamily: 'Inter, sans-serif',
      fill: '#eeeeee',
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

    // Create a rectangular background for the text
    const labelBackground = new Konva.Rect({
      x: offsettedX - 10,
      y: offsettedY - 5,
      stroke: chroma(this.bgColor).darken(0.2).hex(),
      strokeWidth: 2,
      fill: this.bgColor,
      width: textWidth + 20,
      height: labelElement.height() + 10,
    });

    const labelGroup = new Konva.Group();
    labelGroup.add(labelBackground);
    labelGroup.add(labelElement);

    return labelGroup;
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
      const backdrop = tailLabel.children[0] as Konva.Rect;
      const text = tailLabel.children[1] as Konva.Text;
      this.positionLabel(mousePos.x, mousePos.y, text, backdrop);
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
      const container = this.stageConfig.container as HTMLDivElement;

      const containerWidth = container.offsetWidth;
      const scale = containerWidth / this.getCanvasWidth();

      // Move info label position
      // Update static graph elements
      if (scale < this.stage.scaleX()) {
        console.table({
          containerWidth,
          canvas: this.getCanvasWidth(),
          scale,
        });
        this.stage.width(this.getCanvasWidth() * scale);
        this.stage.height(this.getCanvasHeight() * scale);
        this.stage.scale({ x: scale, y: scale });
        let fontSize = 24;
        if (containerWidth < 600) {
          fontSize = 40;
        }
        if (containerWidth < 400) {
          fontSize = 52;
        }
        [...Array.from(this.labels.values())].forEach((labelGroup) => {
          const text = labelGroup.children[1] as Konva.Text;

          text.fontSize(fontSize);
        });
        // this.stage.height(this.getCanvasHeight() * scale);
        // this.stage.width(this.getCanvasWidth() * scale);
        // this.stage.scale({ x: scale, y: scale });
        console.log(`container width ${containerWidth}`);
        console.log(`canvas width ${this.getCanvasWidth()}`);
      }
    };

    new ResizeObserver(fitToParent).observe(this.stageConfig.container as HTMLDivElement);
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
        tailElement = this.circle(
          tail.positionX,
          tail.positionY,
          this.renderParameters.radius,
          tail.options,
        );
        nodeMap.set(tail.identifier, tailElement);
      }

      // Create the label for the tail element
      const labelGroup = this.label(tail.options?.label || '', tail.positionX, tail.positionY);
      labelGroup.visible(false);
      labelGroup.listening(false);
      this.labels.set(tail.identifier, labelGroup);

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
          lineGroup = this.lineGroup(mapping.edge, mapping.edgeOptions);
          edgeMap.set(tailHeadId, lineGroup);
          edgeMap.set(headTailId, lineGroup);
        }

        let headElement: Konva.Group;
        if (nodeMap.has(head.identifier)) {
          headElement = nodeMap.get(head.identifier);
        } else {
          headElement = this.circle(
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
    // this.mainLayer.add(this.infoGroup);
    // this.mainLayer.add(this.infoToggle);
    this.stage.add(this.mainLayer);

    this.registerScalingHandler();
  }
}
