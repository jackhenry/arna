/* eslint-disable max-len */
import { writable, type Writable } from 'svelte/store';
import RandomGraph from './random_graph';

const DEFAULT_EDGE_COUNT = 50;

export type GraphData = {
  edgeCount: number,
  nodeCount: number,
};

const initialGraphCode = RandomGraph.generate(DEFAULT_EDGE_COUNT);

function createCheckboxGroupDataStore(choices: number[], defaultIndex: number) {
  const { subscribe, update } = writable(defaultIndex > choices.length ? 0 : defaultIndex);

  return {
    subscribe,
    choices,
    set: (index: number) => update((current) => {
      if (index > choices.length) return current;
      return index;
    }),
  };
}

export const code: Writable<string> = writable(initialGraphCode.code);
export const graphData: Writable<GraphData> = writable(initialGraphCode);
export const showHelp: Writable<boolean> = writable(false);
export const showParameters: Writable<boolean> = writable(true);
export const edgeCount = createCheckboxGroupDataStore([10, 20, 30, 50, 75, 100, 200], 3);
/**
 * Graph Layout Algorithm Parameters
 */
export const iterations = createCheckboxGroupDataStore([300, 500, 700, 900, 1100, 1500], 3);
export const maxRepulsiveDistance = createCheckboxGroupDataStore([2, 4, 6, 8, 10, 12, 16, 20, 30], 4);
export const optimalDistance = createCheckboxGroupDataStore(maxRepulsiveDistance.choices, 3);
export const forceCoefficient = createCheckboxGroupDataStore([0.001, 0.005, 0.01, 0.05, 0.1, 0.2], 3);
/**
 * Edge Bundling Parameters
 */
export const initialStepSize = createCheckboxGroupDataStore([0.1, 0.2, 0.4, 0.6, 0.8, 0.99], 0);
export const compatabilityScore = createCheckboxGroupDataStore([0.01, 0.1, 0.2, 0.4, 0.6, 0.8, 0.99], 1);
export const bundlingStiffness = createCheckboxGroupDataStore([0.1, 0.2, 0.3, 0.5, 0.8, 0.99], 0);
export const initialSubdivisionRate = createCheckboxGroupDataStore([2, 3, 4, 5, 6], 0);
export const initialBundlingIterations = createCheckboxGroupDataStore([40, 50, 70, 90, 110, 130], 3);
export const iterationDecreaseRate = createCheckboxGroupDataStore([0.3, 0.4, 0.667, 0.7, 0.8], 3);
