import chroma from 'chroma-js';
import config from '../../tailwind.config';

export default class {
  private static randomRGBA(alpha?: number): string {
    const a = alpha || 0.2;
    const colors = [
      chroma(config.theme.extend.colors.override.blue).alpha(a).hex('rgba'),
      chroma(config.theme.extend.colors.override.yellow).alpha(a).hex('rgba'),
      chroma(config.theme.extend.colors.override.red).alpha(a).hex('rgba'),
      chroma(config.theme.extend.colors.override.purple).alpha(a).hex('rgba'),
    ];
    const colorIndex = Math.floor(Math.random() * (colors.length));
    return colors[colorIndex];
  }

  static generate(edgeCount: number): { edgeCount: number, nodeCount: number, code: string } {
    let output = '';
    // Create edges
    const nodesWithEdges = new Set<number>();
    const edges = new Set<string>();
    [...Array(edgeCount)].forEach(() => {
      let isValidEdge = false;
      while (!isValidEdge) {
        const tailId = Math.floor(Math.random() * (edgeCount - 2));
        const headId = Math.floor(Math.random() * (edgeCount - 1));
        const edgeId = `N${tailId}--N${headId}`;
        if ((tailId !== headId) && !edges.has(edgeId)) {
          nodesWithEdges.add(tailId);
          nodesWithEdges.add(headId);
          edges.add(edgeId);
          output += `${edgeId}  [line-width=3,color="${this.randomRGBA()}"]\n`;
          isValidEdge = true;
        }
      }
    });
    // Create nodes
    nodesWithEdges.forEach((_, index) => {
      const label = `label="Node with identifier: N${index}"`;
      const color = `color="${this.randomRGBA(0.6)}"`;
      output = `N${index} [${color},${label}]\n${output}`;
    });
    // Append the graph declaration to the top of output;
    output = `graph RandomGraph [bundle] {\n${output}`;
    output += '}';
    return {
      edgeCount,
      nodeCount: nodesWithEdges.size,
      code: output,
    };
  }
}
