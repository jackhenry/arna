<script lang="ts">
  import {
    ArnaAstSemanticAnalyzer,
    ArnaAstVisitor,
    ArnaLexer,
    ArnaParser,
    type DocumentAstNode,
    type OptionalGraphParameters,
  } from "@arna/core";
  import type { TunableParametersOptional } from "@arna/edge-bundler";
  import type Konva from "konva";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import CustomCanvas from "./lib/custom_canvas";
  import {
    bundlingStiffness,
    code,
    compatabilityScore,
    forceCoefficient,
    initialBundlingIterations,
    initialStepSize,
    initialSubdivisionRate,
    iterationDecreaseRate,
    iterations,
    maxRepulsiveDistance,
    optimalDistance,
  } from "./lib/store";

  let canvasElement: HTMLDivElement;
  let codeUnsubscription: Unsubscriber;

  const getGraphParameters = () => {
    const compatability = compatabilityScore.choices[$compatabilityScore];
    const initialStep = initialStepSize.choices[$initialStepSize];
    const bundleStiffness = bundlingStiffness.choices[$bundlingStiffness];
    const initialSubRate =
      initialSubdivisionRate.choices[$initialSubdivisionRate];
    const initialBundleIterations =
      initialBundlingIterations.choices[$initialBundlingIterations];
    const initialIterationDecrease =
      iterationDecreaseRate.choices[$iterationDecreaseRate];
    const parameters: TunableParametersOptional = {
      compatabilityThreshold: compatability,
      initialStepSize: initialStep,
      bundlingStiffness: bundleStiffness,
      subdivisionRate: initialSubRate,
      initialIterationCount: initialBundleIterations,
      iterationDecreaseRate: initialIterationDecrease,
    };
    return parameters;
  };

  const drawGraph = () => {
    if (!$code) return;

    const lexingResult = ArnaLexer.tokenize($code);
    ArnaParser.input = lexingResult.tokens;
    const rootNode = ArnaParser.document();
    // Check for parsing errors
    if (ArnaParser.errors.length > 0) {
      console.error("Encountered errors during parsing");
      ArnaParser.errors.forEach((err: Error) => {
        console.error(err);
      });
    }
    // Process the ast and create a graph object
    const ast = ArnaAstVisitor.visit(rootNode) as DocumentAstNode;
    const layoutParameters: OptionalGraphParameters = {
      maxTicks: iterations.choices[$iterations],
      maxRepulsiveDistance: maxRepulsiveDistance.choices[$maxRepulsiveDistance],
      optimalDistance: optimalDistance.choices[$optimalDistance],
      c: forceCoefficient.choices[$forceCoefficient],
      bundle: ast.graphAttributes.keyValuePairs.bundle,
    };
    const semanticAnalyzer = new ArnaAstSemanticAnalyzer(layoutParameters);
    const graph = semanticAnalyzer.analyze(ast);
    // Create the canvas and draw
    const height = 1400;
    const width = 1400;
    const stageConfig: Konva.StageConfig = {
      container: canvasElement,
      height: height,
      width: width,
    };
    const graphParameters = getGraphParameters();
    const customCanvas = new CustomCanvas(
      graph,
      stageConfig,
      graphParameters,
      layoutParameters
    );

    customCanvas.draw();
  };

  onMount(() => {
    codeUnsubscription = code.subscribe(() => {
      drawGraph();
    });
  });

  onDestroy(() => codeUnsubscription());
</script>

<div
  bind:this={canvasElement}
  class="outline outline-1 outline-override-neutral-50/50 w-full mx-auto my-8 flex items-center space-x-4"
/>
