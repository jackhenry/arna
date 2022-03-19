<script lang="ts">
  import CheckboxGroup from "./lib/CheckboxGroup.svelte";
  import Collapse from "./lib/Collapse.svelte";
  import {
    bundlingStiffness,
    compatabilityScore,
    edgeCount,
    forceCoefficient,
    initialBundlingIterations,
    initialStepSize,
    initialSubdivisionRate,
    iterationDecreaseRate,
    iterations,
    maxRepulsiveDistance,
    optimalDistance,
  } from "./lib/store";
</script>

<div
  class="mb-2 rounded flex flex-col w-full text-neutral-200 font-mono bg-override-neutral-900/30 outline-thin"
>
  <Collapse>
    <span slot="label">Graph Layout Algorithm</span>
    <svelte:fragment slot="content">
      <CheckboxGroup
        label="Iterations"
        values={iterations.choices}
        defaultIndex={$iterations}
        onIndexChange={(index) => {
          $iterations = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Force Coefficient"
        values={forceCoefficient.choices}
        defaultIndex={$forceCoefficient}
        onIndexChange={(index) => {
          $forceCoefficient = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Max Repulsive Force Distance"
        values={maxRepulsiveDistance.choices}
        defaultIndex={$maxRepulsiveDistance}
        onIndexChange={(index) => {
          $maxRepulsiveDistance = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Optimal Node Distance"
        values={optimalDistance.choices}
        defaultIndex={$optimalDistance}
        onIndexChange={(index) => {
          $optimalDistance = index;
        }}
      />
    </svelte:fragment>
  </Collapse>
  <Collapse>
    <span slot="label">Edge Bundling</span>
    <svelte:fragment slot="content">
      <CheckboxGroup
        label="Compatability Threshold"
        values={compatabilityScore.choices}
        defaultIndex={$compatabilityScore}
        onIndexChange={(index) => {
          $compatabilityScore = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Initial Step Size"
        values={initialStepSize.choices}
        defaultIndex={$initialStepSize}
        onIndexChange={(index) => {
          $initialStepSize = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Bundling Stiffness Coefficient"
        values={bundlingStiffness.choices}
        defaultIndex={$bundlingStiffness}
        onIndexChange={(index) => {
          $bundlingStiffness = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Initial Subdivision Rate"
        values={initialSubdivisionRate.choices}
        defaultIndex={$initialSubdivisionRate}
        onIndexChange={(index) => {
          $initialSubdivisionRate = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Initial Bundling Iterations"
        values={initialBundlingIterations.choices}
        defaultIndex={$initialBundlingIterations}
        onIndexChange={(index) => {
          $initialBundlingIterations = index;
        }}
        class="mb-4"
      />
      <CheckboxGroup
        label="Bundling Iteration Depreciation Rate"
        values={iterationDecreaseRate.choices}
        defaultIndex={$iterationDecreaseRate}
        onIndexChange={(index) => {
          $iterationDecreaseRate = index;
        }}
      />
    </svelte:fragment>
  </Collapse>

  <Collapse>
    <span slot="label">Randomization</span>
    <svelte:fragment slot="content">
      <CheckboxGroup
        label="Edge Count (random graphs only)"
        values={edgeCount.choices}
        defaultIndex={$edgeCount}
        onIndexChange={(index) => {
          $edgeCount = index;
        }}
      />
    </svelte:fragment>
  </Collapse>
</div>
